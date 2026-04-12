import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import TopNav from '@/components/TopNav';
import CategoryBadge from '@/components/CategoryBadge';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { PRODUCT_CATEGORIES, FEEDBACK_CATEGORIES, CAT_CONFIG, type FeedbackCategory } from '@/lib/constants';
import { classifyWithGRU } from '@/lib/gru-classifier';
import { toast } from 'sonner';

interface CustomerProfile {
  first_name: string;
  last_name: string;
  age: number | null;
  gender: string | null;
}

interface Feedback {
  id: string;
  product_category: string;
  message: string;
  status: string;
  admin_note: string | null;
  gru_category: string;
  gru_confidence: number;
  gru_probs: Record<string, string> | null;
  created_at: string;
}

export default function CustomerDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileErr, setProfileErr] = useState('');
  const [tab, setTab] = useState<'submit' | 'history'>('submit');
  const [selectedProdCat, setSelectedProdCat] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastResult, setLastResult] = useState<{ category: FeedbackCategory; confidence: number; probs: Record<string, string> } | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/customer/auth');
  }, [authLoading, user]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileErr('');
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    supabase.from('customer_profiles').select('first_name, last_name, age, gender')
      .eq('user_id', user.id).maybeSingle().then(({ data, error }) => {
        if (error) {
          setProfile(null);
          setProfileErr(error.message);
          setProfileLoading(false);
          return;
        }

        if (!data) {
          setProfile(null);
          setProfileErr('No customer profile was found for this account.');
          setProfileLoading(false);
          return;
        }

        setProfile(data);
        setProfileErr('');
        setProfileLoading(false);
      });
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase.from('feedbacks')
      .select('id, product_category, message, status, admin_note, gru_category, gru_confidence, gru_probs, created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setFeedbacks(data as Feedback[]);
  };

  const submitFeedback = async () => {
    setErr('');
    if (!selectedProdCat) { setErr('Please select a product category.'); return; }
    if (!message.trim()) { setErr('Please write your feedback message.'); return; }
    if (!user || !profile) return;

    setSubmitting(true);
    try {
      const result = await classifyWithGRU(message);

      const safeCategory: FeedbackCategory = FEEDBACK_CATEGORIES.includes(result.category)
        ? result.category
        : 'Suggestion';
      const safeConfidence = Number.isFinite(result.confidence)
        ? Math.max(0, Math.min(100, Math.round(result.confidence)))
        : 72;
      const safeProbs = FEEDBACK_CATEGORIES.reduce((acc, c) => {
        const raw = Number.parseFloat(String(result.probs?.[c] ?? (c === safeCategory ? '100' : '0')));
        acc[c] = Number.isFinite(raw) ? raw.toFixed(1) : '0.0';
        return acc;
      }, {} as Record<string, string>);

      const { error } = await supabase.from('feedbacks').insert({
        user_id: user.id,
        customer_name: `${profile.first_name} ${profile.last_name}`,
        customer_email: user.email!,
        age: profile.age,
        gender: profile.gender,
        product_category: selectedProdCat,
        message: message.trim(),
        gru_category: safeCategory,
        gru_confidence: safeConfidence,
        gru_probs: safeProbs,
      });

      if (error) { setErr(error.message); return; }

      setLastResult({ category: safeCategory, confidence: safeConfidence, probs: safeProbs });
      setShowSuccess(true);
      toast.success('Feedback submitted successfully! ✅');
      loadHistory();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unable to process feedback right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setMessage('');
    setSelectedProdCat('');
    setShowSuccess(false);
    setLastResult(null);
    setErr('');
  };

  if (authLoading || profileLoading) {
    return <div className="flex flex-col min-h-screen"><TopNav /><div className="flex-1 flex items-center justify-center"><span className="spinner" /></div></div>;
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopNav />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="shadow-neu-card neu-screws rounded-xl p-6 w-full max-w-[460px] bg-background text-center animate-fade-in">
            <div className="text-base font-bold text-foreground">Customer profile not found</div>
            <div className="font-mono text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">
              {profileErr || 'Please sign in with a customer account, or create a new customer account.'}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <Button
                size="sm"
                onClick={async () => {
                  await signOut();
                  navigate('/customer/auth');
                }}
              >
                Sign in as customer
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/')}>
                Back to portal
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profileName = `${profile.first_name} ${profile.last_name}`;

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav profileName={profileName} />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Tab switcher — recessed groove */}
        <div className="max-w-[700px] mx-auto mb-5">
          <div className="shadow-neu-recessed rounded-lg p-1.5 flex gap-1 inline-flex">
            {(['submit', 'history'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider transition-mechanical ${
                  tab === t
                    ? 'shadow-neu-card text-foreground bg-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}>
                {t === 'submit' ? 'Submit Feedback' : 'My History'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'submit' && !showSuccess && (
          <div className="shadow-neu-card neu-screws rounded-xl p-6 max-w-[700px] mx-auto bg-background animate-slide-up flex flex-col gap-4 relative">

            {/* Vent slots */}
            <div className="absolute top-5 right-8 flex gap-1">
              <div className="vent-slot" />
              <div className="vent-slot" />
              <div className="vent-slot" />
            </div>

            <div className="groove" />
            <div className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Tell us about your experience
            </div>

            {/* GRU info banner — dark technical panel */}
            <div className="bg-industrial-charcoal rounded-lg p-3 flex items-center gap-3 relative overflow-hidden">
              <div className="scanlines absolute inset-0 pointer-events-none opacity-20" />
              <div className="relative flex items-center gap-3">
                <span className="led led-green w-2 h-2 shrink-0" />
                <span className="font-mono text-[10px] text-[#a8b2d1] uppercase tracking-wider">
                  GRU auto-classify
                </span>
                <span className="font-mono text-[10px] text-[#a8b2d1]/60">
                  Feedback type detected by neural network
                </span>
              </div>
            </div>

            {/* Product category */}
            <div>
              <div className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
                Product Category *
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PRODUCT_CATEGORIES.map(p => (
                  <button key={p.cat} onClick={() => setSelectedProdCat(p.cat)}
                    className={`flex items-center gap-2 p-3 rounded-md text-xs text-left transition-mechanical ${
                      selectedProdCat === p.cat
                        ? 'shadow-neu-pressed bg-background font-bold text-primary'
                        : 'shadow-neu-card bg-background hover:-translate-y-0.5 hover:shadow-neu-floating'
                    }`}>
                    <div className={`w-7 h-7 rounded-full shadow-neu-recessed flex items-center justify-center text-sm shrink-0 ${p.bgClass}`}>{p.icon}</div>
                    <span className="font-semibold text-foreground text-[11px]">{p.cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback message */}
            <div>
              <label className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Your Feedback *</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border-none bg-background px-4 py-3 font-mono text-sm shadow-neu-recessed placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_hsl(var(--primary))] resize-y leading-relaxed"
                placeholder="Describe your experience, issue, or suggestion…" />
            </div>

            {err && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 shadow-neu-recessed rounded-md p-3">
                <span className="led led-red w-2 h-2 shrink-0" />
                {err}
              </div>
            )}

            <Button onClick={submitFeedback} disabled={submitting}>
              {submitting ? <><span className="spinner mr-2" /> Running GRU Inference…</> : 'Submit Feedback'}
            </Button>

            <div className="font-mono text-[9px] text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
              <span className="led led-green w-1.5 h-1.5" />
              Feedback type auto-detected by GRU neural network
            </div>
          </div>
        )}

        {tab === 'submit' && showSuccess && lastResult && (
          <div className="shadow-neu-card neu-screws rounded-xl p-6 max-w-[700px] mx-auto bg-background animate-slide-up text-center relative">

            {/* Hanging hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-neu-recessed" />

            <div className="mt-4">
              <div className="w-14 h-14 rounded-full shadow-neu-floating bg-[hsl(var(--cat-positive-bg))] flex items-center justify-center mx-auto mb-4">
                <span className="led led-green w-3 h-3" />
              </div>
              <div className="text-lg font-bold mb-1">Thank you for your feedback!</div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-5">
                Our team will review it and reach out if needed
              </div>

              <div className="mb-5">
                <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-2">
                  GRU Classification Result
                </div>
                <CategoryBadge category={lastResult.category} size="md" />
                <div className="font-mono text-[10px] text-muted-foreground mt-1.5">
                  {lastResult.confidence}% confidence
                </div>
              </div>

              {/* Probability bars — level meter style */}
              <div className="text-left shadow-neu-recessed rounded-lg p-4 mb-5 relative overflow-hidden">
                <div className="scanlines absolute inset-0 pointer-events-none opacity-10" />
                <div className="relative">
                  <div className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    GRU Class Probabilities
                  </div>
                  {FEEDBACK_CATEGORIES.map(c => {
                    const pct = parseFloat(lastResult.probs[c]) || 0;
                    const isTop = c === lastResult.category;
                    const cfg = CAT_CONFIG[c];
                    return (
                      <div key={c} className="flex items-center gap-2 mb-1.5">
                        <div className={`w-[100px] font-mono text-[9px] text-right shrink-0 uppercase tracking-wider ${isTop ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{c}</div>
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
                          <div className={`h-full rounded-full transition-all duration-500 ${isTop ? cfg.colorClass : 'bg-muted-foreground/20'}`} style={{ width: `${Math.min(100, pct * 8)}%` }} />
                        </div>
                        <div className={`font-mono text-[9px] w-8 ${isTop ? cfg.textClass : 'text-muted-foreground'}`}>{pct}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <Button onClick={resetForm} size="sm">Submit another</Button>
                <Button variant="outline" size="sm" onClick={() => setTab('history')}>View history</Button>
              </div>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="max-w-[700px] mx-auto animate-fade-in">
            <div className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="led led-green w-1.5 h-1.5" />
              My Feedback History
            </div>
            {feedbacks.length === 0 ? (
              <div className="shadow-neu-card neu-screws rounded-xl p-10 bg-background text-center">
                <div className="text-4xl mb-3 grayscale">📭</div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  You haven't submitted any feedback yet
                </div>
                <div className="mt-4">
                  <Button size="sm" onClick={() => setTab('submit')}>Submit your first feedback</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {feedbacks.map(f => (
                  <div key={f.id} className="shadow-neu-card rounded-lg p-4 bg-background transition-mechanical hover:-translate-y-0.5 hover:shadow-neu-floating">
                    <div className="flex items-center gap-2.5 mb-2">
                      <CategoryBadge category={f.gru_category as FeedbackCategory} />
                      <StatusBadge status={f.status} />
                      <span className="ml-auto font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                        {new Date(f.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{f.product_category}</div>
                    <div className="text-[13px] text-foreground leading-relaxed">{f.message}</div>
                    {f.admin_note && (
                      <div className="mt-2 p-3 shadow-neu-recessed rounded-md text-xs text-muted-foreground leading-relaxed border-l-[3px] border-primary">
                        <strong>Admin reply:</strong> {f.admin_note}
                      </div>
                    )}
                    <div className="mt-2 font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                      GRU confidence: {f.gru_confidence}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
