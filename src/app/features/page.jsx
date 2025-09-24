'use client';
import Image from 'next/image';
import Link from 'next/link';

const FeaturesPage = () => {
  const features = [
    {
      title: 'Admin Control Panel',
      description: 'Comprehensive admin dashboard with real-time monitoring and control.',
      subFeatures: [
        'Real-time customer presence monitoring',
        'Customer metrics and profile management',
        'Fraud detection and customer management',
        'Customer satisfaction analysis tools'
      ],
      icon: '👨‍💼'
    },
    {
      title: 'Demand Prediction & Analytics',
      description: 'Advanced analytics and forecasting tools powered by machine learning.',
      subFeatures: [
        'ML-powered demand forecasting',
        'Detailed forecast reports generation',
        'Store performance analytics',
        'Customizable report parameters',
        'Multiple export formats (PDF, CSV, Excel)'
      ],
      icon: '📊'
    },
    {
      title: 'Theft Detection',
      description: 'AI-powered surveillance system for enhanced security.',
      subFeatures: [
        'Suspicious behavior detection',
        'Incident flagging with video evidence',
        'Admin review system for flagged incidents'
      ],
      icon: '🎥'
    },
    {
      title: 'Smart Notifications',
      description: 'Intelligent notification system for various events and alerts.',
      subFeatures: [
        'Stock level notifications',
        'Security alert system',
        'Customer communication updates'
      ],
      icon: '🔔'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
              Our Features
            </h1>
            <p className="mt-4 text-xl text-blue-100">
              Discover how our smart retail solutions can transform your business
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">{feature.icon}</div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {feature.title}
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                {feature.description}
              </p>
              <ul className="space-y-3">
                {feature.subFeatures.map((subFeature, subIndex) => (
                  <li key={subIndex} className="flex items-center gap-2">
                    <div className="text-green-500">✓</div>
                    <span className="text-gray-700">{subFeature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Transform your retail space with our cutting-edge solutions
            </p>
            <div className="mt-8">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose Our Solution?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Benefits that set us apart from traditional retail management systems
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Increased Security',
                description: 'Reduce theft and loss with AI-powered surveillance',
                icon: '🛡️'
              },
              {
                title: 'Better Insights',
                description: 'Make data-driven decisions with advanced analytics',
                icon: '📈'
              },
              {
                title: 'Improved Efficiency',
                description: 'Streamline operations with automated systems',
                icon: '⚡'
              }
            ].map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
