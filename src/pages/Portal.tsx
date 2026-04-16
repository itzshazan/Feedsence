import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShieldCheck, Activity, ChevronRight } from 'lucide-react';

export default function Portal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = "";
    document.body.style.backgroundImage = "";
    // Extremely subtle global mount switch
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        body {
          /* Restore scrollability on mobile */
          overflow-y: auto;
          overflow-x: hidden;
        }
        @media (min-width: 1024px) {
          body {
            overflow: hidden;
          }
        }
        * {
          box-sizing: border-box;
        }
        .topbar {
          width: 100%;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          background: linear-gradient(90deg, #1c1f24, #2a2f36);
          color: #cbd5e1;
          font-size: 14px;
          letter-spacing: 0.08em;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
        }
        @media (min-width: 768px) {
          .topbar { height: 64px; padding: 0 32px; }
        }

        .left-nav {
          font-weight: 800;
          font-size: 22px;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          line-height: 1;
        }
        @media (min-width: 768px) { 
          .left-nav { 
            font-size: 30px; 
            letter-spacing: 0.06em;
          } 
        }
        
        .left-nav span {
          color: #ff4d4d;
        }
        .center-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-size: 9px;
        }
        @media (min-width: 768px) {
          .center-nav { gap: 8px; font-size: 14px; }
        }
        
        /* SYSTEM STATUS DOT PULSE */
        @keyframes dotAppear {
          0% { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: dotAppear 0.4s ease-out both, pulseGlow 1.5s infinite ease-out 0.5s;
        }
        @media (min-width: 768px) { .dot { width: 8px; height: 8px; } }
        
        .right-nav {
          color: #64748b;
          font-size: 9px;
          max-width: 100px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (min-width: 480px) { .right-nav { max-width: none; overflow: visible; } }
        @media (min-width: 768px) { .right-nav { font-size: 13px; } }
        
        .main-content {
          padding-top: 56px;
        }
        @media (min-width: 768px) { .main-content { padding-top: 80px; } }

        /* HARDWARE ENTRANCE STAGGERS */
        @keyframes fadeBlurUp {
          0% { opacity: 0; transform: translateY(40px); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes fadeUpText {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleFade {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideRightScale {
          0% { opacity: 0; transform: translateX(60px) scale(0.95); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideUpMobileScale {
          0% { opacity: 0; transform: translateY(60px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes btnReveal {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes singlePulse {
          0% { box-shadow: 0 0 0 0 rgba(232,57,42,0.4); }
          100% { box-shadow: 0 0 0 20px rgba(232,57,42,0); }
        }

        /* Mapped Timeline */
        .anim-hero-1 { animation: fadeBlurUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0ms both; }
        .anim-hero-2 { animation: fadeBlurUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 150ms both; }
        .anim-desc { animation: fadeUpText 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 300ms both; }
        
        .anim-stat-1 { animation: scaleFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) 500ms both; }
        .anim-stat-2 { animation: scaleFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) 620ms both; }
        .anim-stat-3 { animation: scaleFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) 740ms both; }
        
        .anim-graph-panel { animation: fadeBlurUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 600ms both; }
        
        /* Panel slides from bottom on mobile, right on desktop */
        .anim-panel { animation: slideUpMobileScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) 400ms both; }
        @media (min-width: 1024px) {
          .anim-panel { animation: slideRightScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) 400ms both; }
        }
        
        .anim-btn-wrap { animation: btnReveal 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 700ms both; }
        .anim-btn-glow { animation: singlePulse 0.8s ease-out 1.2s forwards; }

        .anim-cat-0 { animation: fadeUpText 0.5s ease-out 700ms both; }
        .anim-cat-1 { animation: fadeUpText 0.5s ease-out 780ms both; }
        .anim-cat-2 { animation: fadeUpText 0.5s ease-out 860ms both; }
        .anim-cat-3 { animation: fadeUpText 0.5s ease-out 940ms both; }
        .anim-cat-4 { animation: fadeUpText 0.5s ease-out 1020ms both; }
        .anim-cat-5 { animation: fadeUpText 0.5s ease-out 1100ms both; }

        /* LIVE TELEMETRY LINE DRAWING */
        @keyframes drawGraph {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        .graph-line {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawGraph 2s cubic-bezier(0.2, 0.8, 0.2, 1) 1.2s forwards;
        }

        /* GENTLE PREMIUM AMBIENT BACKGROUND */
        @keyframes bgShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .anim-bg-gradient {
          background: linear-gradient(-45deg, #e0e5ec, #ebf0f5, #e0e5ec);
          background-size: 400% 400%;
          animation: bgShift 15s ease infinite;
        }
      `}</style>
      
      <header className="topbar !transition-opacity !duration-700" style={{ opacity: mounted ? 1 : 0 }}>
        <div className="left-nav">
          FEED<span>SENSE</span>
        </div>
        <div className="center-nav">
          <span className="dot"></span>
          SYSTEM ONLINE
        </div>
        <div className="right-nav">
          GRU Neural Network Classifier
        </div>
      </header>

      {/* Level 0 Chassis Container */}
      <div className={`min-h-screen lg:h-screen w-full relative transition-opacity duration-700 font-sans text-foreground main-content anim-bg-gradient flex flex-col overflow-x-hidden overflow-y-auto ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* MAIN CONTAINER */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full min-h-full flex items-start lg:items-center justify-center py-8 lg:py-0">
          
          {/* TWO-COLUMN LAYOUT -> Mapped to Stacked on Mobile */}
          <div className="w-full flex flex-col lg:grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 lg:items-center">
            
            {/* LEFT SECTION */}
            <div className="w-full max-w-[580px] mx-auto lg:mx-0 flex flex-col items-start z-20">
              <div className="w-full text-left">
                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-[800] leading-[1.1] tracking-tighter mb-3 lg:mb-4 drop-shadow-[0_1px_1px_#ffffff]">
                  <span className="text-foreground block anim-hero-1">Smarter Feedback.</span>
                  <span className="text-primary block mt-1 anim-hero-2">Faster Decisions.</span>
                </h1>

                {/* Subtext */}
                <p className="text-sm sm:text-base lg:text-lg text-secondary/80 leading-relaxed mb-6 font-medium anim-desc">
                  Industrial-grade system that classifies and analyzes customer mechanical feedback in real-time using redundant GRU neural processors.
                </p>

                {/* Inline Stats Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:gap-12 mb-8 w-full select-none">
                  <div className="flex flex-col gap-1 anim-stat-1 text-left">
                    <span className="font-sans font-[800] text-2xl lg:text-3xl drop-shadow-[0_1px_1px_#ffffff]">98.4%</span>
                    <span className="font-mono text-[10px] lg:text-xs font-bold text-muted-foreground tracking-widest uppercase">Accuracy</span>
                  </div>
                  <div className="flex flex-col gap-1 anim-stat-2 text-left">
                    <span className="font-sans font-[800] text-2xl lg:text-3xl drop-shadow-[0_1px_1px_#ffffff]">&lt;50ms</span>
                    <span className="font-mono text-[10px] lg:text-xs font-bold text-muted-foreground tracking-widest uppercase">Latency</span>
                  </div>
                  <div className="flex flex-col gap-1 anim-stat-3 text-left">
                    <span className="font-sans font-[800] text-2xl lg:text-3xl drop-shadow-[0_1px_1px_#ffffff]">6</span>
                    <span className="font-mono text-[10px] lg:text-xs font-bold text-muted-foreground tracking-widest uppercase">Modules</span>
                  </div>
                </div>

                {/* Mechanical CRT Terminal */}
                <div className="w-full h-auto min-h-[160px] lg:min-h-[220px] rounded-lg shadow-neu-recessed bg-background relative overflow-hidden flex flex-col p-2 border-t-[2px] border-b-[2px] border-l-[2px] border-r-[2px] border-black/10 select-none anim-graph-panel">
                  {/* Scanlines overlay on top of the screen */}
                  <div className="absolute inset-0 scanlines opacity-60 pointer-events-none z-10 mix-blend-overlay"></div>
                  
                  {/* Terminal Screen inside Recess */}
                  <div className="flex-1 bg-industrial-charcoal rounded shadow-[inset_0_2px_15px_rgba(0,0,0,0.6)] relative overflow-hidden p-4 lg:p-5 flex flex-col justify-between group border border-black/40 min-h-[140px]">
                    {/* Red Glare */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[50px] pointer-events-none"></div>

                    <div className="flex justify-between items-start z-10 relative">
                      <div className="font-mono text-[9px] lg:text-xs font-bold text-primary tracking-widest uppercase shadow-neu-glow rounded-full px-2 py-0.5 border border-primary/20">
                        SYS_TRACKING // ACTIVE
                      </div>
                      <Activity className="text-primary w-4 h-4 animate-pulse opacity-80 mt-1" />
                    </div>
                    
                    <div className="flex justify-between items-end z-10 relative">
                       {/* Abstract Signal Wave */}
                       <svg className="h-[30px] lg:h-[40px] w-full max-w-[180px] opacity-80" viewBox="0 0 180 40" preserveAspectRatio="none">
                         <path className="graph-line" d="M0,20 L10,20 L20,5 L30,35 L40,20 L50,20 L60,10 L70,30 L80,20 L180,20" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                         <circle cx="20" cy="5" r="3" fill="hsl(var(--primary))" />
                         <circle cx="30" cy="35" r="3" fill="hsl(var(--primary))" />
                         <circle cx="70" cy="30" r="3" fill="hsl(var(--primary))" />
                       </svg>
                       
                       <div className="flex flex-col items-end gap-1 lg:gap-2">
                         <span className="px-1.5 lg:px-2 py-0.5 lg:py-1 bg-primary/10 border border-primary/20 rounded font-mono text-[8px] lg:text-[9px] text-primary/80 uppercase tracking-widest">NODE_ALFA</span>
                         <span className="px-1.5 lg:px-2 py-0.5 lg:py-1 bg-primary/10 border border-primary/20 rounded font-mono text-[8px] lg:text-[9px] text-primary/80 uppercase tracking-widest">NODE_BRAVO</span>
                       </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN (Mounted Control Panel) */}
            <div className="w-full flex justify-center self-center w-full z-20 pb-8 lg:pb-0">
              
              <div 
                className="w-full max-w-[480px] rounded-[1.5rem] bg-background p-6 lg:p-10 shadow-neu-card relative z-30 flex flex-col pointer-events-auto hover:-translate-y-[5px] transition-all duration-300 ease-out hover:shadow-xl anim-panel"
              >
                {/* Screws mapping */}
                <div className="absolute inset-x-0 inset-y-0 w-full h-full pointer-events-none neu-screws opacity-80 rounded-[1.5rem] overflow-hidden"></div>

                {/* Header Badge */}
                <div className="self-center px-4 py-1.5 rounded-full shadow-neu-recessed mb-6 lg:mb-8">
                  <span className="font-mono text-[9px] lg:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] relative top-[1px]">Control Matrix</span>
                </div>

                {/* Big Shiny Premium Button */}
                <div className="w-full mb-6 lg:mb-8 anim-btn-wrap">
                  <button 
                    onClick={() => navigate(user ? '/customer' : '/customer/auth')}
                    className="w-full relative shadow-neu-floating bg-primary hover:brightness-[1.05] hover:-translate-y-[2px] lg:hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(232,57,42,0.4)] active:scale-[0.97] transition-all duration-300 ease-out rounded-xl overflow-hidden py-4 lg:py-5 px-4 lg:px-6 group flex items-center justify-between border border-white/20 anim-btn-glow"
                  >
                     <div className="flex items-center gap-3 lg:gap-4 relative z-10 w-full">
                       <div className="w-8 h-8 lg:w-10 lg:h-10 shadow-[inset_1px_1px_5px_rgba(0,0,0,0.3)] rounded-lg bg-black/20 flex items-center justify-center shrink-0">
                          <ShieldCheck className="text-white w-4 h-4 lg:w-5 lg:h-5 stroke-[2px]" />
                       </div>
                       <div className="flex flex-col items-start gap-1 flex-1">
                         <div className="font-bold text-white text-sm lg:text-base tracking-wide drop-shadow-md">Engage Module</div>
                         <div className="font-mono text-[8px] lg:text-[9px] text-white/80 font-bold uppercase tracking-[0.15em] drop-shadow-sm line-clamp-1">Authenticate Unit</div>
                       </div>
                       <ChevronRight className="text-white opacity-80 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300 w-5 h-5 lg:w-6 lg:h-6 shrink-0" strokeWidth={2.5} />
                     </div>
                  </button>
                </div>
                
                {/* Divider line deep groove */}
                <div className="groove w-full mb-6 lg:mb-8"></div>

                <div className="text-center font-mono text-[9px] lg:text-[10px] uppercase font-bold text-muted-foreground tracking-[0.25em] mb-4 lg:mb-6 drop-shadow-[0_1px_0_#ffffff]">
                  Administrative Panels
                </div>

                {/* Grid Array */}
                <div className="grid grid-cols-2 gap-3 lg:gap-5 relative z-10">
                  {[
                    { label: 'Positive Feedback', shadow: 'rgba(34,197,94,0.6)', color: '#22c55e' },
                    { label: 'Negative Feedback', shadow: 'rgba(239,68,68,0.6)', color: '#ef4444' },
                    { label: 'Complaint', shadow: 'rgba(249,115,22,0.6)', color: '#f97316' },
                    { label: 'Suggestion', shadow: 'rgba(59,130,246,0.6)', color: '#3b82f6' },
                    { label: 'Product Issue', shadow: 'rgba(234,179,8,0.6)', color: '#eab308' },
                    { label: 'Service Issue', shadow: 'rgba(168,85,247,0.6)', color: '#a855f7' },
                  ].map((cat, i) => (
                    <div key={i} className={`anim-cat-${i} w-full`}>
                      <button 
                        onClick={() => navigate(`/admin/auth?category=${encodeURIComponent(cat.label)}`)}
                        className="w-full px-3 lg:px-4 py-3 lg:py-4 rounded-xl bg-background shadow-neu-card hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] active:scale-[0.98] active:translate-y-[2px] transition-all duration-[250ms] ease-out flex items-center justify-start group relative overflow-hidden text-left"
                      >
                        <div className="flex items-center gap-2 lg:gap-3 relative z-10 w-full">
                          {/* SVG Light Dot */}
                          <svg className="w-2.5 h-2.5 shrink-0 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)] rounded-full bg-[#1A2233]">
                            <circle cx="5" cy="5" r="5" fill={cat.color} style={{ filter: `drop-shadow(0 0 4px ${cat.shadow})` }} />
                          </svg>
                          <span className="font-sans text-[10px] md:text-xs lg:text-sm font-bold text-foreground truncate drop-shadow-[0_1px_0_#ffffff] group-active:drop-shadow-none transition-all duration-300 leading-tight block w-full">{cat.label}</span>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
