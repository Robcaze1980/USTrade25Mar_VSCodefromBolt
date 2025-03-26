import { Link } from 'react-router-dom'
import { BarChart3, TrendingUp, Search, CheckCircle2, Menu, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

const features = [
  {
    icon: Search,
    title: "Global Trade Data",
    description: "Access comprehensive trade statistics and trends from markets worldwide."
  },
  {
    icon: BarChart3,
    title: "HS Code Analytics",
    description: "Deep dive into specific HS codes with detailed volume and pricing analysis."
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Stay ahead with real-time market trends and predictive analytics."
  }
]

const plans = [
  {
    name: "Basic",
    price: "9.99",
    description: "Perfect for small businesses starting their trade journey",
    features: [
      "5 HS Codes",
      "Basic trade statistics",
      "Monthly data updates",
      "Email support",
      "Basic export formats"
    ]
  },
  {
    name: "Standard",
    price: "26.99",
    description: "Ideal for growing businesses with diverse trade needs",
    features: [
      "15 HS Codes",
      "Advanced trade analytics",
      "Weekly data updates",
      "Priority email support",
      "Advanced export formats",
      "Market trend alerts"
    ],
    popular: true
  },
  {
    name: "Pro",
    price: "39.99",
    description: "For enterprises requiring comprehensive trade intelligence",
    features: [
      "Unlimited HS Codes",
      "Real-time trade analytics",
      "Daily data updates",
      "24/7 priority support",
      "Custom export formats",
      "API access",
      "Custom reports"
    ]
  }
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center">
              <img src="logo.png" alt="US Trade Navigator" className="h-8 w-auto" />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200">
            <div className="px-4 py-3 space-y-3">
              <Link
                to="/login"
                className="block text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="block bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-blue-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center md:text-left md:grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Unlock Real-Time U.S. Trade Insights
              </h1>
              <p className="mt-4 md:mt-6 text-lg md:text-xl text-gray-600">
                Access near-current HTS 10 trade data—with just a 2-month lag. Gain actionable insights to drive your business forward.
              </p>
              <div className="mt-8 md:mt-10 flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <Link
                  to="/signup"
                  className="w-full md:w-auto bg-violet-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-violet-700 transition-colors text-center"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="w-full md:w-auto text-violet-600 px-6 py-3 rounded-lg text-lg font-medium hover:bg-violet-50 transition-colors text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
            <div className="mt-12 md:mt-0">
              <div className="relative rounded-xl overflow-hidden bg-white shadow-xl">
                <div className="aspect-[4/3] bg-gradient-to-br from-violet-500/5 to-blue-500/5 p-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mx-auto text-violet-500 mb-4" />
                      <p className="text-gray-600">Interactive trade data visualization</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Powerful Features for Global Trade
            </h2>
            <p className="mt-4 text-lg md:text-xl text-gray-600">
              Everything you need to analyze and optimize your trade operations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-lg bg-violet-50 p-3 text-violet-600">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-lg md:text-xl text-gray-600">
              Get 25% off if paid annually!
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative p-6 md:p-8 ${
                  plan.popular
                    ? 'border-2 border-violet-600 shadow-lg'
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-8 -translate-y-1/2 bg-violet-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Popular
                  </div>
                )}
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl md:text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="ml-1 text-gray-600">/month</span>
                  </div>
                  <p className="mt-4 text-gray-600">
                    {plan.description}
                  </p>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-violet-600 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/signup"
                    className={`mt-8 block w-full text-center px-6 py-3 rounded-lg text-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-violet-600 text-white hover:bg-violet-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-violet-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Ready to Transform Your Trade Strategy?
          </h2>
          <p className="mt-4 text-lg md:text-xl text-violet-100">
            Join thousands of businesses making data-driven decisions with US Trade Navigator
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-block bg-white text-violet-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-violet-50 transition-colors"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center">
                <img src="logo.png" alt="US Trade Navigator" className="h-8 w-auto brightness-200" />
              </Link>
              <p className="mt-4">
                Your comprehensive platform for global trade intelligence
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p>© 2025 US Trade Navigator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}