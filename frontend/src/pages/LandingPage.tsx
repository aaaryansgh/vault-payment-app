import { useState, useEffect } from 'react';
import { Wallet, Shield, TrendingUp, Zap, ChevronRight, Menu, X, ArrowRight, Lock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VaultPayLanding() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Virtual Vaults",
      description: "Create custom vaults for different spending categories - Groceries, Rent, Entertainment, and more.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Smart Tracking",
      description: "Automatic expense tracking with real-time insights into your spending patterns and habits.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Grade Security",
      description: "JWT authentication, encrypted transactions, and industry-standard security protocols.",
      gradient: "from-pink-500 to-red-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Payments",
      description: "Lightning-fast payments directly from your vaults with complete transaction history.",
      gradient: "from-orange-500 to-yellow-600"
    }
  ];

  const vaultTypes = [
    { emoji: "🛒", name: "Groceries", color: "bg-green-100 text-green-800" },
    { emoji: "🏠", name: "Rent", color: "bg-blue-100 text-blue-800" },
    { emoji: "🎮", name: "Entertainment", color: "bg-purple-100 text-purple-800" },
    { emoji: "💰", name: "Savings", color: "bg-yellow-100 text-yellow-800" },
    { emoji: "💡", name: "Bills", color: "bg-orange-100 text-orange-800" },
    { emoji: "🚗", name: "Transport", color: "bg-red-100 text-red-800" },
  ];

  const testimonials = [
    {
      name: "Dummy user A",
      role: "Software Engineer",
      image: "PS",
      content: "VaultPay transformed how I manage my monthly expenses. The vault system makes budgeting so intuitive!",
      rating: 5
    },
    {
      name: "Dummy user B",
      role: "Business Owner",
      image: "RV",
      content: "Finally, a payment app that understands categorized spending. It's like having a personal finance advisor.",
      rating: 5
    },
    {
      name: "Dummy user C",
      role: "Freelancer",
      image: "AD",
      content: "Love how I can allocate money to different vaults and never overspend. Game changer for freelancers!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-red-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-950 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-800/95 backdrop-blur-lg shadow-2xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-950 to-red-900 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-950 to-red-950 bg-clip-text text-transparent">
                VaultPay
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="#features" className="hover:text-red-300 transition-colors">Features</Link>
              <Link to="#how-it-works" className="hover:text-red-300 transition-colors">How It Works</Link>
              <Link to="#pricing" className="hover:text-red-300 transition-colors">Pricing</Link>
              <Link to="/login" className="hover:text-red-300 transition-colors">Login</Link>
              <Link to="/register" className="px-6 py-3 bg-gradient-to-r from-slate-700 to-red-950 rounded-full font-semibold hover:shadow-2xl hover:shadow-slate-900 transition-all transform hover:scale-105">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/98 backdrop-blur-lg border-t border-slate-800">
            <div className="px-4 py-6 space-y-4">
              <Link to="#features" className="block hover:text-blue-400 transition-colors">Features</Link>
              <Link to="#how-it-works" className="block hover:text-blue-400 transition-colors">How It Works</Link>
              <Link to="#pricing" className="block hover:text-blue-400 transition-colors">Pricing</Link>
              <Link to="/login" className="block hover:text-blue-400 transition-colors">Login</Link>
              <Link to="/register" className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500/20 rounded-full border border-red-500/30">
                <Zap className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium">Smart Money Management</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Organize Your
                <span className="bg-gradient-to-r from-slate-900 via-red-900 to-red-950 bg-clip-text text-transparent"> Money</span>
                <br />Into Smart Vaults
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed">
                India's first payment app with intelligent vault-based money management. 
                Allocate, track, and control your spending like never before.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/register" className="group px-8 py-4 bg-gradient-to-r from-gray-900 to-red-900 rounded-full font-semibold text-lg flex items-center justify-center hover:shadow-2xl hover:shadow-slate-900 transition-all transform hover:scale-105">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#demo" className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full font-semibold text-lg flex items-center justify-center hover:bg-white/20 transition-all border border-white/20">
                  Watch Demo
                </a>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-red-900">10K+</div>
                  <div className="text-sm text-gray-400">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">₹50Cr+</div>
                  <div className="text-sm text-gray-400">Managed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">4.9★</div>
                  <div className="text-sm text-gray-400">Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-slate-800/80 to-red-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">My Vaults</h3>
                    <div className="text-sm text-gray-400">₹50,000 Total</div>
                  </div>
                  
                  {vaultTypes.map((vault, idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-700/50 transition-all cursor-pointer border border-slate-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{vault.emoji}</div>
                          <div>
                            <div className="font-semibold">{vault.name}</div>
                            <div className="text-sm text-gray-400">₹{(5000 + idx * 1000).toLocaleString()}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="w-full bg-slate-500 rounded-full h-2">
                        <div className="bg-gradient-to-r from-slate-700 to-red-950 h-2 rounded-full" style={{ width: `${60 + idx * 5}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-slate-700 to-red-900 rounded-full filter blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="bg-gradient-to-r from-slate-900 to-slate-950 bg-clip-text text-transparent">VaultPay</span>?
            </h2>
            <p className="text-xl text-gray-300">Powerful features designed for smart money management</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className={`group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-red-900/50 transition-all cursor-pointer transform hover:scale-105 ${activeFeature === idx ? 'ring-2 ring-slate-500' : ''}`}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-300">Get started in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up in seconds with email or phone", icon: <Users className="w-8 h-8" /> },
              { step: "02", title: "Link Bank Account", desc: "Securely connect your bank account", icon: <Lock className="w-8 h-8" /> },
              { step: "03", title: "Create Vaults", desc: "Allocate money into smart vaults and start spending", icon: <Wallet className="w-8 h-8" /> }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-red-500/50 transition-all">
                  <div className="text-6xl font-bold text-red-500/20 mb-4">{item.step}</div>
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-red-900 rounded-xl flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-red-900" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Thousands</h2>
            <p className="text-xl text-gray-300">See what our users say about VaultPay</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-500/50 transition-all">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-red-900 rounded-full flex items-center justify-center font-bold">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-slate-900 to-red-900 rounded-3xl p-12 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Take Control?</h2>
              <p className="text-xl mb-8 text-blue-100">Join thousands managing their money smarter with VaultPay</p>
              <Link to="/register" className="inline-flex items-center px-8 py-4 bg-white text-red-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-red-900 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">VaultPay</span>
              </div>
              <p className="text-gray-400">Smart money management for everyone.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <div className="space-y-2 text-gray-400">
                <div><a href="#features" className="hover:text-white">Features</a></div>
                <div><a href="#pricing" className="hover:text-white">Pricing</a></div>
                <div><a href="#" className="hover:text-white">Security</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <div className="space-y-2 text-gray-400">
                <div><a href="#" className="hover:text-white">About</a></div>
                <div><a href="#" className="hover:text-white">Blog</a></div>
                <div><a href="#" className="hover:text-white">Careers</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <div className="space-y-2 text-gray-400">
                <div><a href="https://github.com/aaaryansgh" className="hover:text-white">GitHub</a></div>
                <div><a href="https://www.linkedin.com/in/aryansingh20/" className="hover:text-white">LinkedIn</a></div>
                <div><a href="#" className="hover:text-white">Twitter</a></div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 VaultPay. Built by <a href="https://github.com/aaaryansgh" className="text-red-700 hover:text-red-300">Aryan Singh</a>. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
