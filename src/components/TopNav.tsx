import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface TopNavProps {
  profileName?: string;
  badgeLabel?: string;
}

export default function TopNav({ profileName, badgeLabel }: TopNavProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initials = profileName
    ? profileName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <nav className="bg-industrial-charcoal flex items-center gap-3 h-14 px-5 shrink-0 border-b border-[rgba(255,255,255,0.08)]">
      {/* Brand: FeedSense */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 group"
      >
        <span className="text-xl font-extrabold tracking-tight text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          FEED<span className="text-primary">SENSE</span>
        </span>
      </button>

      <div className="w-px h-7 bg-white/10" />

      {/* System status */}
      <div className="flex items-center gap-2">
        <span className="led led-green w-2 h-2" />
        <span className="font-mono text-[10px] text-[#a8b2d1] uppercase tracking-widest">
          System Online
        </span>
      </div>

      <div className="w-px h-7 bg-white/10 hidden md:block" />

      <span className="font-mono text-[11px] text-[#a8b2d1]/60 hidden md:inline">
        GRU Neural Network Classifier
      </span>

      <div className="ml-auto flex items-center gap-2">
        {user && profileName && (
          <>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 transition-colors hover:border-primary/40">
              {/* Avatar housing */}
              <div className="w-7 h-7 rounded-full bg-background shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-1px_-1px_2px_rgba(255,255,255,0.1)] flex items-center justify-center text-[10px] font-bold text-foreground">
                {initials}
              </div>
              <span className="font-mono text-[11px] text-[#e0e5ec] max-w-[120px] truncate">
                {profileName.split(' ')[0]}
              </span>
              {badgeLabel && (
                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm bg-primary/20 text-primary uppercase tracking-wider">
                  {badgeLabel}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-[10px] text-[#a8b2d1] bg-transparent hover:bg-white/5 hover:text-white normal-case tracking-normal"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Sign out
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
