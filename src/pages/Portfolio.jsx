import React, { useState } from 'react';
import { 
  Launch,
  Lock,
  Shield
} from '@mui/icons-material';
import 'animate.css';

export default function HighScorePortfolio() {
  const [filter, setFilter] = useState('All');

  // I have moved Nanogames and Rainbet to the top of the array
  const projects = [
    {
      title: "Nanogames.io",
      description: "Pioneering social crypto gaming platform built with Provably Fair technology and a vibrant community ecosystem.",
      tags: ["Web3", "Gaming", "DeFi"],
      category: "Web3",
      link: "https://nanogames.io",
      thumbnail: "/assets/thumbnail/nano.png", // Replace with your high-res screenshot path
      gradient: "from-[#f97316] to-[#f59e0b]",
      isPrivate: false
    },
    {
      title: "Rainbet.com",
      description: "High-performance hybrid casino and sportsbook with integrated Esports hub and gamified RPG systems.",
      tags: ["Casino", "Solana", "Gaming"],
      category: "Gaming",
      link: "https://rainbet.com",
      thumbnail: "/assets/thumbnail/rain bet.png",// Replace with your high-res screenshot path
      gradient: "from-[#ec4899] to-[#f97316]",
      isPrivate: false
    },
    {
      title: "LoveMeet Website",
      description: "A high-conversion landing page and web platform for the LoveMeet ecosystem. Features integrated user dashboards and real-time analytics.",
      tags: ["Web3", "Next.js", "Tailwind"],
      category: "Web3",
      link: "https://lovemeetapp.com/",
      thumbnail: "/assets/thumbnail/lovemeet.png", 
      gradient: "from-[#2563eb] to-[#06b6d4]",
      isPrivate: false
    },
    {
      title: "LoveMeet Mobile",
      description: "Native iOS/Android social discovery app featuring real-time matching, push notifications, and high-performance UX.",
      tags: ["React Native", "Firebase", "Mobile"],
      category: "Mobile App",
      link: "https://lovemeetapp.com/",
      thumbnail: "/assets/thumbnail/lovemeet2.png",
      gradient: "from-[#7c3aed] to-[#ec4899]",
      isPrivate: false
    },
    {
      title: "CoreBanking Ledger",
      description: "Private high-security transaction engine for a major financial institution. Handles 10k+ TPS with multi-layer encryption.",
      tags: ["Fintech", "Security", "Backend"],
      category: "Web3",
      link: "#",
      thumbnail: null,
      gradient: "from-[#475569] to-[#1e293b]",
      isPrivate: true
    },
    {
      title: "Logistics Fleet AI",
      description: "Proprietary mobile solution for real-time driver tracking and AI-based route optimization for international logistics.",
      tags: ["Mobile", "AI", "Fleet"],
      category: "Mobile App",
      link: "#",
      thumbnail: null,
      gradient: "from-[#0f172a] to-[#334155]",
      isPrivate: true
    },
    {
      title: "HireLocalUSA.com",
      description: "Comprehensive local services marketplace connecting skilled professionals with businesses via robust verification.",
      tags: ["Marketplace", "B2B", "SEO"],
      category: "E-commerce",
      link: "https://www.hirelocalusa.com/",
      thumbnail: "/assets/thumbnail/HireLocalUSA.png",
      gradient: "from-[#10b981] to-[#06b6d4]",
      isPrivate: false
    },
    {
      title: "Wagergames.casino",
      description: "Decentralized entertainment focusing on No-KYC privacy and high-volatility slot integration.",
      tags: ["Privacy", "Web3", "Casino"],
      category: "Gaming",
      link: "https://wagergames.casino",
      thumbnail: "/assets/thumbnail/wager.png",
      gradient: "from-[#4f46e5] to-[#7c3aed]",
      isPrivate: false
    },
    {
      title: "SecurePay Gateway",
      description: "Confidential payment orchestration layer used to handle multi-currency settlements for high-volume retailers.",
      tags: ["Payments", "API", "B2B"],
      category: "E-commerce",
      link: "#",
      thumbnail: null,
      gradient: "from-[#1e1b4b] to-[#312e81]",
      isPrivate: true
    },
    {
      title: "EarnestMall.com",
      description: "Global e-commerce platform focused on trust, logistics efficiency, and sustainable commerce.",
      tags: ["E-commerce", "Logistics", "Payments"],
      category: "E-commerce",
      link: "https://earnestmall.com",
      thumbnail: "/assets/thumbnail/earnestmall.png",
      gradient: "from-[#06b6d4] to-[#2563eb]",
      isPrivate: false
    }
  ];

  const categories = ['All', 'Web3', 'Gaming', 'E-commerce', 'Mobile App'];
  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] min-h-screen text-white font-sans selection:bg-[#06b6d4]/30">
      
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#2563eb]/20 to-[#06b6d4]/20 border border-[#2563eb]/30 backdrop-blur-sm mb-8 animate__animated animate__fadeInDown">
            <span className="w-2 h-2 bg-[#06b6d4] rounded-full mr-3 animate-pulse"></span>
            <span className="text-[#60a5fa] text-sm font-medium uppercase tracking-widest">Digital Archive</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 animate__animated animate__fadeInUp">
            Project <span className="bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] bg-clip-text text-transparent">Showcase</span>
          </h1>

          <div className="flex flex-wrap justify-center gap-4 mb-12 animate__animated animate__fadeInUp animate__delay-1s">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 border backdrop-blur-md ${
                  filter === cat 
                  ? "bg-gradient-to-r from-[#2563eb] to-[#06b6d4] border-transparent shadow-lg scale-105" 
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-10 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <div 
              key={index}
              className={`relative group rounded-3xl p-px bg-gradient-to-br from-white/20 to-transparent transition-all duration-500 animate__animated animate__fadeInUp ${project.isPrivate ? '' : 'hover:from-[#06b6d4]/50'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-[#1a1a2e]/90 backdrop-blur-xl rounded-[23px] h-full overflow-hidden flex flex-col">
                
                {/* Visual Preview */}
                <div className={`relative overflow-hidden ${project.category === 'Mobile App' ? 'aspect-[4/5]' : 'aspect-video'} flex items-center justify-center ${project.isPrivate ? 'bg-[#0f172a]' : 'bg-slate-900'}`}>
                  {project.isPrivate ? (
                    <div className="text-center p-6 flex flex-col items-center">
                      <Shield className="text-slate-600 text-6xl mb-3 opacity-30 animate-pulse" />
                      <div className="text-[9px] font-mono text-slate-500 tracking-[0.3em] uppercase">Private Infrastructure</div>
                    </div>
                  ) : (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/800x450/1a1a2e/60a5fa?text=HighScore+Tech'; }}
                    />
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-lg bg-gradient-to-r ${project.gradient} text-white uppercase`}>
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${project.gradient} bg-clip-text text-transparent`}>
                    {project.title}
                  </h3>
                  <p className="text-[#94a3b8] text-sm leading-relaxed mb-6 flex-grow">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-bold text-[#60a5fa] bg-[#2563eb]/10 px-2 py-1 rounded-md border border-[#2563eb]/20 uppercase tracking-tighter">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {project.isPrivate ? (
                    <div className="inline-flex items-center justify-center space-x-2 w-full p-4 rounded-xl border border-white/5 bg-white/5 text-slate-500 font-bold text-xs uppercase cursor-not-allowed">
                      <Lock className="text-xs" />
                      <span>Confidential Access</span>
                    </div>
                  ) : (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-between w-full p-4 rounded-xl bg-gradient-to-r ${project.gradient} text-white font-bold text-xs uppercase tracking-widest hover:shadow-2xl hover:scale-[1.02] transition-all group/btn`}
                    >
                      Explore Project
                      <Launch className="text-sm group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-20 text-center text-slate-500 text-xs font-bold uppercase tracking-[0.4em]">
        © {new Date().getFullYear()} HighScore Tech. All Rights Reserved.
      </footer>
    </div>
  );
}