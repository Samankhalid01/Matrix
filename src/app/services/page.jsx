'use client';
import { useState } from 'react';
import Link from 'next/link';

const ServicesPage = () => {
  const [activeTab, setActiveTab] = useState('retail');

  const services = {
    retail: [
      {
        title: 'Smart Inventory Management',
        description: 'AI-powered inventory tracking and management system that prevents stockouts and optimizes storage.',
        features: [
          'Real-time stock monitoring',
          'Automatic reorder notifications',
          'Inventory optimization suggestions',
          'Stock level predictions'
        ],
        icon: '📦'
      },
      {
        title: 'Customer Analytics',
        description: 'Deep insights into customer behavior and shopping patterns to improve store layout and product placement.',
        features: [
          'Customer flow analysis',
          'Heat mapping',
          'Purchase pattern tracking',
          'Customer segment analysis'
        ],
        icon: '📊'
      },
      {
        title: 'Security Services',
        description: 'Advanced security system with AI-powered theft detection and prevention.',
        features: [
          'Real-time surveillance',
          'Suspicious behavior detection',
          'Incident recording and reporting',
          'Security staff alerts'
        ],
        icon: '🔐'
      }
    ],
    analytics: [
      {
        title: 'Predictive Analytics',
        description: 'Advanced ML models for forecasting sales and demand patterns.',
        features: [
          'Sales forecasting',
          'Demand prediction',
          'Trend analysis',
          'Market insights'
        ],
        icon: '📈'
      },
      {
        title: 'Performance Metrics',
        description: 'Comprehensive performance tracking and analysis tools.',
        features: [
          'Store performance tracking',
          'Staff efficiency metrics',
          'Sales performance analysis',
          'ROI calculations'
        ],
        icon: '📉'
      },
      {
        title: 'Business Intelligence',
        description: 'Actionable insights from your retail data.',
        features: [
          'Custom report generation',
          'Data visualization',
          'Competitive analysis',
          'Growth opportunities identification'
        ],
        icon: '🎯'
      }
    ],
    support: [
      {
        title: '24/7 Technical Support',
        description: 'Round-the-clock technical assistance for all your needs.',
        features: [
          'Live chat support',
          'Phone support',
          'Email assistance',
          'Remote troubleshooting'
        ],
        icon: '🛟'
      },
      {
        title: 'System Maintenance',
        description: 'Regular system updates and maintenance services.',
        features: [
          'Software updates',
          'System optimization',
          'Security patches',
          'Performance tuning'
        ],
        icon: '🔧'
      },
      {
        title: 'Training Services',
        description: 'Comprehensive training programs for your staff.',
        features: [
          'Online tutorials',
          'Live training sessions',
          'Documentation',
          'Best practices guides'
        ],
        icon: '👨‍🏫'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
              Our Services
            </h1>
            <p className="mt-4 text-xl text-blue-100">
              Comprehensive retail management solutions tailored to your needs
            </p>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['retail', 'analytics', 'support'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-medium transition-colors
                ${activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Services
            </button>
          ))}
        </div>

        {/* Service Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services[activeTab].map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-all"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-4">{service.title}</h3>
              <p className="text-gray-600 mb-6">{service.description}</p>
              <ul className="space-y-3">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Need More Information?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our team is here to help you choose the right services for your business
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Contact Sales
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center px-8 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              What Our Clients Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Trusted by leading retail businesses worldwide
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "The analytics tools have transformed how we make inventory decisions.",
                author: "Sarah Johnson",
                position: "Retail Manager",
                company: "Fashion Mart"
              },
              {
                quote: "Security incidents dropped by 75% after implementing the system.",
                author: "Michael Chen",
                position: "Security Director",
                company: "SuperStore Chain"
              },
              {
                quote: "Customer satisfaction improved significantly with smart notifications.",
                author: "Emma Williams",
                position: "Customer Service Head",
                company: "Metro Retail"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.position}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
