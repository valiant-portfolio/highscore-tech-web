import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, CurrencyBitcoin, Security, TrendingUp, AccountBalance, Speed, Shield } from '@mui/icons-material';
import { useSEO } from '../../hooks/useSEO';

export default function CryptoExchangeDetail() {
  const navigate = useNavigate();

  useSEO({
    title: "HighScore Tech Crypto Exchange Development | Secure Trading Platforms | Nigeria",
    description: "HighScore Tech builds secure, scalable cryptocurrency exchange platforms with advanced trading features and enterprise-grade security. Premier crypto exchange development company in Nigeria serving global markets.",
    keywords: "HighScore Tech crypto exchange Nigeria, cryptocurrency trading platform Lagos, HighScore blockchain development, premier crypto exchange Nigeria, leading cryptocurrency platform Nigeria, HighScore trading software",
    canonical: "https://www.highzcore.tech/services/crypto-exchange",
    ogTitle: "HighScore Tech Crypto Exchange Development | Secure Trading Platform Solutions",
    ogDescription: "Leading cryptocurrency exchange development company in Nigeria. HighScore Tech builds secure, scalable trading platforms with enterprise-grade security.",
    ogImage: "https://www.highzcore.tech/images/crypto-exchange-og.jpg",
    ogUrl: "https://www.highzcore.tech/services/crypto-exchange"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#f97316] to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#f59e0b] to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-[#f97316] hover:text-white transition-colors duration-300 mb-8"
          >
            <ArrowBack className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#f97316]/20 to-[#f59e0b]/20 border border-[#f97316]/30 backdrop-blur-sm mb-6">
                <CurrencyBitcoin className="w-5 h-5 text-[#f97316] mr-3" />
                <span className="text-[#f97316] text-sm font-medium">Crypto Trading Solutions</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                Cryptocurrency 
                <span className="bg-gradient-to-r from-[#f97316] to-[#f59e0b] bg-clip-text text-transparent"> Exchange Development</span>
              </h1>

              <p className="text-xl text-[#e2e8f0] leading-relaxed mb-8">
                Build secure, scalable cryptocurrency exchange platforms with HighScore Tech. We deliver enterprise-grade 
                trading solutions with advanced security, multi-currency support, and high-performance architecture.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-[#f97316] text-2xl font-bold">99.9%</div>
                  <div className="text-[#94a3b8] text-sm">Uptime SLA</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-[#f59e0b] text-2xl font-bold">10ms</div>
                  <div className="text-[#94a3b8] text-sm">Avg Latency</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-[#10b981] text-2xl font-bold">100K+</div>
                  <div className="text-[#94a3b8] text-sm">TPS Capacity</div>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#f97316]/20 to-[#f59e0b]/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  {['₿', '⟠', '💰', '📊', '🔒', '⚡'].map((emoji, index) => (
                    <div key={index} className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-300">
                      <div className="text-4xl mb-2">{emoji}</div>
                      <div className="text-white text-sm font-medium">
                        {['Bitcoin', 'Ethereum', 'Trading', 'Analytics', 'Security', 'Speed'][index]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Exchange Platform <span className="bg-gradient-to-r from-[#f97316] to-[#f59e0b] bg-clip-text text-transparent">Features</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Advanced Trading Engine",
                description: "High-performance matching engine capable of processing over 100,000 transactions per second with microsecond latency. Features include limit orders, market orders, stop-loss, and algorithmic trading support.",
                features: ["100K+ TPS", "Microsecond Latency", "Order Types", "Algo Trading"]
              },
              {
                icon: <Security className="w-8 h-8" />,
                title: "Enterprise Security",
                description: "Multi-layered security architecture with cold storage, 2FA, KYC/AML compliance, and real-time fraud detection. SOC 2 Type II compliant with bank-grade encryption.",
                features: ["Cold Storage", "2FA/MFA", "KYC/AML", "Fraud Detection"]
              },
              {
                icon: <AccountBalance className="w-8 h-8" />,
                title: "Multi-Currency Support",
                description: "Support for 500+ cryptocurrencies and fiat currencies with real-time price feeds, automatic market making, and cross-chain trading capabilities.",
                features: ["500+ Currencies", "Real-time Feeds", "Cross-chain", "Auto MM"]
              },
              {
                icon: <Speed className="w-8 h-8" />,
                title: "High Performance",
                description: "Cloud-native architecture with auto-scaling, load balancing, and global CDN distribution. Built to handle millions of concurrent users with 99.9% uptime SLA.",
                features: ["Auto-scaling", "Load Balancing", "Global CDN", "99.9% Uptime"]
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Regulatory Compliance",
                description: "Built-in compliance tools for global regulations including GDPR, SOX, and local financial regulations. Comprehensive audit trails and reporting capabilities.",
                features: ["GDPR Compliant", "SOX Compliant", "Audit Trails", "Reporting"]
              },
              {
                icon: <CurrencyBitcoin className="w-8 h-8" />,
                title: "Wallet Integration",
                description: "Secure multi-signature wallets with hardware security module (HSM) integration. Support for hot and cold wallets with automated fund management.",
                features: ["Multi-sig Wallets", "HSM Integration", "Hot/Cold Storage", "Auto Management"]
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#f97316]/30 transition-all duration-300">
                <div className="text-[#f97316] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{feature.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {feature.features.map((item, fIndex) => (
                    <div key={fIndex} className="text-xs text-gray-400 bg-white/5 rounded px-2 py-1">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Technical Architecture */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              Technical <span className="bg-gradient-to-r from-[#f59e0b] to-[#f97316] bg-clip-text text-transparent">Architecture</span>
            </h2>

            <div className="bg-gradient-to-br from-[#f97316]/10 to-[#f59e0b]/10 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Scalable Infrastructure</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Microservices Architecture</h4>
                      <p className="text-gray-300 text-sm">
                        Our exchange platforms are built using microservices architecture, allowing independent scaling 
                        of different components like trading engine, wallet services, user management, and analytics. 
                        This ensures maximum performance and reliability.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Real-time Processing</h4>
                      <p className="text-gray-300 text-sm">
                        WebSocket connections and event-driven architecture provide real-time order book updates, 
                        trade execution notifications, and live market data streaming. Users experience instant 
                        feedback and seamless trading experiences.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Database Optimization</h4>
                      <p className="text-gray-300 text-sm">
                        High-performance database clusters with read replicas, sharding, and caching layers ensure 
                        lightning-fast query execution and data consistency across all trading operations.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Security Framework</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Multi-Layer Security</h4>
                      <p className="text-gray-300 text-sm">
                        Implementation of multiple security layers including DDoS protection, rate limiting, 
                        IP whitelisting, and advanced intrusion detection systems to protect against all 
                        types of cyber threats and attacks.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Cryptographic Standards</h4>
                      <p className="text-gray-300 text-sm">
                        All sensitive data is encrypted using AES-256 encryption, with RSA key exchange and 
                        SHA-256 hashing. Private keys are stored in hardware security modules (HSM) for 
                        maximum protection against unauthorized access.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Compliance Automation</h4>
                      <p className="text-gray-300 text-sm">
                        Automated compliance monitoring and reporting tools ensure adherence to global 
                        financial regulations, including automated suspicious transaction detection and 
                        regulatory report generation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Metrics */}
          <div className="bg-gradient-to-r from-black/40 to-gray-900/40 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Why HighScore Tech for Crypto Exchange Development?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#f97316] mb-2">5+</div>
                <div className="text-white font-medium mb-2">Years Experience</div>
                <div className="text-gray-400 text-sm">In blockchain and crypto development</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#f59e0b] mb-2">10+</div>
                <div className="text-white font-medium mb-2">Exchanges Built</div>
                <div className="text-gray-400 text-sm">Successful trading platforms deployed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#10b981] mb-2">$1M+</div>
                <div className="text-white font-medium mb-2">Daily Volume</div>
                <div className="text-gray-400 text-sm">Processed by our platforms</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-300 mb-8 max-w-3xl mx-auto">
                Our team of blockchain experts, security specialists, and financial technology veterans has the experience 
                and expertise to build world-class cryptocurrency exchange platforms that meet the highest standards of 
                security, performance, and regulatory compliance.
              </p>
              <button 
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Start Your Exchange Project
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
