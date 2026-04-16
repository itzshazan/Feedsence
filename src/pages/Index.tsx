import React from 'react';
import { Settings2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex bg-gradient-to-br from-[#eef2f7] to-[#f8f9fb] overflow-hidden relative">
      {/* Top Navbar */}
      <nav className="absolute top-0 left-0 w-full h-14 flex items-center px-8 z-20">
        <div className="flex-1 flex justify-start text-xl font-bold tracking-tight">
          <span className="text-black">FEED</span>
          <span className="text-[#ff4d4d]">SENSE</span>
        </div>
        <div className="flex-1 flex justify-center text-xs font-mono font-medium text-emerald-500 tracking-widest items-center gap-2 drop-shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)] animate-pulse"></span>
          SYSTEM ONLINE
        </div>
        <div className="flex-1 flex justify-end text-xs text-gray-400 font-mono tracking-wider">
          GRU Neural Network Classifier
        </div>
      </nav>

      {/* Left Section (Hero + Visual) */}
      <div className="w-[60%] h-full flex flex-col justify-center px-[4rem]">
        
        {/* Content */}
        <div className="relative z-20">
          <h1 className="text-5xl font-bold leading-tight text-slate-800">
            Smarter Feedback.<br />
            <span className="text-[#ff4d4d]">Faster Decisions.</span>
          </h1>
          <p className="text-gray-500 mt-4 max-w-md text-lg leading-relaxed font-medium">
            AI-powered system that classifies and analyzes customer feedback in real-time using GRU neural networks.
          </p>
        </div>

        {/* Background Visual */}
        <div className="absolute left-[15%] top-1/2 -translate-y-[45%] w-[85%] h-[85%] opacity-80 pointer-events-none -z-10 mix-blend-multiply flex items-center justify-center">
          <div className="relative w-full h-full flex justify-end">
            <img 
              src="/hero-illustration.png" 
              alt="AI Dashboard Visualization"
              className="w-full max-w-[800px] object-contain object-right drop-shadow-2xl translate-x-12"
            />
            {/* Glowing orbs for extra tech feel */}
            <div className="absolute top-1/4 right-1/4 w-[250px] h-[250px] bg-blue-300/30 rounded-full blur-[80px] mix-blend-multiply pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/3 w-[200px] h-[200px] bg-[#ff4d4d]/10 rounded-full blur-[80px] mix-blend-multiply pointer-events-none"></div>
          </div>
        </div>

      </div>

      {/* Right Section (Glass Panel UI) */}
      <div className="w-[40%] h-full flex items-center justify-center relative z-20 border-l border-white/20">
        <div className="w-[360px] rounded-3xl bg-white/40 backdrop-blur-xl shadow-2xl border border-white/40 p-6 flex flex-col relative overflow-hidden shrink-0">
          
          {/* Industrial details (Skeuomorphism hints) */}
          <div className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full border border-gray-300 shadow-inner bg-slate-200"></div>
          <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full border border-gray-300 shadow-inner bg-slate-200"></div>
          <div className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full border border-gray-300 shadow-inner bg-slate-200"></div>
          <div className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full border border-gray-300 shadow-inner bg-slate-200"></div>

          {/* Grip lines top right */}
          <div className="absolute top-[1.125rem] right-[1.75rem] flex flex-col gap-[3px] opacity-20">
            <div className="w-[2px] h-2 rounded-full bg-black"></div>
            <div className="w-[2px] h-2 rounded-full bg-black"></div>
            <div className="w-[2px] h-2 rounded-full bg-black"></div>
          </div>

          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-white/50 to-transparent pointer-events-none"></div>

          {/* Panel Header */}
          <div className="text-center mt-3 z-10">
            <div className="text-[1.35rem] font-bold tracking-tight mb-3">
              <span className="text-slate-800">FEED</span>
              <span className="text-[#ff4d4d]">SENSE</span>
            </div>
            <div className="text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">
              SMART FEEDBACK CLASSIFICATION SYSTEM
            </div>
            <div className="flex items-center justify-center gap-2 text-[9px] font-mono font-medium text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
              GRU NEURAL NETWORK &bull; REAL-TIME DASHBOARDS
            </div>
          </div>

          {/* Control Panel Button */}
          <button 
            onClick={() => navigate('/portal')}
            className="mt-5 p-4 rounded-xl bg-white/60 shadow flex items-center justify-between group hover:bg-white/80 transition-colors cursor-pointer border border-white/50 relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[0.55rem] bg-gray-50 flex items-center justify-center shadow-sm border border-gray-200/60 group-hover:bg-white transition-colors group-hover:scale-[1.02] transform duration-200">
                <Settings2 size={18} className="text-gray-700 stroke-[2px]" />
              </div>
              <div className="flex flex-col items-start gap-[2px]">
                <div className="font-semibold text-sm text-slate-800">Control Panel</div>
                <div className="text-[8px] font-bold tracking-widest text-gray-500">SIGN IN &bull; SUBMIT &amp; TRACK FEEDBACK</div>
              </div>
            </div>
            <ChevronRight className="text-gray-400 group-hover:text-slate-800 transition-colors group-hover:translate-x-0.5" size={18} />
          </button>

          {/* Divider */}
          <div className="my-[1.125rem] h-[1px] bg-gray-300/40 relative z-10"></div>
          
          <div className="text-center w-full mb-3 relative z-10">
            <span className="text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase">
              ADMIN PANELS &ndash; SELECT CATEGORY
            </span>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-2 gap-3 pb-2 relative z-10">
            {[
              { label: 'Positive Feedback', color: 'bg-emerald-500' },
              { label: 'Negative Feedback', color: 'bg-[#ff4d4d]' },
              { label: 'Complaint', color: 'bg-orange-500' },
              { label: 'Suggestion', color: 'bg-blue-500' },
              { label: 'Product Issue', color: 'bg-yellow-400' },
              { label: 'Service Issue', color: 'bg-purple-500' },
            ].map((cat, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/60 shadow flex items-center gap-2.5 hover:bg-white/80 transition-colors cursor-pointer border border-white/50 group">
                <div className={`w-[9px] h-[9px] rounded-full ${cat.color} shadow-sm group-hover:scale-110 transition-transform duration-200`}></div>
                <span className="text-[12px] font-medium text-slate-700 whitespace-nowrap">{cat.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Index;
