import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const luciaImages = [
  "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FLucia_Caminos_01.f5023e0f.jpg&w=1920&q=75",
  "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FLucia_Caminos_02.f833743a.jpg&w=1920&q=75",
  "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FLucia_Caminos_03.e39f02a9.jpg&w=1920&q=75",
  "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FLucia_Caminos_04.76419a9d.jpg&w=1920&q=75",
  "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FLucia_Caminos_05.20831085.jpg&w=1920&q=75",
  "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FLucia_Caminos_06.a158f77c.jpg&w=1920&q=75"
];

const jasonImages = [
  "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FJason_Duval_01.6e287338.jpg&w=1920&q=75",
  "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FJason_Duval_02.c2f33c0d.jpg&w=1920&q=75",
  "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FJason_Duval_03.aaf481e5.jpg&w=1920&q=75",
  "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FJason_Duval_04.374574ad.jpg&w=1920&q=75",
  "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FJason_Duval_05.921c79be.jpg&w=1920&q=75",
  "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FJason_Duval_06.e498e308.jpg&w=1920&q=75"
];

export default function HomePage({ onNavigate }) {
  const [showAgeGate, setShowAgeGate] = useState(() => {
    return localStorage.getItem("doomsday_age_verified") !== "true";
  });

  if (showAgeGate) {
    return <AgeGate onConfirm={() => {
      localStorage.setItem("doomsday_age_verified", "true");
      setShowAgeGate(false);
    }} />;
  }

  return <MainContent onNavigate={onNavigate} />;
}

// Sub-component to handle hardware-accelerated image opacity for maximum scroll smoothness.
// By isolating opacity inside useTransform directly mapped to scroll, we skip the React render cycle completely.
function ScrubImage({ 
  progress, src, index, total, start, end 
}) {
  const step = (end - start) / (total - 1);
  const peak = start + index * step;
  
  // Crossfade logic: fade in from peak-step, peak at peak, fade out at peak+step
  let range = [peak - step, peak, peak + step];
  let opacities = [0, 1, 0];

  if (index === 0) {
    range = [0, peak, peak + step];
    opacities = [1, 1, 0];
  } else if (index === total - 1) {
    range = [peak - step, peak, 1];
    opacities = [0, 1, 1];
  }

  const opacity = useTransform(progress, range, opacities);

  return (
    <motion.img 
      src={src}
      className="absolute inset-0 w-full h-full object-cover"
      style={{ opacity, zIndex: index }}
    />
  );
}

