import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, SportsEsports, CheckCircle, Casino, Security, Wallet } from '@mui/icons-material';
import { useSEO } from '../../hooks/useSEO';

export default function IGamingDetail() {
  const navigate = useNavigate();

  useSEO({
    title: "HighScore Tech iGaming Development | Crash Games, Slots, Casino Platforms | Nigeria",
    description: "HighScore Tech is Nigeria's premier iGaming platform development company specializing in Crash Games, Slots, Blackjack, Plinko, Mines, Dice with provably fair systems and crypto integration. Leading casino game development in Lagos.",
    keywords: "HighScore Tech iGaming Nigeria, crash game development Lagos, casino platform development Nigeria, HighScore provably fair games, premier iGaming company Nigeria, leading casino software Nigeria, HighScore gambling platform",
    canonical: "https://www.highzcore.tech/services/igaming",
    ogTitle: "HighScore Tech iGaming Development | Premier Casino Platform Development Nigeria",
    ogDescription: "Nigeria's leading iGaming development company. HighScore Tech builds custom casino platforms, crash games, and provably fair gambling systems.",
    ogImage: "https://www.highzcore.tech/images/igaming-og.jpg",
    ogUrl: "https://www.highzcore.tech/services/igaming"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#2563eb] to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#06b6d4] to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-[#06b6d4] hover:text-white transition-colors duration-300 mb-8"
          >
            <ArrowBack className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#2563eb]/20 to-[#06b6d4]/20 border border-[#2563eb]/30 backdrop-blur-sm mb-6">
                <SportsEsports className="w-5 h-5 text-[#06b6d4] mr-3" />
                <span className="text-[#60a5fa] text-sm font-medium">iGaming Solutions</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                iGaming Platform 
                <span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent"> Development</span>
              </h1>

              <p className="text-xl text-[#e2e8f0] leading-relaxed mb-8">
                HighScore Tech is Nigeria's leading iGaming platform development company, specializing in creating 
                cutting-edge online gaming experiences that captivate players and drive revenue growth.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-[#2563eb] text-2xl font-bold">50+</div>
                  <div className="text-[#94a3b8] text-sm">Games Built</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-[#06b6d4] text-2xl font-bold">99.9%</div>
                  <div className="text-[#94a3b8] text-sm">Uptime</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-[#10b981] text-2xl font-bold">24/7</div>
                  <div className="text-[#94a3b8] text-sm">Support</div>
                </div>
              </div>
            </div>

            {/* Image/Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#2563eb]/20 to-[#06b6d4]/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  {['🎰', '🎲', '♠️', '🃏', '💎', '🎯'].map((emoji, index) => (
                    <div key={index} className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-300">
                      <div className="text-4xl mb-2">{emoji}</div>
                      <div className="text-white text-sm font-medium">
                        {['Slots', 'Dice', 'Blackjack', 'Poker', 'Mines', 'Plinko'][index]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Content */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Game Portfolio */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              Our <span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent">Game Portfolio</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Crash Games",
                  description: "High-energy multiplier games where players cash out before the crash. Features real-time multiplayer action, provably fair algorithms, and customizable betting limits.",
                  features: ["Real-time Multiplayer", "Provably Fair", "Auto Cash-out", "Live Chat"]
                },
                {
                  title: "Slot Machines",
                  description: "Immersive slot games with stunning graphics, multiple paylines, bonus rounds, and progressive jackpots. Built with HTML5 for smooth gameplay across all devices.",
                  features: ["Progressive Jackpots", "Bonus Rounds", "Free Spins", "Multiple Themes"]
                },
                {
                  title: "Blackjack",
                  description: "Classic blackjack with multiple variants, side bets, and live dealer options. Features perfect basic strategy implementation and card counting protection.",
                  features: ["Multiple Variants", "Side Bets", "Live Dealers", "Tournament Mode"]
                },
                {
                  title: "Plinko",
                  description: "Physics-based Plinko games with customizable risk levels and payout multipliers. Features smooth ball physics and engaging visual effects.",
                  features: ["Physics Engine", "Risk Levels", "Auto Play", "Multipliers"]
                },
                {
                  title: "Mines",
                  description: "Strategic mine-finding games with increasing multipliers and tension. Players reveal tiles while avoiding hidden mines for bigger payouts.",
                  features: ["Strategic Gameplay", "Increasing Multipliers", "Custom Grid Size", "Reveal Patterns"]
                },
                {
                  title: "Dice Games",
                  description: "Traditional and modern dice games with customizable odds and betting strategies. Features auto-betting and statistical tracking.",
                  features: ["Custom Odds", "Auto Betting", "Statistics", "Hot/Cold Streaks"]
                }
              ].map((game, index) => (
                <div key={index} className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#2563eb]/30 transition-all duration-300">
                  <h3 className="text-xl font-bold text-white mb-3">{game.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{game.description}</p>
                  <div className="space-y-2">
                    {game.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-[#10b981]" />
                        <span className="text-gray-400 text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Features */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              Technical <span className="bg-gradient-to-r from-[#06b6d4] to-[#2563eb] bg-clip-text text-transparent">Excellence</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-[#2563eb]/10 to-[#06b6d4]/10 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                <Security className="w-12 h-12 text-[#2563eb] mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Provably Fair Gaming</h3>
                <p className="text-gray-300 mb-4">
                  Our games implement cryptographically secure provably fair algorithms that allow players to verify the fairness of every game round. 
                  We use SHA-256 hashing and client-server seed generation to ensure complete transparency and trust.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• SHA-256 cryptographic hashing</li>
                  <li>• Client-server seed verification</li>
                  <li>• Real-time fairness checking</li>
                  <li>• Transparent algorithm disclosure</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#06b6d4]/10 to-[#10b981]/10 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                <Wallet className="w-12 h-12 text-[#06b6d4] mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Crypto Integration</h3>
                <p className="text-gray-300 mb-4">
                  Seamless cryptocurrency wallet integration supporting Bitcoin, Ethereum, USDT, and other popular cryptocurrencies. 
                  Features instant deposits, fast withdrawals, and real-time balance updates.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Multi-currency support</li>
                  <li>• Instant deposit confirmation</li>
                  <li>• Fast withdrawal processing</li>
                  <li>• Real-time balance sync</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#10b981]/10 to-[#f59e0b]/10 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                <Casino className="w-12 h-12 text-[#10b981] mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Real-time Multiplayer</h3>
                <p className="text-gray-300 mb-4">
                  Advanced WebSocket infrastructure enabling real-time multiplayer gaming experiences with low latency, 
                  synchronized game states, and live chat functionality for enhanced player engagement.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• WebSocket real-time communication</li>
                  <li>• Synchronized game states</li>
                  <li>• Live chat integration</li>
                  <li>• Low latency performance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-gradient-to-r from-[#2563eb]/10 to-[#06b6d4]/10 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Why Choose HighScore Tech for iGaming Development?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Industry Expertise</h3>
                <p className="text-gray-300 mb-6">
                  With years of experience in the iGaming industry, we understand the unique challenges and requirements of 
                  online gaming platforms. Our team has built over 50 successful gaming products, from simple dice games 
                  to complex multi-player casino environments.
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-4">Regulatory Compliance</h3>
                <p className="text-gray-300 mb-6">
                  Our platforms are built with regulatory compliance in mind, featuring comprehensive audit trails, 
                  responsible gaming tools, anti-money laundering (AML) features, and Know Your Customer (KYC) integration 
                  to meet international gaming regulations.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Scalable Architecture</h3>
                <p className="text-gray-300 mb-6">
                  Our iGaming platforms are built on cloud-native architectures that can handle millions of concurrent players. 
                  We use microservices, load balancing, and CDN integration to ensure your platform performs flawlessly 
                  even during peak traffic periods.
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-4">Complete Solutions</h3>
                <p className="text-gray-300">
                  From game development and platform architecture to payment processing and customer support tools, 
                  we provide end-to-end iGaming solutions. Our platforms include admin dashboards, player management systems, 
                  financial reporting, and comprehensive analytics.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <button 
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Start Your iGaming Project
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
