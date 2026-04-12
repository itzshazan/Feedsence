import { useNavigate } from 'react-router-dom';
import TopNav from '@/components/TopNav';
import { useAuth } from '@/hooks/useAuth';
import { FEEDBACK_CATEGORIES, CAT_CONFIG } from '@/lib/constants';
import { ChevronRight } from 'lucide-react';

export default function Portal() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <div className="flex-1 flex items-center justify-center p-8">
        {/* Main panel — neumorphic with screws and vents */}
        <div className="shadow-neu-card neu-screws rounded-xl p-8 w-full max-w-[500px] bg-background animate-fade-in relative">

          {/* Vent slots — top right */}
          <div className="absolute top-5 right-8 flex gap-1">
            <div className="vent-slot" />
            <div className="vent-slot" />
            <div className="vent-slot" />
          </div>

          {/* Brand */}
          <div className="text-center mb-7">
            <div className="text-3xl font-extrabold tracking-tight">
              FEED<span className="text-primary">SENSE</span>
            </div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-2">
              Smart Feedback Classification System
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="led led-green w-1.5 h-1.5" />
              <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                GRU Neural Network · Real-time Dashboards
              </span>
            </div>
          </div>

          {/* Customer button */}
          <button
            onClick={() => navigate(user ? '/customer' : '/customer/auth')}
            className="group flex items-center gap-3.5 w-full p-4 rounded-lg shadow-neu-card bg-background transition-mechanical text-left mb-4 hover:-translate-y-0.5 hover:shadow-neu-floating active:translate-y-[1px] active:shadow-neu-pressed"
          >
            <div className="w-11 h-11 rounded-full bg-background shadow-neu-floating flex items-center justify-center text-primary shrink-0 transition-mechanical group-hover:scale-105 group-hover:rotate-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-foreground">Customer Portal</div>
              <div className="font-mono text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                Sign in · Submit & track feedback
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          {/* Groove divider */}
          <div className="groove my-5" />

          {/* Admin section label */}
          <div className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="led led-red w-1.5 h-1.5" />
            Admin Panels — Select Category
          </div>

          {/* Admin category grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {FEEDBACK_CATEGORIES.map(cat => {
              const cfg = CAT_CONFIG[cat];
              return (
                <button
                  key={cat}
                  onClick={() => navigate(`/admin/auth?category=${encodeURIComponent(cat)}`)}
                  className="group flex items-center gap-2.5 p-3 rounded-md shadow-neu-card bg-background transition-mechanical text-left hover:-translate-y-0.5 hover:shadow-neu-floating active:translate-y-[1px] active:shadow-neu-pressed"
                >
                  {/* Recessed icon housing */}
                  <div className={`w-8 h-8 rounded-full shadow-neu-recessed flex items-center justify-center text-[12px] shrink-0 ${cfg.bgClass}`}>
                    <span className={`w-2 h-2 rounded-full ${cfg.colorClass}`} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">{cat}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
