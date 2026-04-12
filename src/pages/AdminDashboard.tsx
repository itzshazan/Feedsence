import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import TopNav from '@/components/TopNav';
import CategoryBadge from '@/components/CategoryBadge';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FEEDBACK_CATEGORIES, PRODUCT_CATEGORIES, CAT_CONFIG, type FeedbackCategory } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search } from 'lucide-react';

interface AdminProfile {
  name: string;
  employee_id: string;
  category: string;
}

interface FeedbackRow {
  id: string;
  customer_name: string;
  customer_email: string;
  age: number | null;
  gender: string | null;
  product_category: string;
  message: string;
  status: string;
  admin_note: string | null;
  gru_category: string;
  gru_confidence: number;
  gru_probs: Record<string, string> | null;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'Positive Feedback';

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackRow[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [prodFilter, setProdFilter] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [selectedFb, setSelectedFb] = useState<FeedbackRow | null>(null);
  const [modalNote, setModalNote] = useState('');
  const [modalStatus, setModalStatus] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/');
  }, [authLoading, user]);

  useEffect(() => {
    if (!user) return;
    supabase.from('admin_profiles').select('name, employee_id, category')
      .eq('user_id', user.id).single().then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  const loadFeedbacks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('feedbacks')
      .select('*')
      .eq('gru_category', category)
      .order('created_at', { ascending: false });
    if (data) setFeedbacks(data as FeedbackRow[]);
  }, [user, category]);

  useEffect(() => { loadFeedbacks(); }, [loadFeedbacks]);

  const filtered = feedbacks.filter(f => {
    if (statusFilter !== 'All' && f.status !== statusFilter) return false;
    if (prodFilter && f.product_category !== prodFilter) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      if (!f.customer_name.toLowerCase().includes(q) && !f.customer_email.toLowerCase().includes(q) && !f.message.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const metrics = {
    total: feedbacks.length,
    open: feedbacks.filter(f => f.status === 'Open').length,
    progress: feedbacks.filter(f => f.status === 'In Progress').length,
    resolved: feedbacks.filter(f => f.status === 'Resolved').length,
  };

  const openModal = (fb: FeedbackRow) => {
    setSelectedFb(fb);
    setModalNote(fb.admin_note || '');
    setModalStatus(fb.status);
  };

  const saveReply = async () => {
    if (!selectedFb) return;
    const { error } = await supabase.from('feedbacks')
      .update({ admin_note: modalNote, status: modalStatus })
      .eq('id', selectedFb.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Feedback updated successfully.');
    setSelectedFb(null);
    loadFeedbacks();
  };

  if (authLoading || !profile) {
    return <div className="flex flex-col min-h-screen"><TopNav /><div className="flex-1 flex items-center justify-center"><span className="spinner" /></div></div>;
  }

  const cfg = CAT_CONFIG[category as FeedbackCategory];
  const statusItems = [
    { key: 'All', label: 'All Entries', dotClass: '' },
    { key: 'Open', label: 'Open', dotClass: 'bg-[hsl(var(--status-open))]' },
    { key: 'In Progress', label: 'In Progress', dotClass: 'bg-[hsl(var(--status-progress))]' },
    { key: 'Resolved', label: 'Resolved', dotClass: 'bg-[hsl(var(--status-resolved))]' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav profileName={profile.name} badgeLabel={category} />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Sidebar — dark technical panel */}
        <div className="w-full md:w-[220px] shrink-0 bg-industrial-charcoal flex flex-col border-r border-white/5">
          <div className="py-3 border-b border-white/5">
            <div className="font-mono text-[8px] font-bold text-[#a8b2d1]/60 uppercase tracking-widest px-4 pb-2">
              Filter by Status
            </div>
            {statusItems.map(s => (
              <button key={s.key} onClick={() => setStatusFilter(s.key)}
                className={`flex items-center gap-2 w-full px-4 py-2.5 font-mono text-[11px] transition-all border-l-2 ${
                  statusFilter === s.key
                    ? 'bg-white/5 text-primary border-l-primary font-bold'
                    : 'text-[#a8b2d1]/60 border-l-transparent hover:bg-white/5 hover:text-[#a8b2d1]'
                }`}>
                {s.dotClass ? <span className={`w-1.5 h-1.5 rounded-full ${s.dotClass} ${s.key !== 'Resolved' ? 'animate-led-pulse' : ''}`} /> : <span className="w-1.5 h-1.5" />}
                <span className="uppercase tracking-wider">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="py-3 border-b border-white/5">
            <div className="font-mono text-[8px] font-bold text-[#a8b2d1]/60 uppercase tracking-widest px-4 pb-2">
              Product Filter
            </div>
            <div className="px-3">
              <select value={prodFilter} onChange={e => setProdFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border-none bg-white/5 px-3 py-1 font-mono text-[10px] text-[#a8b2d1] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                <option value="" className="bg-industrial-charcoal">All products</option>
                {PRODUCT_CATEGORIES.map(p => <option key={p.cat} className="bg-industrial-charcoal">{p.cat}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-auto p-4 border-t border-white/5">
            <div className="font-mono text-[8px] text-[#a8b2d1]/40 uppercase tracking-widest mb-1">Signed in as</div>
            <div className="font-mono text-[12px] font-bold text-white">{profile.name}</div>
            <div className="font-mono text-[10px] text-[#a8b2d1]/60">{user?.email}</div>
            <div className="font-mono text-[9px] text-[#a8b2d1]/40 mt-0.5">ID: {profile.employee_id}</div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search bar */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <div className="relative max-w-[300px] flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search name, email, message…"
                className="pl-10 h-11 text-xs" />
            </div>
            <span className="ml-auto font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
              {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {/* Metrics — neumorphic gauge panels */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-b border-border">
            {[
              { label: 'Total', val: metrics.total, ledClass: 'led-green' },
              { label: 'Open', val: metrics.open, ledClass: 'led-yellow' },
              { label: 'In Progress', val: metrics.progress, ledClass: 'led-red' },
              { label: 'Resolved', val: metrics.resolved, ledClass: 'led-green' },
            ].map(m => (
              <div key={m.label} className="shadow-neu-card rounded-lg p-3.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`led ${m.ledClass} w-1.5 h-1.5`} />
                  <span className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{m.label}</span>
                </div>
                <div className="font-mono text-2xl font-extrabold text-foreground">{m.val}</div>
              </div>
            ))}
          </div>

          {/* Data table */}
          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3 grayscale">📭</div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  No feedback in this panel yet
                </div>
              </div>
            ) : (
              <div className="shadow-neu-card rounded-lg overflow-hidden">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-border">
                      {['Customer', 'Age/Gender', 'Product', 'GRU', 'Message', 'Status', 'Actions'].map(h => (
                        <th key={h} className="font-mono text-[8px] font-bold text-muted-foreground text-left p-3 uppercase tracking-widest bg-background sticky top-0 z-10">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(f => {
                      const initials = f.customer_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                      const dateStr = new Date(f.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                      return (
                        <tr key={f.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full shadow-neu-recessed flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${cfg?.bgClass} ${cfg?.textClass}`}>
                                {initials}
                              </div>
                              <div>
                                <div className="font-bold text-xs text-foreground">{f.customer_name}</div>
                                <div className="font-mono text-[9px] text-muted-foreground">{f.customer_email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[10px]">{f.age}<br /><span className="text-muted-foreground">{f.gender}</span></td>
                          <td className="p-3 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{f.product_category}</td>
                          <td className="p-3">
                            <CategoryBadge category={f.gru_category as FeedbackCategory} />
                            <div className="font-mono text-[8px] text-muted-foreground mt-0.5 uppercase tracking-wider">GRU · {f.gru_confidence}%</div>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate" title={f.message}>{f.message}</td>
                          <td className="p-3"><StatusBadge status={f.status} /></td>
                          <td className="p-3">
                            <Button size="sm" onClick={() => openModal(f)} className="text-[10px] h-8 px-3">
                              View
                            </Button>
                            <div className="font-mono text-[8px] text-muted-foreground mt-0.5 uppercase tracking-wider">{dateStr}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedFb} onOpenChange={(open) => !open && setSelectedFb(null)}>
        <DialogContent className="max-w-[540px] max-h-[90vh] overflow-y-auto">
          {selectedFb && (() => {
            const f = selectedFb;
            const initials = f.customer_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            const date = new Date(f.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full shadow-neu-recessed flex items-center justify-center font-mono text-sm font-bold ${cfg?.bgClass} ${cfg?.textClass}`}>
                      {initials}
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-[15px]">{f.customer_name}</DialogTitle>
                      <div className="font-mono text-[10px] text-muted-foreground">{f.customer_email}</div>
                    </div>
                    <div className="text-right">
                      <CategoryBadge category={f.gru_category as FeedbackCategory} />
                      <div className="font-mono text-[8px] text-muted-foreground mt-1 uppercase tracking-wider">GRU · {f.gru_confidence}%</div>
                    </div>
                  </div>
                </DialogHeader>

                {/* Info grid — recessed panel */}
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px] shadow-neu-recessed rounded-md p-3 mt-2">
                  <span className="text-muted-foreground uppercase tracking-wider">Age / Gender</span><span className="text-foreground">{f.age} · {f.gender}</span>
                  <span className="text-muted-foreground uppercase tracking-wider">Product</span><span className="text-foreground">{f.product_category}</span>
                  <span className="text-muted-foreground uppercase tracking-wider">Submitted</span><span className="text-foreground">{date}</span>
                  <span className="text-muted-foreground uppercase tracking-wider">Status</span><StatusBadge status={f.status} />
                </div>

                {/* GRU Probabilities */}
                {f.gru_probs && (
                  <div className="shadow-neu-recessed rounded-md p-3 mt-3 relative overflow-hidden">
                    <div className="scanlines absolute inset-0 pointer-events-none opacity-10" />
                    <div className="relative">
                      <div className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="led led-green w-1.5 h-1.5" />
                        GRU Class Probabilities
                      </div>
                      {FEEDBACK_CATEGORIES.map(c => {
                        const pct = parseFloat((f.gru_probs as Record<string, string>)[c]) || 0;
                        const isTop = c === f.gru_category;
                        const catCfg = CAT_CONFIG[c];
                        return (
                          <div key={c} className="flex items-center gap-2 mb-1">
                            <div className={`w-[90px] font-mono text-[9px] text-right shrink-0 uppercase tracking-wider ${isTop ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{c}</div>
                            <div className="flex-1 bg-muted rounded-full h-[5px] overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
                              <div className={`h-full rounded-full ${isTop ? catCfg.colorClass : 'bg-muted-foreground/20'}`} style={{ width: `${Math.min(100, pct * 8)}%` }} />
                            </div>
                            <div className={`font-mono text-[9px] w-8 ${isTop ? catCfg.textClass : 'text-muted-foreground'}`}>{pct}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Message — recessed display */}
                <div className="shadow-neu-recessed rounded-md p-4 mt-3 text-[13px] leading-relaxed text-foreground">{f.message}</div>

                {f.admin_note && (
                  <div className="text-xs p-3 shadow-neu-recessed rounded-md mt-2 leading-relaxed border-l-[3px] border-primary">
                    <strong>Admin note:</strong> {f.admin_note}
                  </div>
                )}

                {/* Reply input */}
                <div className="mt-3">
                  <div className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Reply / Internal Note</div>
                  <textarea value={modalNote} onChange={e => setModalNote(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border-none bg-background px-4 py-3 font-mono text-sm shadow-neu-recessed placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_hsl(var(--primary))] resize-y"
                    placeholder="Write a reply or internal note…" />
                </div>

                {/* Status update */}
                <div className="mt-3">
                  <div className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Update Status</div>
                  <div className="flex gap-2">
                    {['Open', 'In Progress', 'Resolved'].map(s => (
                      <button key={s} onClick={() => setModalStatus(s)}
                        className={`px-3 py-1.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider transition-mechanical ${
                          modalStatus === s
                            ? 'shadow-neu-pressed text-primary bg-background'
                            : 'shadow-neu-card text-muted-foreground bg-background hover:-translate-y-0.5'
                        }`}>
                        {s === 'In Progress' ? 'In Progress' : s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={saveReply} className="flex-1">Save & Close</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedFb(null)}>Cancel</Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
