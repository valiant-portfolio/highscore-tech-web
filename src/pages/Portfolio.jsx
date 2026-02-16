import React, { useState } from 'react';
import { 
  Lock,
  Shield,
  KeyboardArrowRight
} from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'animate.css';

// Styling Constants
const COLORS = {
  background: "bg-[#0B0C10]",
  cardBg: "bg-[#1F2833]/80",
  primary: "text-[#66FCF1]",
  secondary: "text-[#45A29E]",
  text: "text-[#C5C6C7]",
  border: "border-[#45A29E]/20"
};



function ProjectCard({ project, index }) {
  const displayImages = project.images && project.images.length > 0 
    ? project.images 
    : (project.thumbnail ? [project.thumbnail] : []);

  return (
    <div 
      className={`relative group rounded-xl overflow-hidden backdrop-blur-md border ${COLORS.border} transition-all duration-500 hover:shadow-[0_0_30px_rgba(102,252,241,0.15)] hover:border-[#66FCF1]/50 animate__animated animate__fadeInUp`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`${COLORS.cardBg} h-full flex flex-col`}>
        
        {/* Image Slider / Visual */}
        <div className="relative overflow-hidden aspect-video bg-black/50">
          {project.isPrivate ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm">
              <Shield className="text-slate-600 text-6xl mb-4 opacity-50" />
              <span className="text-xs font-mono text-slate-400 tracking-[0.3em] uppercase border border-slate-700 px-4 py-2 rounded-full">Confidential</span>
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              navigation={{
                nextEl: `.swiper-button-next-${index}`,
                prevEl: `.swiper-button-prev-${index}`,
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              loop={displayImages.length > 1}
              className="w-full h-full group/swiper"
            >
              {displayImages.map((img, idx) => (
                <SwiperSlide key={idx} className="relative w-full h-full bg-black">
                  {/* Blurred Background for Fill */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center blur-xl opacity-50"
                    style={{ backgroundImage: `url(${img})` }}
                  />
                  
                  {/* Main Image - Full Size / Contain */}
                  <img
                    src={img}
                    alt={`${project.title} screenshot ${idx + 1}`}
                    className="relative w-full h-full object-contain z-10"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/800x450/0B0C10/66FCF1?text=HighScore+Tech'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-transparent opacity-40 z-20 pointer-events-none"></div>
                </SwiperSlide>
              ))}
              
              {/* Custom Navigation (Hidden by default, visible on hover for desktop; always visible for touch) */}
              {displayImages.length > 1 && (
                <>
                  <div className={`swiper-button-prev-${index} absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm cursor-pointer transition-opacity opacity-100 md:opacity-0 md:group-hover/swiper:opacity-100 hover:bg-[#66FCF1] hover:text-black`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </div>
                  <div className={`swiper-button-next-${index} absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm cursor-pointer transition-opacity opacity-100 md:opacity-0 md:group-hover/swiper:opacity-100 hover:bg-[#66FCF1] hover:text-black`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </>
              )}
            </Swiper>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-20">
            <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-md uppercase tracking-wider shadow-lg">
              {project.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex flex-col flex-grow relative">
          <div className="flex justify-between items-start mb-4">
            <h3 className={`text-xl md:text-2xl font-bold text-white group-hover:text-[#66FCF1] transition-colors`}>
              {project.title}
            </h3>
            {project.isPrivate && <Lock className="text-[#45A29E] w-4 h-4" />}
          </div>
          
          <p className={`${COLORS.text} text-sm leading-relaxed mb-6 font-light line-clamp-3`}>
            {project.description}
          </p>
          
          <div className="mt-auto">
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map(tag => (
                <span key={tag} className="text-[10px] font-semibold text-[#45A29E] bg-[#45A29E]/10 px-2.5 py-1 rounded-md border border-[#45A29E]/20 uppercase tracking-wide">
                  {tag}
                </span>
              ))}
            </div>

            {project.isPrivate ? (
              <div className="w-full py-3 px-4 rounded-lg border border-dashed border-slate-700 text-slate-500 text-xs font-mono text-center uppercase tracking-widest cursor-not-allowed opacity-70">
                Restricted Access
              </div>
            ) : (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn flex items-center justify-center w-full py-3 px-4 rounded-lg bg-white/5 hover:bg-[#66FCF1] text-white hover:text-black border border-white/10 hover:border-[#66FCF1] transition-all duration-300 font-bold text-xs uppercase tracking-widest"
              >
                <span>View Case Study</span>
                <KeyboardArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HighScorePortfolio() {
  const [filter, setFilter] = useState('All');

  // I have moved Nanogames and Rainbet to the top of the array
  const projects = [
    {
      id: "nanogames",
      title: "Nanogames.io",
      description: "Pioneering social crypto gaming platform built with Provably Fair technology and a vibrant community ecosystem.",
      tags: ["Web3", "Gaming", "DeFi"],
      category: "Web3",
      link: "https://nanogames.io",
      thumbnail: "/assets/thumbnail/nano.png",
      images: ["/Screenshot_20260206-125739.png", "/Screenshot_20260206-171615.png", "/assets/thumbnail/nano.png","/Screenshot_20260206-172154.png"],
      gradient: "from-[#f97316] to-[#f59e0b]",
      isPrivate: false
    },
    {
      id: "rainbet",
      title: "Rainbet.com",
      description: "High-performance hybrid casino and sportsbook with integrated Esports hub and gamified RPG systems.",
      tags: ["Casino", "Solana", "Gaming"],
      category: "Gaming",
      link: "https://rainbet.com",
      thumbnail: "/assets/thumbnail/rain bet.png",
      images: ["/rainbet-img/Screenshot_20260206-174329.png", "/rainbet-img/Screenshot_20260206-174408.png", "/assets/thumbnail/rain bet.png","/rainbet-img/Screenshot_20260206-205931.png"],
      gradient: "from-[#ec4899] to-[#f97316]",
      isPrivate: false
    },
    {
      id: "lovemeet-web",
      title: "LoveMeet Website",
      description: "A high-conversion landing page and web platform for the LoveMeet ecosystem. Features integrated user dashboards and real-time analytics.",
      tags: ["Web3", "Next.js", "Tailwind"],
      category: "Web3",
      link: "https://lovemeetapp.com/",
      thumbnail: "/assets/thumbnail/lovemeet.png", 
      images: ["/lovemeet-img/Screenshot_20260206-211848.png", "/lovemeet-img/Screenshot_20260206-212508.png", "/assets/thumbnail/lovemeet.png"],
      gradient: "from-[#2563eb] to-[#06b6d4]",
      isPrivate: false
    },
    {
      id: "lovemeet-app",
      title: "LoveMeet Mobile",
      description: "Native iOS/Android social discovery app featuring real-time matching, push notifications, and high-performance UX.",
      tags: ["React Native", "Firebase", "Mobile"],
      category: "Mobile App",
      link: "https://lovemeetapp.com/",
      thumbnail: "/assets/thumbnail/lovemeet2.png",
      images: ["/lovemeet-png/iPhone-13-PRO-lovemeetapp.com.png", "/lovemeet-png/iPhone-13-PRO-lovemeetapp.com%20(1).png", "/assets/thumbnail/lovemeet2.png"],
      gradient: "from-[#7c3aed] to-[#ec4899]",
      isPrivate: false
    },
    {
      id: "corebanking",
      title: "CoreBanking Ledger",
      description: "Private high-security transaction engine for a major financial institution. Handles 10k+ TPS with multi-layer encryption.",
      tags: ["Fintech", "Security", "Backend"],
      category: "Web3",
      link: "https://baseella.com/",
      thumbnail: "/assets/thumbnail/baseella.png",
      images: ["/corebanking-png/iPhone-13-PRO-baseella.com%20(1).png", "/corebanking-png/iPhone-13-PRO-baseella.com%20(2).png", "/assets/thumbnail/baseella.png","/corebanking-png/iPhone-13-PRO-baseella.com.png"],
      gradient: "from-[#475569] to-[#1e293b]",
      isPrivate: false
    },
    {
      id: "fleet-ai",
      title: " AI Platform for Fleet",
      description: "We are on a mission to digitise fleet & logistics operations for businesses to improve efficiency, increase safety and reduce cost using IoT and AI.",
      tags: ["Mobile", "AI", "Fleet"],
      category: "Mobile App",
      link: "https://www.fleetx.io/",
      thumbnail: "/assets/thumbnail/fleetAI.png",
      images: ["/fleetAI/iPhone-13-PRO-www.fleetx.io.png", "/fleetAI/iPhone-13-PRO-www.fleetx.io%20(1).png", "/assets/thumbnail/fleetAI.png"],
      gradient: "from-[#0f172a] to-[#334155]",
      isPrivate: false
    },
    {
      id: "hirelocal",
      title: "HireLocalUSA.com",
      description: "Comprehensive local services marketplace connecting skilled professionals with businesses via robust verification.",
      tags: ["Marketplace", "B2B", "SEO"],
      category: "E-commerce",
      link: "https://www.hirelocalusa.com/",
      thumbnail: "/assets/thumbnail/HireLocalUSA.png",
      images: ["/hire-local-img/Screenshot_20260206-215033.png", "/hire-local-img/Screenshot_20260206-215140.png", "/assets/thumbnail/HireLocalUSA.png","/hire-local-img/Screenshot_20260206-215157.png"],
      gradient: "from-[#10b981] to-[#06b6d4]",
      isPrivate: false
    },
    {
      id: "wagergames",
      title: "Wagergames.casino",
      description: "Decentralized entertainment focusing on No-KYC privacy and high-volatility slot integration.",
      tags: ["Privacy", "Web3", "Casino"],
      category: "Gaming",
      link: "https://wagergames.casino",
      thumbnail: "/assets/thumbnail/wager.png",
      images: ["/wagergame-img/Screenshot_20260206-215515.png", "/wagergame-img/Screenshot_20260206-215535.png", "/assets/thumbnail/wager.png","/Screenshot_20260206-172154.png"],
      gradient: "from-[#4f46e5] to-[#7c3aed]",
      isPrivate: false
    },
    {
      id: "securepay",
      title: "SecurePay Gateway",
      description: "Confidential payment orchestration layer used to handle multi-currency settlements for high-volume retailers.",
      tags: ["Payments", "API", "B2B"],
      category: "E-commerce",
      link: "https://www.securepay.com.au/",
      thumbnail: "/assets/thumbnail/securepay.png",
      images: ["/securepay-png/iPhone-13-PRO-www.securepay.com.au%20(1).png", "/securepay-png/iPhone-13-PRO-www.securepay.com.au%20(2).png", "/assets/thumbnail/securepay.png","/securepay-png/iPhone-13-PRO-www.securepay.com.au.png"],
      gradient: "from-[#1e1b4b] to-[#312e81]",
      isPrivate: false
    },
    {
      id: "earnestmall",
      title: "EarnestMall.com",
      description: "Global e-commerce platform focused on trust, logistics efficiency, and sustainable commerce.",
      tags: ["E-commerce", "Logistics", "Payments"],
      category: "E-commerce",
      link: "https://earnestmall.com",
      thumbnail: "/assets/thumbnail/earnestmall.png",
      images: ["/ernestmall-png/Screenshot_20260207-121553.png", "/ernestmall-png/Screenshot_20260207-121541.png", "/assets/thumbnail/earnestmall.png","/ernestmall-png/Screenshot_20260207-121607.png"],
      gradient: "from-[#06b6d4] to-[#2563eb]",
      isPrivate: false
    },
    // --- New Web3 Projects (3) ---
    {
      id: "chainguard",
      title: "ChainGuard Auditor",
      description: "Automated smart contract auditing tool using AI to detect vulnerabilities in Solidity code before deployment.",
      tags: ["Web3", "Security", "AI"],
      category: "Web3",
      link: "https://www.chainguard.dev/",
      thumbnail: "/assets/thumbnail/chainguard.png",
      images: ["/chainguard.png/iPhone-13-PRO-www.chainguard.dev.png", "/chainguard.png/iPhone-13-PRO-www.chainguard.dev%20(2).png", "/assets/thumbnail/chainguard.png","/chainguard.png/iPhone-13-PRO-www.chainguard.dev%20(1).png"],
      gradient: "from-[#1e293b] to-[#334155]",
      isPrivate: false
    },
    {
      id: "tokensphere",
      title: "TokenSphere DEX",
      description: "Next-gen decentralized exchange with aggregated liquidity, limit orders, and gasless trading features.",
      tags: ["DeFi", "DEX", "Web3"],
      category: "Web3",
      link: "https://tokensphere.xyz/",
      thumbnail: "/assets/thumbnail/tokensphere.png",
      images: ["/Token-png/iPhone-13-PRO-tokensphere.xyz%20(1).png", "/Token-png/iPhone-13-PRO-tokensphere.xyz%20(2).png", "/assets/thumbnail/tokensphere.png","/Token-png/iPhone-13-PRO-tokensphere.xyz.png"],
      gradient: "from-[#6366f1] to-[#8b5cf6]",
      isPrivate: false
    },
    {
      id: "nft-mintpress",
      title: "NFT MintPress",
      description: "No-code NFT launchpad allowing creators to deploy smart contracts and minting pages in minutes.",
      tags: ["NFT", "No-Code", "Web3"],
      category: "Web3",
      link: "https://www.alchemy.com/",
      thumbnail: "/assets/thumbnail/mintpress.png",
      images: ["/mintprint-png/iPhone-13-PRO-www.alchemy.com%20(1).png", "/mintprint-png/iPhone-13-PRO-www.alchemy.com%20(2).png", "/assets/thumbnail/mintpress.png","/mintprint-png/iPhone-13-PRO-www.alchemy.com%20(2).png"],
      gradient: "from-[#ec4899] to-[#db2777]",
      isPrivate: false
    },
    // --- New Gaming Projects (4) ---
    {
      id: "reality-meta",
      title: "Reality Metaverse",
      description: "Immersive open-world MMORPG with player-owned economy and cross-chain asset interoperability.",
      tags: ["Metaverse", "MMO", "Gaming"],
      category: "Gaming",
      link: "https://realitymeta.io//",
      thumbnail: "/assets/thumbnail/realitymeta.png",
      images: ["/reality-png/iPhone-13-PRO-realitymeta.io%20(1).png", "/reality-png/iPhone-13-PRO-realitymeta.io%20(2).png", "/assets/thumbnail/realitymeta.png","/reality-png/iPhone-13-PRO-realitymeta.io.png"],
      gradient: "from-[#7c3aed] to-[#4f46e5]",
      isPrivate: false
    },
    {
      id: "esports-arena",
      title: "Esports Arena Pro",
      description: "Competitive gaming tournament platform with automated matchmaking and crypto prize pool distribution.",
      tags: ["Esports", "Tournaments", "Gaming"],
      category: "Gaming",
      link: "https://www.vresportarena.com/",
      thumbnail: "/assets/thumbnail/vresportarena.png",
      images: ["/esport/iPhone-13-PRO-www.vresportarena.com.png", "/esport/iPhone-13-PRO-www.vresportarena.com%20(1).png", "/assets/thumbnail/vresportarena.png","/esport/iPhone-13-PRO-www.vresportarena.com%20(2).png"],
      gradient: "from-[#dc2626] to-[#991b1b]",
      isPrivate: false
    },
    {
      id: "steampower",
      title: "Store Steampower",
      description: "Steam is the ultimate destination for playing, discussing, and creating games.",
      tags: ["RPG", "Indie", "Gaming"],
      category: "Gaming",
      link: "https://store.steampowered.com/",
      thumbnail: "/assets/thumbnail/teampower.png",
      images: ["/teampower-png/iPhone-13-PRO-store.steampowered.com%20(1).png", "/teampower-png/iPhone-13-PRO-store.steampowered.com%20(2).png", "/assets/thumbnail/teampower.png","/teampower-png/iPhone-13-PRO-store.steampowered.com.png"],
      gradient: "from-[#16a34a] to-[#15803d]",
      isPrivate: false
    },
    {
      id: "velocity-racer",
      title: "Velocity Racer",
      description: "High-fidelity arcade racing game with vehicle customization and multiplayer leaderboard integration.",
      tags: ["Racing", "Multiplayer", "Gaming"],
      category: "Gaming",
      link: "https://www.crazygames.com/",
      thumbnail: "/assets/thumbnail/velocityracer.png",
      images: ["/velocity-png/iPhone-13-PRO-www.crazygames.com%20(1).png", "/velocity-png/iPhone-13-PRO-www.crazygames.com%20(2).png", "/assets/thumbnail/velocityracer.png","/velocity-png/iPhone-13-PRO-www.crazygames.com.png"],
      gradient: "from-[#f59e0b] to-[#d97706]",
      isPrivate: false
    },
    {
      id: "bcgame",
      title: "BC.Game — Premier Crypto Casino & Betting Platform",
      description: "BC.Game is a cutting-edge online casino and sportsbook built for real-money gaming with cryptocurrencies",
      tags: ["Web3", "Casino", "Gaming"],
      category: "Gaming",
      link: "https://bc.game/",
      thumbnail: "/assets/thumbnail/bcgame.png",
      images: ["/Bc.casino/iPhone-13-PRO-bc.game (1).png","/Bc.casino/iPhone-13-PRO-bc.game (2).png","/assets/thumbnail/bcgame.png","/Bc.casino/iPhone-13-PRO-bc.game.png"],
      gradient: "from-[#22c55e] to-[#3b82f6]",
      isPrivate: false
    },
    // --- New E-commerce Projects (3) ---
    {
      id: "shopai",
      title: "ShopAI Assistant",
      description: "Intelligent virtual shopping assistant that recommends products based on user browsing history and preferences.",
      tags: ["AI", "Retail", "E-commerce"],
      category: "E-commerce",
      link: "https://www.algolia.com/",
      thumbnail: "/assets/thumbnail/shopai.png",
      images: ["/ShopAI-png/iPhone-13-PRO-www.algolia.com%20(1).png", "/ShopAI-png/iPhone-13-PRO-www.algolia.com%20(2).png", "/assets/thumbnail/shopai.png","/ShopAI-png/iPhone-13-PRO-www.algolia.com.png"],
      gradient: "from-[#0891b2] to-[#0e7490]",
      isPrivate: false
    },
    {
      id: "dropship-connect",
      title: "DropShip Connect",
      description: "All-in-one platform connecting suppliers with retailers for automated order fulfillment and inventory syncing.",
      tags: ["Dropshipping", "B2B", "Automation"],
      category: "E-commerce",
      link: "https://www.dropship.io/",
      thumbnail: "/assets/thumbnail/dropship.png",
      images: ["/dropship-png/iPhone-13-PRO-www.dropship.io%20(1).png", "/dropship-png/iPhone-13-PRO-www.dropship.io%20(2).png", "/assets/thumbnail/dropship.png","/dropship-png/iPhone-13-PRO-www.dropship.io.png"],
      gradient: "from-[#f43f5e] to-[#e11d48]",
      isPrivate: false
    },
    {
      id: "wholesale-hub",
      title: "Wholesale Hub",
      description: "Digital marketplace for bulk wholesale transactions featuring dynamic pricing and credit term management.",
      tags: ["Wholesale", "Marketplace", "B2B"],
      category: "E-commerce",
      link: "https://wholesalehub.org/",
      thumbnail: "/assets/thumbnail/wholesalehub.png",
      images: ["/bulkhub-png/iPhone-13-PRO-wholesalehub.org%20(1).png", "/bulkhub-png/iPhone-13-PRO-wholesalehub.org%20(2).png", "/assets/thumbnail/wholesalehub.png","/bulkhub-png/iPhone-13-PRO-wholesalehub.org.png"],
      gradient: "from-[#65a30d] to-[#4d7c0f]",
      isPrivate: false
    },
    // --- New Mobile App Projects (4) ---
    {
      id: "fittrack",
      title: "FitTrack Pro",
      description: "Comprehensive fitness tracking application with workout plans, nutrition logging, and wearable integration.",
      tags: ["Health", "Fitness", "Mobile"],
      category: "Mobile App",
      link: "https://tryfittrack.com/",
      thumbnail: "/assets/thumbnail/fittrack.png",
      images: ["/fittracker-png/iPhone-13-PRO-tryfittrack.com%20(1).png", "/fittracker-png/iPhone-13-PRO-tryfittrack.com.png", "/assets/thumbnail/fittrack.png"],
      gradient: "from-[#be123c] to-[#9f1239]",
      isPrivate: false
    },
    {
      id: "finpocket",
      title: "Softonic",
      description: "Softonic is a leading mobile app store that offers a vast catalog of apps for Android and iOS devices. It provides a secure and user-friendly platform for downloading, installing, and managing apps. Softonic also offers a range of features, such as in-app purchases, game achievements, and social media integration.",
      tags: ["Fintech", "Finance", "Mobile"],
      category: "Mobile App",
      link: "https://en.softonic.com/",
      thumbnail: "/assets/thumbnail/softonic.png",
      images: ["/softonic/iPhone-13-PRO-en.softonic.com (1).png", "/softonic/iPhone-13-PRO-en.softonic.com (2).png", "/assets/thumbnail/softonic.png","/softonic/iPhone-13-PRO-en.softonic.com.png"],
      gradient: "from-[#0f766e] to-[#0d9488]",
      isPrivate: false
    },
    {
      id: "travelmate",
      title: "TravelMate Guide",
      description: "AR-enabled travel companion app offering local guides, translation tools, and itinerary planning.",
      tags: ["Travel", "AR", "Mobile"],
      category: "Mobile App",
      link: "https://travelmate.tech/en",
      thumbnail: "/assets/thumbnail/travelmate.png",
      images: ["/assets/thumbnail/travelmate.png", "/travelmate-png/iPhone-13-PRO-travelmate.tech (1).png", "/travelmate-png/iPhone-13-PRO-travelmate.tech (2).png","/travelmate-png/iPhone-13-PRO-travelmate.tech.png"],
      gradient: "from-[#ea580c] to-[#c2410c]",
      isPrivate: false
    },
    {
      id: "Bitrix24",
      title: "Bitrix24",
      description: "Bitrix24’s goal is to bring people, tools, and information together in one place — so teams can collaborate, communicate,.",
      tags: ["Productivity", "SaaS", "Mobile"],
      category: "Mobile App",
      link: "https://www.bitrix24.com/",
      thumbnail: "/assets/thumbnail/bitri24.png",
      images: ["/assets/thumbnail/bitri24.png", "/Bitrix24-png/iPhone-13-PRO-www.bitrix24.com (1).png", "/Bitrix24-png/iPhone-13-PRO-www.bitrix24.com (2).png","/Bitrix24-png/iPhone-13-PRO-www.bitrix24.com.png"],
      gradient: "from-[#4338ca] to-[#3730a3]",
      isPrivate: false
    }
  ];

  const categories = ['All', 'Web3', 'Gaming', 'E-commerce', 'Mobile App'];
  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  return (
    <div className={`${COLORS.background} min-h-screen text-white font-sans selection:bg-[#66FCF1]/30 overflow-x-hidden`}>
      


      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#66FCF1]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#45A29E]/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#66FCF1]/30 bg-[#66FCF1]/5 backdrop-blur-sm mb-8 animate__animated animate__fadeInDown">
            <span className="w-1.5 h-1.5 bg-[#66FCF1] rounded-full mr-3 animate-pulse"></span>
            <span className="text-[#66FCF1] text-[10px] font-bold uppercase tracking-[0.2em]">Elite Digital Solutions</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 animate__animated animate__fadeInUp tracking-tight">
            <span className="text-white">High Score</span>
            <span className="block bg-gradient-to-r from-[#66FCF1] to-[#45A29E] bg-clip-text text-transparent mt-2">Technologies</span>
          </h1>

          <p className="max-w-2xl text-[#C5C6C7] text-lg md:text-xl font-light leading-relaxed mb-12 animate__animated animate__fadeInUp animate__delay-1s">
            Engineering premium digital experiences for forward-thinking enterprises. We build the future of Web3, Gaming, and mobile applications.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 animate__animated animate__fadeInUp animate__delay-1s">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all duration-300 border ${
                  filter === cat 
                  ? "bg-[#66FCF1] text-[#0B0C10] border-[#66FCF1] shadow-[0_0_20px_rgba(102,252,241,0.4)]" 
                  : "bg-transparent border-[#C5C6C7]/20 text-[#C5C6C7] hover:border-[#66FCF1] hover:text-[#66FCF1]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="pb-32 px-6 max-w-[1400px] mx-auto relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      <footer className="py-12 text-center border-t border-[#45A29E]/10 bg-[#0B0C10]">
        <div className="flex flex-col items-center justify-center">
            <div className="text-[#45A29E] text-xs font-bold uppercase tracking-[0.3em] mb-4">
                High Score Tech
            </div>
            <div className="text-[#C5C6C7]/50 text-[10px]">
                © {new Date().getFullYear()} All Rights Reserved.
            </div>
        </div>
      </footer>
    </div>
  );
}

export default React.memo(HighScorePortfolio);


