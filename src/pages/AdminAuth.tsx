import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import TopNav from '@/components/TopNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ADMIN_EMAILS_BY_CATEGORY, CAT_CONFIG, FEEDBACK_CATEGORIES, type FeedbackCategory } from '@/lib/constants';
import { toast } from 'sonner';

export default function AdminAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const category: FeedbackCategory = FEEDBACK_CATEGORIES.includes(categoryParam as FeedbackCategory)
    ? (categoryParam as FeedbackCategory)
    : 'Positive Feedback';
  const cfg = CAT_CONFIG[category];
  const allowedEmails = ADMIN_EMAILS_BY_CATEGORY[category] || [];
  const [loading, setLoading] = useState(false);

  const [lEmail, setLEmail] = useState('');
  const [lPass, setLPass] = useState('');
  const [lErr, setLErr] = useState('');

  const doLogin = async () => {
    setLErr('');
    const normalizedEmail = lEmail.trim().toLowerCase();
    const normalizedPassword = lPass.trim();
    if (!normalizedEmail || !normalizedPassword) { setLErr('Please enter your email and password.'); return; }

    const emailAllowed = allowedEmails.some(e => e.toLowerCase() === normalizedEmail);
    if (!emailAllowed) {
      setLErr(`Use an assigned ${category} admin email: ${allowedEmails.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: normalizedPassword });
      if (error) { setLErr(error.message); return; }

      const { data: profile, error: profileError } = await supabase
        .from('admin_profiles')
        .select('category')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (profileError) {
        setLErr(profileError.message);
        await supabase.auth.signOut();
        return;
      }

      if (!profile || profile.category !== category) {
        setLErr(`This account is not registered as a ${category} admin.`);
        await supabase.auth.signOut();
        return;
      }

      toast.success('Welcome! Loading dashboard…');
      navigate(`/admin/dashboard?category=${encodeURIComponent(category)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="shadow-neu-card neu-screws rounded-xl p-7 w-full max-w-[420px] bg-background animate-fade-in relative">

          {/* Vent slots */}
          <div className="absolute top-5 right-8 flex gap-1">
            <div className="vent-slot" />
            <div className="vent-slot" />
            <div className="vent-slot" />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-2xl font-extrabold tracking-tight">
              FEED<span className="text-primary">SENSE</span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${cfg?.colorClass}`} />
              <span className="text-sm font-bold text-foreground">{category} Admin</span>
            </div>
            <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mt-1">
              Admin panel for {category} feedback
            </div>
          </div>

          {/* Assigned email — recessed screen with scanlines */}
          <div className="shadow-neu-recessed rounded-md p-3 mb-5 relative overflow-hidden">
            <div className="scanlines absolute inset-0 pointer-events-none opacity-30" />
            <div className="relative">
              <div className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                Assigned Email
              </div>
              {allowedEmails.map(email => (
                <div key={email} className="font-mono text-[11px] text-foreground">{email}</div>
              ))}
            </div>
          </div>

          {/* Login form */}
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="led led-red w-1.5 h-1.5" />
              Sign in to the <span className="font-bold text-foreground">{category}</span> admin panel
            </div>
            <div>
              <Label className="mb-2 block">Email Address</Label>
              <Input value={lEmail} onChange={e => setLEmail(e.target.value)} type="email" placeholder="admin@feedsense.io" />
            </div>
            <div>
              <Label className="mb-2 block">Password</Label>
              <Input value={lPass} onChange={e => setLPass(e.target.value)} type="password" placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && doLogin()} />
            </div>
            {lErr && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 shadow-neu-recessed rounded-md p-3">
                <span className="led led-red w-2 h-2 shrink-0" />
                {lErr}
              </div>
            )}
            <Button onClick={doLogin} disabled={loading} className="mt-1">
              {loading ? <span className="spinner mr-2" /> : null}Sign in
            </Button>
          </div>

          <div className="text-center mt-5">
            <button onClick={() => navigate('/')} className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
              ← Back to portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
