import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Psychology, AutoAwesome, Analytics, SmartToy, Visibility, Memory } from '@mui/icons-material';
import { useSEO } from '../../hooks/useSEO';

export default function AISolutionsDetail() {
  const navigate = useNavigate();

  useSEO({
    title: "AI Solutions Development - HighScore Tech | Machine Learning & Artificial Intelligence",
    description: "HighScore Tech develops cutting-edge AI solutions and machine learning applications. We build intelligent systems that automate processes, enhance decision-making, and drive business innovation in Nigeria.",
    keywords: "AI development Nigeria, machine learning solutions, artificial intelligence applications, ML platform development, AI automation, intelligent systems Nigeria, predictive analytics, computer vision Nigeria",
    canonical: "https://highzcore.tech/services/ai-solutions"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#7c3aed] to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#ec4899] to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-[#7c3aed] hover:text-white transition-colors duration-300 mb-8"
          >
            <ArrowBack className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#7c3aed]/20 to-[#ec4899]/20 border border-[#7c3aed]/30 backdrop-blur-sm mb-6">
                <Psychology className="w-5 h-5 text-[#7c3aed] mr-3" />
                <span className="text-[#7c3aed] text-sm font-medium">Intelligent Solutions</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                AI & Machine Learning 
                <span className="bg-gradient-to-r from-[#7c3aed] to-[#ec4899] bg-clip-text text-transparent"> Solutions</span>
              </h1>

              <p className="text-xl text-[#e2e8f0] leading-relaxed mb-8">
                Transform your business with intelligent AI solutions. HighScore Tech develops cutting-edge machine learning 
                applications that automate processes, enhance decision-making, and unlock valuable insights from your data.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-[#7c3aed] text-2xl font-bold">95%</div>
                  <div className="text-[#94a3b8] text-sm">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-[#ec4899] text-2xl font-bold">50%</div>
                  <div className="text-[#94a3b8] text-sm">Cost Reduction</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-[#10b981] text-2xl font-bold">24/7</div>
                  <div className="text-[#94a3b8] text-sm">Automation</div>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#7c3aed]/20 to-[#ec4899]/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  {['🧠', '🔬', '📊', '🤖', '👁️', '⚡'].map((emoji, index) => (
                    <div key={index} className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-300">
                      <div className="text-4xl mb-2">{emoji}</div>
                      <div className="text-white text-sm font-medium">
                        {['Neural Networks', 'Research', 'Analytics', 'Automation', 'Computer Vision', 'Real-time'][index]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Solutions */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Our AI <span className="bg-gradient-to-r from-[#7c3aed] to-[#ec4899] bg-clip-text text-transparent">Capabilities</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: <Memory className="w-8 h-8" />,
                title: "Machine Learning Models",
                description: "Custom ML models for prediction, classification, clustering, and recommendation systems. We build models using TensorFlow, PyTorch, and scikit-learn with state-of-the-art algorithms.",
                features: ["Predictive Analytics", "Classification", "Clustering", "Recommendations"]
              },
              {
                icon: <Visibility className="w-8 h-8" />,
                title: "Computer Vision",
                description: "Advanced computer vision solutions for image recognition, object detection, facial recognition, and video analytics. Perfect for security, retail, and industrial applications.",
                features: ["Image Recognition", "Object Detection", "Facial Recognition", "Video Analytics"]
              },
              {
                icon: <SmartToy className="w-8 h-8" />,
                title: "Natural Language Processing",
                description: "NLP solutions for text analysis, sentiment analysis, chatbots, and language translation. Build intelligent conversational interfaces and automated content processing.",
                features: ["Text Analysis", "Sentiment Analysis", "Chatbots", "Translation"]
              },
              {
                icon: <Analytics className="w-8 h-8" />,
                title: "Predictive Analytics",
                description: "Forecast trends, predict customer behavior, and optimize business processes with advanced statistical models and machine learning algorithms.",
                features: ["Trend Forecasting", "Behavior Prediction", "Risk Assessment", "Optimization"]
              },
              {
                icon: <AutoAwesome className="w-8 h-8" />,
                title: "Process Automation",
                description: "Intelligent process automation using AI to streamline workflows, reduce manual tasks, and improve operational efficiency across your organization.",
                features: ["Workflow Automation", "Task Optimization", "Quality Control", "Decision Support"]
              },
              {
                icon: <Psychology className="w-8 h-8" />,
                title: "Deep Learning",
                description: "Advanced neural networks for complex pattern recognition, autonomous systems, and sophisticated AI applications that learn and adapt over time.",
                features: ["Neural Networks", "Pattern Recognition", "Autonomous Systems", "Adaptive Learning"]
              }
            ].map((solution, index) => (
              <div key={index} className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#7c3aed]/30 transition-all duration-300">
                <div className="text-[#7c3aed] mb-4">{solution.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{solution.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{solution.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {solution.features.map((item, fIndex) => (
                    <div key={fIndex} className="text-xs text-gray-400 bg-white/5 rounded px-2 py-1">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* AI Implementation Process */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              Our AI Development <span className="bg-gradient-to-r from-[#ec4899] to-[#7c3aed] bg-clip-text text-transparent">Process</span>
            </h2>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Data Analysis",
                  description: "We analyze your data sources, quality, and structure to determine the best AI approach for your specific use case."
                },
                {
                  step: "02", 
                  title: "Model Design",
                  description: "Design and architect custom AI models tailored to your business requirements and performance objectives."
                },
                {
                  step: "03",
                  title: "Training & Testing",
                  description: "Train models using your data, validate performance, and fine-tune parameters for optimal accuracy and efficiency."
                },
                {
                  step: "04",
                  title: "Deployment & Monitoring",
                  description: "Deploy AI models to production with continuous monitoring, performance optimization, and regular updates."
                }
              ].map((process, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {process.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{process.title}</h3>
                  <p className="text-gray-300 text-sm">{process.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              AI Use Cases Across <span className="bg-gradient-to-r from-[#7c3aed] to-[#ec4899] bg-clip-text text-transparent">Industries</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  industry: "Healthcare",
                  applications: ["Medical Diagnosis", "Drug Discovery", "Patient Monitoring", "Treatment Optimization"],
                  icon: "🏥"
                },
                {
                  industry: "Finance",
                  applications: ["Fraud Detection", "Risk Assessment", "Algorithmic Trading", "Credit Scoring"],
                  icon: "🏦"
                },
                {
                  industry: "Retail & E-commerce",
                  applications: ["Recommendation Engines", "Price Optimization", "Inventory Management", "Customer Analytics"],
                  icon: "🛒"
                },
                {
                  industry: "Manufacturing",
                  applications: ["Predictive Maintenance", "Quality Control", "Supply Chain Optimization", "Process Automation"],
                  icon: "🏭"
                },
                {
                  industry: "Transportation",
                  applications: ["Route Optimization", "Autonomous Vehicles", "Traffic Management", "Predictive Maintenance"],
                  icon: "🚗"
                },
                {
                  industry: "Agriculture",
                  applications: ["Crop Monitoring", "Yield Prediction", "Pest Detection", "Weather Forecasting"],
                  icon: "🌾"
                }
              ].map((useCase, index) => (
                <div key={index} className="bg-gradient-to-br from-[#7c3aed]/10 to-[#ec4899]/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                  <div className="text-4xl mb-4 text-center">{useCase.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-4 text-center">{useCase.industry}</h3>
                  <div className="space-y-2">
                    {useCase.applications.map((app, appIndex) => (
                      <div key={appIndex} className="text-sm text-gray-300 bg-white/5 rounded px-3 py-2">
                        {app}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Us for AI */}
          <div className="bg-gradient-to-r from-[#7c3aed]/10 to-[#ec4899]/10 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Why Choose HighScore Tech for AI Development?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Expert AI Team</h3>
                <p className="text-gray-300 mb-6">
                  Our team includes PhD-level data scientists, machine learning engineers, and AI researchers with 
                  extensive experience in developing and deploying production-ready AI systems across various industries.
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-4">Cutting-Edge Technology</h3>
                <p className="text-gray-300 mb-6">
                  We leverage the latest AI frameworks and tools including TensorFlow, PyTorch, Hugging Face, OpenAI APIs, 
                  and cloud-based AI services to build state-of-the-art intelligent systems.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">End-to-End Solutions</h3>
                <p className="text-gray-300 mb-6">
                  From data preparation and model development to deployment and maintenance, we provide comprehensive 
                  AI solutions that integrate seamlessly with your existing systems and workflows.
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-4">Scalable Architecture</h3>
                <p className="text-gray-300">
                  Our AI solutions are built on scalable cloud infrastructure that can handle enterprise-level workloads, 
                  ensuring your AI applications perform reliably as your business grows.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <button 
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Start Your AI Project
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
