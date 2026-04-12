import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="shadow-neu-card neu-screws rounded-xl p-8 max-w-[400px] w-full bg-background text-center animate-fade-in relative">
        {/* Warning LED */}
        <div className="flex justify-center mb-4">
          <div className="w-4 h-4 rounded-full shadow-neu-floating flex items-center justify-center">
            <span className="led led-red w-2.5 h-2.5" />
          </div>
        </div>

        {/* 404 display — recessed screen */}
        <div className="shadow-neu-recessed rounded-lg p-6 mb-5 relative overflow-hidden">
          <div className="scanlines absolute inset-0 pointer-events-none opacity-20" />
          <div className="relative">
            <div className="font-mono text-6xl font-extrabold text-foreground tracking-tighter">404</div>
            <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mt-2">
              Page Not Found
            </div>
          </div>
        </div>

        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-5">
          The requested resource could not be located
        </div>

        <Button onClick={() => navigate('/')}>
          Return to Portal
        </Button>
      </div>
    </div>
  );
}
