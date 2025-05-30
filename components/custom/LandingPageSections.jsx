"use client"
import React from 'react';
import { Star, Check, ArrowRight, Zap, Globe, Code, Palette } from 'lucide-react';

function LandingPageSections() {
  const features = [
    {
      icon: <Code className="h-8 w-8" />,
      title: "Clean Code Generation",
      description: "Generate semantic, optimized HTML, CSS, and JavaScript that follows best practices."
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Custom Design System",
      description: "AI understands design principles and creates cohesive, beautiful user interfaces."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Responsive by Default",
      description: "Every generated website works perfectly across all devices and screen sizes."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Performance Optimized",
      description: "Built-in optimization for fast loading times and excellent user experience."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Startup Founder",
      content: "I built my entire company landing page in under 10 minutes. The AI understood exactly what I needed!",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Mike Rodriguez",
      role: "Freelance Designer",
      content: "This tool has revolutionized my workflow. I can now deliver projects 10x faster to my clients.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Emily Johnson",
      role: "Small Business Owner",
      content: "No coding knowledge required! I created a professional website for my bakery in minutes.",
      rating: 5,
      avatar: "EJ"
    }
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out our AI web builder",
      features: [
        "3 websites per month",
        "Basic templates",
        "Standard support",
        "Export code"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "month",
      description: "Ideal for professionals and growing businesses",
      features: [
        "Unlimited websites",
        "Premium templates",
        "Priority support",
        "Advanced customization",
        "Team collaboration",
        "Custom domains"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "month",
      description: "For large teams and organizations",
      features: [
        "Everything in Pro",
        "White-label solution",
        "API access",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee"
      ],
      popular: false
    }
  ];

  return (
    <div className="relative bg-gray-900">
      {/* Features Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Features for
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Modern Web Development</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our AI doesn't just generate websites—it creates professional, optimized experiences that your users will love.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Loved by Thousands of
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"> Happy Users</span>
            </h2>
            <p className="text-gray-400 text-lg">See what our community is saying about their experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-medium">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"> Pricing</span>
            </h2>
            <p className="text-gray-400 text-lg">Choose the plan that's right for you and start building today</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`relative p-8 rounded-2xl border transition-all duration-300 hover:transform hover:scale-105 ${
                plan.popular 
                  ? 'bg-gradient-to-b from-blue-900/50 to-purple-900/50 border-blue-500/50 shadow-2xl shadow-blue-500/20' 
                  : 'bg-gray-800/40 border-gray-700/50 hover:border-blue-500/30'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-white text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-1">/{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25'
                    : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 hover:border-blue-500/50'
                }`}>
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Build Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Dream Website?</span>
          </h2>
          <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already building amazing websites with AI. Start your journey today—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center">
              Start Building for Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            <button className="border border-gray-600 hover:border-blue-500/50 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-800/50">
              View Examples
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPageSections;
