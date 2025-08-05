export const coursesData = [
  {
    id: "frontend-development",
    name: "Frontend Development",
    duration: "6 months",
    price: 250000,
    level: "Beginner to Advanced",
    icon: "🎨",
    shortDescription: "Master modern frontend technologies including React, Vue, and responsive design principles.",
    longDescription: "Comprehensive frontend development program covering everything from HTML/CSS fundamentals to advanced React applications. Learn to build responsive, interactive user interfaces that provide exceptional user experiences.",
    gradient: "from-[#2563eb] to-[#06b6d4]",
    bgGradient: "from-[#2563eb]/10 to-[#06b6d4]/10",
    features: [
      "HTML5 & CSS3 Mastery",
      "JavaScript ES6+",
      "React.js & Hooks",
      "Vue.js Framework",
      "Responsive Design",
      "UI/UX Principles",
      "API Integration",
      "State Management",
      "Testing & Debugging",
      "Deployment Strategies"
    ],
    modules: [
      {
        title: "Web Fundamentals",
        duration: "4 weeks",
        topics: ["HTML5 Semantic Elements", "CSS3 & Flexbox", "CSS Grid", "JavaScript Basics"]
      },
      {
        title: "Modern JavaScript",
        duration: "6 weeks", 
        topics: ["ES6+ Features", "DOM Manipulation", "Async Programming", "Module Systems"]
      },
      {
        title: "React Development",
        duration: "8 weeks",
        topics: ["Components & JSX", "State & Props", "Hooks", "Context API", "React Router"]
      },
      {
        title: "Advanced Topics",
        duration: "6 weeks",
        topics: ["State Management", "Testing", "Performance", "Deployment"]
      }
    ],
    requirements: ["Basic computer skills", "Internet connection", "Dedication to learn"],
    outcomes: ["Build responsive web applications", "Master modern frameworks", "Portfolio of projects", "Job-ready skills"],
    instructor: "Senior Frontend Developer with 8+ years experience"
  },
  {
    id: "backend-development",
    name: "Backend Development",
    duration: "6 months",
    price: 280000,
    level: "Intermediate",
    icon: "⚙️",
    shortDescription: "Build robust server-side applications with Node.js, Python, databases, and cloud services.",
    longDescription: "Deep dive into backend development with multiple programming languages and frameworks. Learn to design scalable APIs, manage databases, and deploy applications to the cloud.",
    gradient: "from-[#7c3aed] to-[#ec4899]",
    bgGradient: "from-[#7c3aed]/10 to-[#ec4899]/10",
    features: [
      "Node.js & Express",
      "Python & Django",
      "Database Design",
      "RESTful APIs",
      "Authentication & Security",
      "Cloud Deployment",
      "Microservices",
      "Docker & Containers",
      "Testing Strategies",
      "Performance Optimization"
    ],
    modules: [
      {
        title: "Server Fundamentals",
        duration: "5 weeks",
        topics: ["HTTP Protocol", "Node.js Basics", "Express Framework", "Middleware"]
      },
      {
        title: "Database Management",
        duration: "6 weeks",
        topics: ["SQL Databases", "MongoDB", "Database Design", "ORM/ODM"]
      },
      {
        title: "API Development",
        duration: "7 weeks",
        topics: ["RESTful Services", "GraphQL", "Authentication", "Authorization"]
      },
      {
        title: "Deployment & DevOps",
        duration: "6 weeks",
        topics: ["Cloud Platforms", "Docker", "CI/CD", "Monitoring"]
      }
    ],
    requirements: ["Programming fundamentals", "Basic JavaScript knowledge", "Database concepts"],
    outcomes: ["Build scalable APIs", "Master server technologies", "Deploy to cloud", "Industry-ready backend skills"],
    instructor: "Full-stack Engineer with cloud architecture expertise"
  },
  {
    id: "data-science",
    name: "Data Science",
    duration: "8 months",
    price: 350000,
    level: "Intermediate to Advanced",
    icon: "📊",
    shortDescription: "Analyze data, build predictive models, and extract insights using Python and machine learning.",
    longDescription: "Comprehensive data science program covering statistics, machine learning, and data visualization. Learn to extract meaningful insights from complex datasets and build predictive models.",
    gradient: "from-[#f97316] to-[#f59e0b]",
    bgGradient: "from-[#f97316]/10 to-[#f59e0b]/10",
    features: [
      "Python Programming",
      "Statistics & Probability",
      "Data Manipulation",
      "Machine Learning",
      "Data Visualization",
      "Big Data Tools",
      "Deep Learning Basics",
      "Business Intelligence",
      "Research Methods",
      "Industry Projects"
    ],
    modules: [
      {
        title: "Python for Data Science",
        duration: "6 weeks",
        topics: ["Python Fundamentals", "NumPy", "Pandas", "Data Cleaning"]
      },
      {
        title: "Statistics & Analysis",
        duration: "8 weeks",
        topics: ["Descriptive Statistics", "Inferential Statistics", "Hypothesis Testing", "A/B Testing"]
      },
      {
        title: "Machine Learning",
        duration: "10 weeks",
        topics: ["Supervised Learning", "Unsupervised Learning", "Model Evaluation", "Feature Engineering"]
      },
      {
        title: "Advanced Applications",
        duration: "8 weeks",
        topics: ["Deep Learning", "NLP", "Computer Vision", "Time Series"]
      }
    ],
    requirements: ["Basic mathematics", "Programming interest", "Analytical thinking"],
    outcomes: ["Data analysis expertise", "ML model building", "Business insights", "Data scientist role readiness"],
    instructor: "PhD Data Scientist with industry and research experience"
  },
  {
    id: "artificial-intelligence",
    name: "Artificial Intelligence",
    duration: "10 months",
    price: 450000,
    level: "Advanced",
    icon: "🤖",
    shortDescription: "Master AI concepts, neural networks, and build intelligent systems with cutting-edge technologies.",
    longDescription: "Advanced AI program covering machine learning, deep learning, natural language processing, and computer vision. Build intelligent systems and understand the latest AI breakthroughs.",
    gradient: "from-[#10b981] to-[#06b6d4]",
    bgGradient: "from-[#10b981]/10 to-[#06b6d4]/10",
    features: [
      "Machine Learning Algorithms",
      "Deep Neural Networks",
      "Natural Language Processing",
      "Computer Vision",
      "Reinforcement Learning",
      "AI Ethics",
      "TensorFlow & PyTorch",
      "Model Deployment",
      "Research Methods",
      "Capstone Project"
    ],
    modules: [
      {
        title: "AI Fundamentals",
        duration: "8 weeks",
        topics: ["AI History", "Search Algorithms", "Logic & Reasoning", "Problem Solving"]
      },
      {
        title: "Machine Learning Deep Dive",
        duration: "10 weeks",
        topics: ["Advanced ML", "Ensemble Methods", "Feature Selection", "Model Optimization"]
      },
      {
        title: "Deep Learning",
        duration: "12 weeks",
        topics: ["Neural Networks", "CNNs", "RNNs", "Transformers", "GANs"]
      },
      {
        title: "Specialized AI",
        duration: "10 weeks",
        topics: ["NLP Applications", "Computer Vision", "Reinforcement Learning", "AI Ethics"]
      }
    ],
    requirements: ["Strong programming skills", "Mathematics background", "ML fundamentals"],
    outcomes: ["AI system development", "Research capabilities", "Industry expertise", "AI leadership roles"],
    instructor: "AI Research Scientist with publications and industry experience"
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    duration: "8 months",
    price: 380000,
    level: "Intermediate to Advanced",
    icon: "🧠",
    shortDescription: "Build predictive models, understand algorithms, and implement ML solutions for real-world problems.",
    longDescription: "Focused machine learning program covering supervised and unsupervised learning, model evaluation, and deployment. Perfect for those wanting to specialize in ML engineering.",
    gradient: "from-[#ec4899] to-[#f97316]",
    bgGradient: "from-[#ec4899]/10 to-[#f97316]/10",
    features: [
      "ML Algorithms",
      "Model Training",
      "Feature Engineering",
      "Model Evaluation",
      "Ensemble Methods",
      "Time Series Analysis",
      "MLOps Basics",
      "Model Deployment",
      "Real-world Projects",
      "Industry Case Studies"
    ],
    modules: [
      {
        title: "ML Foundations",
        duration: "6 weeks",
        topics: ["ML Types", "Linear Models", "Decision Trees", "Model Selection"]
      },
      {
        title: "Advanced Algorithms",
        duration: "8 weeks",
        topics: ["SVM", "Random Forest", "Gradient Boosting", "Neural Networks"]
      },
      {
        title: "Unsupervised Learning",
        duration: "6 weeks",
        topics: ["Clustering", "Dimensionality Reduction", "Association Rules", "Anomaly Detection"]
      },
      {
        title: "ML Engineering",
        duration: "12 weeks",
        topics: ["Feature Engineering", "Model Pipeline", "Deployment", "Monitoring"]
      }
    ],
    requirements: ["Python programming", "Statistics knowledge", "Data science basics"],
    outcomes: ["ML model expertise", "Production deployment", "Algorithm mastery", "ML engineer role"],
    instructor: "ML Engineer with 10+ years in production ML systems"
  },
  {
    id: "mobile-development",
    name: "Mobile App Development",
    duration: "7 months",
    price: 320000,
    level: "Beginner to Advanced",
    icon: "📱",
    shortDescription: "Create native and cross-platform mobile apps for iOS and Android using React Native and Flutter.",
    longDescription: "Complete mobile development course covering both native and cross-platform development. Learn to build, test, and deploy mobile applications to app stores.",
    gradient: "from-[#4f46e5] to-[#7c3aed]",
    bgGradient: "from-[#4f46e5]/10 to-[#7c3aed]/10",
    features: [
      "React Native",
      "Flutter Development",
      "Native iOS (Swift)",
      "Native Android (Kotlin)",
      "Mobile UI/UX",
      "State Management",
      "API Integration",
      "Push Notifications",
      "App Store Deployment",
      "Performance Optimization"
    ],
    modules: [
      {
        title: "Mobile Fundamentals",
        duration: "4 weeks",
        topics: ["Mobile Platforms", "Development Environment", "Design Principles", "User Experience"]
      },
      {
        title: "React Native",
        duration: "8 weeks",
        topics: ["Components", "Navigation", "State Management", "Native Modules"]
      },
      {
        title: "Flutter Development",
        duration: "8 weeks",
        topics: ["Dart Language", "Widgets", "State Management", "Platform Integration"]
      },
      {
        title: "Advanced Mobile",
        duration: "8 weeks",
        topics: ["Performance", "Security", "Testing", "Deployment"]
      }
    ],
    requirements: ["Programming basics", "JavaScript knowledge preferred", "Mobile device for testing"],
    outcomes: ["Cross-platform apps", "Native development", "App store published apps", "Mobile developer role"],
    instructor: "Senior Mobile Developer with 50+ published apps"
  },
  {
    id: "blockchain-development",
    name: "Blockchain Development",
    duration: "9 months",
    price: 420000,
    level: "Advanced",
    icon: "⛓️",
    shortDescription: "Build decentralized applications, smart contracts, and understand cryptocurrency technologies.",
    longDescription: "Comprehensive blockchain development program covering smart contracts, DeFi protocols, and decentralized applications. Learn Solidity, Web3, and blockchain architecture.",
    gradient: "from-[#06b6d4] to-[#2563eb]",
    bgGradient: "from-[#06b6d4]/10 to-[#2563eb]/10",
    features: [
      "Blockchain Fundamentals",
      "Smart Contracts",
      "Solidity Programming",
      "Web3 Integration",
      "DeFi Protocols",
      "NFT Development",
      "Cryptocurrency Trading",
      "Security Auditing",
      "Deployment Strategies",
      "Industry Projects"
    ],
    modules: [
      {
        title: "Blockchain Basics",
        duration: "6 weeks",
        topics: ["Blockchain Architecture", "Cryptography", "Consensus Mechanisms", "Bitcoin & Ethereum"]
      },
      {
        title: "Smart Contract Development",
        duration: "10 weeks",
        topics: ["Solidity Language", "Contract Design", "Testing", "Security"]
      },
      {
        title: "DApp Development",
        duration: "10 weeks",
        topics: ["Web3.js", "Frontend Integration", "IPFS", "MetaMask Integration"]
      },
      {
        title: "Advanced Blockchain",
        duration: "10 weeks",
        topics: ["DeFi Protocols", "NFT Marketplaces", "Layer 2 Solutions", "Cross-chain"]
      }
    ],
    requirements: ["Strong programming background", "JavaScript knowledge", "Cryptography interest"],
    outcomes: ["Smart contract development", "DApp creation", "Blockchain expertise", "Web3 developer role"],
    instructor: "Blockchain Architect with DeFi protocol experience"
  },
  {
    id: "web-gaming-development",
    name: "Web Gaming Development",
    duration: "8 months",
    price: 360000,
    level: "Intermediate to Advanced",
    icon: "🎮",
    shortDescription: "Create interactive web games, casino systems, and gaming platforms using modern web technologies.",
    longDescription: "Specialized program for web-based game development including casino systems, multiplayer games, and interactive entertainment platforms. Learn game engines and real-time technologies.",
    gradient: "from-[#ec4899] to-[#8b5cf6]",
    bgGradient: "from-[#ec4899]/10 to-[#8b5cf6]/10",
    features: [
      "Game Design Principles",
      "WebGL & Three.js",
      "Canvas & 2D Graphics",
      "Game Physics",
      "Multiplayer Systems",
      "Casino Game Logic",
      "Real-time Communication",
      "Game Monetization",
      "Performance Optimization",
      "Game Publishing"
    ],
    modules: [
      {
        title: "Game Development Basics",
        duration: "6 weeks",
        topics: ["Game Design", "JavaScript for Games", "Canvas API", "Basic Physics"]
      },
      {
        title: "3D Web Games",
        duration: "8 weeks",
        topics: ["Three.js", "WebGL", "3D Graphics", "Lighting & Materials"]
      },
      {
        title: "Casino & Card Games",
        duration: "8 weeks",
        topics: ["Game Logic", "Random Systems", "Betting Mechanics", "Security"]
      },
      {
        title: "Advanced Gaming",
        duration: "10 weeks",
        topics: ["Multiplayer", "Real-time Communication", "Game Servers", "Monetization"]
      }
    ],
    requirements: ["JavaScript proficiency", "Web development basics", "Game interest"],
    outcomes: ["Web game creation", "Casino system development", "Game publishing", "Gaming developer role"],
    instructor: "Game Developer with 15+ published web games"
  }
];

export const getCourseById = (id) => {
  return coursesData.find(course => course.id === id);
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