function MainContent({ onNavigate }) {
  const containerRef = useRef(null);

  // useLayoutEffect runs BEFORE paint — framer-motion reads scroll AFTER this runs
  // This guarantees scrollYProgress starts at 0, not the previous page's scroll position
  useLayoutEffect(() => {
    // Reset scroll position synchronously before first paint
    window.scrollTo(0, 0);
    // Always show scrollbar to avoid layout shift when it appears/disappears
    document.documentElement.style.overflowY = 'scroll';
    document.body.style.overflowY = 'scroll';
    // Stable scrollbar gutter prevents fixed elements from being offset
    document.documentElement.style.scrollbarGutter = 'stable';
    return () => {
      document.documentElement.style.overflowY = '';
      document.body.style.overflowY = '';
      document.documentElement.style.scrollbarGutter = '';
      window.scrollTo(0, 0);
    };
  }, []);

  // Track the tall container element scrolling past the viewport (window scroll)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const bgGradient = useTransform(
    scrollYProgress,
    [0, 0.4, 0.8, 1],
    [
      "linear-gradient(to bottom, #10081e 0%, #3a1c4a 40%, #ff5e62 100%)",
      "linear-gradient(to bottom, #090412 0%, #1c0926 50%, #d83b6f 100%)",
      "linear-gradient(to bottom, #040108 0%, #0c0213 70%, #ff7b54 100%)",
      "linear-gradient(to bottom, #000000 0%, #050208 50%, #200f1c 100%)"
    ]
  );
  const videoContinuousOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.8, 0.4, 0.05]);

  // 1. HERO (Trailer 2 Poster)
  const heroOpacity = useTransform(scrollYProgress, [0.12, 0.18], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.1]);
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, -1000]);

  // 2. RELEASE DATE LOGO
  const releaseOpacity = useTransform(scrollYProgress, [0.12, 0.18, 0.25, 0.3], [0, 1, 1, 0]);
  const releaseY = useTransform(scrollYProgress, [0.1, 0.25], [200, -500]);
  const releaseScale = useTransform(scrollYProgress, [0.1, 0.25], [1.1, 0.95]);

  // 3. SYNOPSIS
  const synOpacity = useTransform(scrollYProgress, [0.25, 0.3, 0.4, 0.45], [0, 1, 1, 0]);
  const synY = useTransform(scrollYProgress, [0.25, 0.4], [150, -150]);
  const synScale = useTransform(scrollYProgress, [0.25, 0.4], [0.95, 1.05]);

  // 4. LUCIA
  const luciaSectionOpacity = useTransform(scrollYProgress, [0.4, 0.45, 0.6, 0.65], [0, 1, 1, 0]);
  const luciaTextX = useTransform(scrollYProgress, [0.4, 0.55], [-200, 0]);
  const luciaImageScale = useTransform(scrollYProgress, [0.4, 0.6], [1.1, 1.0]);
  
  // 5. JASON
  const jasonSectionOpacity = useTransform(scrollYProgress, [0.6, 0.65, 0.80, 0.86], [0, 1, 1, 0]);
  const jasonTextX = useTransform(scrollYProgress, [0.6, 0.75], [200, 0]);
  const jasonImageScale = useTransform(scrollYProgress, [0.6, 1.0], [1.1, 1.0]);

  // 6. CREDITS
  const creditsOpacity = useTransform(scrollYProgress, [0.86, 0.92], [0, 1]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black selection:bg-pink-500/30 font-sans"
      style={{ height: "1500vh" }}
    >
      <motion.div 
        className="fixed inset-0 z-0 pointer-events-none bg-black"
      >
        <motion.video 
          autoPlay loop muted playsInline 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: videoContinuousOpacity }}
          src="https://www.rockstargames.com/VI/_next/static/media/1920.9e163e21e3cac960f6850021aace5170.mp4"
          poster="https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2Fdesktop.910c8e19.jpg&w=1920&q=75"
        />
        <motion.div 
          className="absolute inset-0 mix-blend-multiply"
          style={{ background: bgGradient }}
        />
      </motion.div>
      
      <nav className="fixed top-0 w-full z-50 px-8 pt-8 pb-24 flex justify-between items-start bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-auto">
        <div className="text-3xl font-black tracking-widest text-white cursor-pointer hover:text-[#ffb8e0] transition-colors drop-shadow-lg" onClick={() => onNavigate('home')}>
          R★
        </div>
        <div className="hidden md:flex gap-10 text-xs font-bold tracking-[0.2em] uppercase text-white/90 pt-2">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('addfile'); }} className="hover:text-white transition-colors drop-shadow-md cursor-pointer pointer-events-auto">Analysis</a>
          <a href="#" className="hover:text-white transition-colors drop-shadow-md">Networks</a>
          <a href="#" className="hover:text-white transition-colors drop-shadow-md">Data</a>
          <a href="#" className="hover:text-white transition-colors drop-shadow-md">Support</a>
        </div>
        <button onClick={() => onNavigate('addfile')} className="px-6 py-3 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-yellow-300 transition-colors shadow-[0_0_20px_rgba(250,204,21,0.4)] pointer-events-auto cursor-pointer">
          Analyze Now
        </button>
      </nav>

      {/* 1. HERO */}
      <motion.section 
        className="fixed top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden z-10 pointer-events-none"
        style={{ opacity: heroOpacity }}
      >
        <motion.div 
          className="absolute inset-0 w-full h-full"
          style={{ scale: heroScale, y: heroY }}
        >
          {/* Parallax Layer 1: Background Docks */}
          <img 
            src="https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FHero_BG.d0b73d7a.jpg&w=1920&q=100" 
            alt="Hero Background" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
          />
          
          {/* Parallax Layer 2: Custom Text inserted natively between layers */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 -translate-y-[8vh]">
             <h1 className="text-transparent bg-clip-text bg-gradient-to-b from-white via-pink-200 to-orange-400 text-[18vw] md:text-[14vw] font-black tracking-tighter uppercase drop-shadow-[0_0_50px_rgba(255,123,84,0.6)] leading-none text-center">
                DOOMSDAY
             </h1>
          </div>

          {/* Parallax Layer 3: Characters */}
          <img 
            src="https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FHero_FG.3b6c0e26.png&w=1920&q=100" 
            alt="Hero Characters Foreground" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-20"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1b] via-transparent to-transparent pointer-events-none z-30" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 pointer-events-auto z-40">
            <div className="text-white text-[12px] font-black tracking-[0.4em] uppercase drop-shadow-md pb-4 pt-4 border-b border-white/30 hidden md:block">
              Scroll to Initialize Forensics
            </div>
            <div className="mt-4 animate-bounce hover:opacity-100 opacity-80 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* 2. RELEASE DATE LOGO -> PROJECT NAME LOGO */}
      <motion.section 
        className="fixed top-0 left-0 w-full h-screen flex flex-col items-center justify-center z-20 pointer-events-none px-6"
        style={{ opacity: releaseOpacity, y: releaseY, scale: releaseScale }}
      >
        <div className="relative flex justify-center items-center h-[40vh] mb-8">
           <h1 className="text-white text-5xl md:text-[5rem] font-black tracking-tighter text-center leading-[0.85] drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 block">
              FINANCIAL<br/>FORENSICS
           </h1>
           <div className="absolute text-[120px] md:text-[250px] font-black leading-none gta-text-gradient opacity-80 drop-shadow-[0_0_50px_rgba(255,123,84,0.6)] z-0 mix-blend-screen scale-125 translate-y-4">
              ENGINE
           </div>
        </div>
        <h2 className="text-[#e2506e] text-2xl md:text-3xl font-black uppercase tracking-[-0.03em] leading-normal drop-shadow-lg text-center gta-text-gradient">
          Exposing Money Muling<br />Networks
        </h2>
        <div className="flex gap-4 md:gap-8 items-center mt-12 opacity-80">
          <div className="text-white text-xs md:text-md font-bold tracking-[0.2em]">Graph Analysis</div>
          <div className="w-1 h-1 bg-white rounded-full" />
          <div className="text-white text-xs md:text-md font-bold tracking-[0.2em]">Transaction Data</div>
        </div>
        <div className="absolute bottom-12 flex justify-center w-full">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e2506e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce opacity-80"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </motion.section>

      {/* 3. SYNOPSIS */}
      <motion.section 
        className="fixed top-0 left-0 w-full h-screen flex items-center justify-center px-6 z-20 pointer-events-none"
        style={{ opacity: synOpacity, y: synY, scale: synScale }}
      >
        <div className="max-w-4xl mx-auto text-left space-y-8 bg-[#0f0c1b]/90 p-12 rounded-xl border border-white/5 shadow-[0_0_60px_rgba(0,0,0,0.8)]" style={{ willChange: 'transform' }}>
          <h2 className="text-[#ffb8e0] text-4xl md:text-6xl font-bold leading-tight drop-shadow-md tracking-tight uppercase">
            The Money Muling Problem.
          </h2>
          <p className="text-xl md:text-2xl text-[#f8a8b8] font-medium leading-relaxed drop-shadow-sm opacity-90">
            Money muling is a critical component of financial crime where criminals use networks of individuals ("mules") to transfer and layer illicit funds through multiple accounts. Traditional database queries fail to detect these sophisticated multi-hop networks.
          </p>
          <div className="flex justify-center mt-12">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffb8e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce opacity-80"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </motion.section>

      {/* 4. LUCIA */}
      <motion.section 
        className="fixed top-0 left-0 w-full h-screen flex items-center justify-center p-8 md:p-16 z-30 pointer-events-none"
        style={{ opacity: luciaSectionOpacity }}
      >
        <div className="w-full max-w-7xl h-[80vh] flex flex-col md:flex-row items-center gap-16">
          <motion.div 
            className="w-full md:w-1/2 h-full relative overflow-hidden rounded-md shadow-[0_30px_60px_rgba(0,0,0,0.9)]"
            style={{ scale: luciaImageScale }}
          >
            {luciaImages.map((src, i) => (
              <ScrubImage 
                key={src} src={src} index={i} total={luciaImages.length} 
                progress={scrollYProgress} start={0.45} end={0.55} 
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 p-10 z-20">
              <h3 className="text-white text-[3rem] md:text-[4rem] font-black uppercase tracking-wider mb-2 drop-shadow-2xl leading-none">Graph<br/>Analysis</h3>
              <p className="text-[#ffb8e0] text-xl font-bold tracking-[0.4em] uppercase drop-shadow-md">Detection // Network</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="w-full md:w-1/2 flex flex-col justify-center gap-6"
            style={{ x: luciaTextX, willChange: 'transform' }}
          >
            <p className="text-white/90 text-2xl leading-relaxed md:text-[1.7rem] font-medium drop-shadow-xl bg-[#0f0c1b]/90 p-10 rounded-2xl border border-white/5 shadow-2xl" style={{ willChange: 'transform' }}>
              Build a web-based Financial Forensics Engine that processes transaction data and exposes money muling networks through graph analysis and visualization.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* 5. JASON */}
      <motion.section 
        className="fixed top-0 left-0 w-full h-screen flex items-center justify-center p-8 md:p-16 z-30 pointer-events-none"
        style={{ opacity: jasonSectionOpacity }}
      >
        <div className="w-full max-w-7xl h-[80vh] flex flex-col md:flex-row-reverse items-center gap-16">
          <motion.div 
            className="w-full md:w-1/2 h-full relative overflow-hidden rounded-md shadow-[0_30px_60px_rgba(0,0,0,0.9)]"
            style={{ scale: jasonImageScale }}
          >
            {jasonImages.map((src, i) => (
              <ScrubImage 
                key={src} src={src} index={i} total={jasonImages.length} 
                progress={scrollYProgress} start={0.65} end={0.95} 
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
            <div className="absolute bottom-0 right-0 p-10 z-20 text-right">
              <h3 className="text-white text-[3rem] md:text-[4rem] font-black uppercase tracking-wider mb-2 drop-shadow-2xl leading-none">Transaction<br/>Data</h3>
              <p className="text-[#ffca58] text-xl font-bold tracking-[0.4em] uppercase drop-shadow-md">Processing // Layering</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="w-full md:w-1/2 flex flex-col justify-center text-right gap-6"
            style={{ x: jasonTextX, willChange: 'transform' }}
          >
            <p className="text-white/90 text-2xl leading-relaxed md:text-[1.7rem] font-medium drop-shadow-xl bg-[#0f0c1b]/90 p-10 rounded-2xl border border-white/5 shadow-2xl" style={{ willChange: 'transform' }}>
              Identify nodes and hidden connections. Criminals use intricate networks of accounts to transfer and layer illicit funds. The engine processes this raw transaction data to expose the hidden money muling rings that traditional systems completely miss.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* CREDITS — Full-screen cinematic section */}
      <motion.section
        className="fixed inset-0 w-full h-screen flex flex-col items-center justify-center z-40 overflow-hidden pointer-events-none"
        style={{ opacity: creditsOpacity }}
      >
        {/* Art background */}
        <img
          src="https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FHero_BG.d0b73d7a.jpg&w=1920&q=100"
          alt="Credits Background"
          className="absolute inset-0 w-full h-full object-cover opacity-30 scale-105"
          style={{ filter: 'hue-rotate(220deg) saturate(1.4) brightness(0.45)' }}
        />
        {/* dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 pointer-events-none" />

        {/* Content — centered with fixed width so scrollbar doesn't shift it */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-8" style={{ width: 'min(100vw - 40px, 900px)', textAlign: 'center' }}>

          {/* Project badge */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-[#ff6fa8] text-[11px] font-black tracking-[0.5em] uppercase">Financial Forensics Engine</p>
            <h2 className="text-white text-[3.5rem] md:text-[5rem] font-black tracking-tighter uppercase leading-none drop-shadow-[0_0_40px_rgba(255,111,168,0.5)]">
              DOOMSDAY
            </h2>
            <p className="text-white/40 text-xs tracking-[0.35em] uppercase">Exposing Money Muling Networks Through Graph Analysis</p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Team cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {[
              { handle: 'Not_dvdgamer2003', role: 'Lead Architect' },
              { handle: 'Siuuuutar',        role: 'Graph Analysis' },
              { handle: 'Alpha_09925',      role: 'Data Pipeline' },
              { handle: 'Random_Ass',       role: 'UI / Forensics' },
            ].map(({ handle, role }) => (
              <div
                key={handle}
                className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm shadow-[0_0_30px_rgba(255,111,168,0.08)]"
              >
                <div className="w-12 h-12 rounded-full border-2 border-[#ff6fa8]/60 bg-gradient-to-br from-[#ff6fa8]/30 to-[#ffca58]/20 flex items-center justify-center text-white font-black text-lg drop-shadow-md">
                  {handle[0].toUpperCase()}
                </div>
                <p className="text-white font-black text-sm tracking-wider uppercase">{handle}</p>
                <p className="text-[#ff6fa8] text-[10px] font-bold tracking-[0.3em] uppercase">{role}</p>
              </div>
            ))}
          </div>

          {/* Footer line */}
          <p className="text-white/20 text-[10px] tracking-[0.4em] uppercase">
            Built with React · Framer Motion · Graph Theory · 2025
          </p>
        </div>
      </motion.section>

    </div>
  );
}

// Age Gate Component
function AgeGate({ onConfirm }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className="max-w-md w-full p-8 text-center"
      >
        <div className="flex justify-center mb-10 text-white">
          <svg className="w-20 overflow-hidden" viewBox="0 0 464 454" fill="currentColor"><path d="M460.52 388L394.06 432.22l-10-90.87L286.26 317V17.06H460.52V388zM425.29 44.2h-111l-.47 218h46.66l5.77-51.56h59.18l-8 79.79 3.25-2.09 3-231.86ZM416 179h-44.49L367.6 144h49ZM91.44 382l49-3.79 38-34H269V17H4.51L19.26 211l35.86 52L24.51 432.22l66.93-50M247.34 329H130a132 132 0 0113.88 56L247 437V329ZM64.3 228.66A96 96 0 11210.74 135 96 96 0 0164.29 228.65Z"/></svg>
        </div>
        <h2 className="text-white text-2xl font-black uppercase tracking-widest mb-6">Age Verification</h2>
        <p className="text-[#a0a0a0] text-sm mb-10 leading-relaxed font-bold">
          This game may contain content not appropriate for all ages, or may not be appropriate for viewing at work.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={onConfirm}
            className="flex-1 py-5 bg-white text-black uppercase font-black tracking-widest rounded-sm hover:bg-[#e0e0e0] transition-colors cursor-pointer"
          >
            I am 18+
          </button>
        </div>
      </motion.div>
    </div>
  );
}
