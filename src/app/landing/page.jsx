'use client';
import Link from 'next/link';
import { useState } from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">MATRIX</h1>
              <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded-full">Retail Management</span>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/login" 
                className="text-white hover:text-blue-200 px-4 py-2 rounded-md transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Smart Retail Management
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Powered by AI
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Transform your retail business with intelligent analytics, real-time monitoring, 
              theft detection, and demand prediction. Everything you need in one powerful platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/signup"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started Free
              </Link>
              <Link 
                href="/login"
                className="border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:bg-white/10 backdrop-blur-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-3/4 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl"></div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Powerful Features for Modern Retail
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">Real-time Analytics</h3>
              <p className="text-gray-300">
                Monitor customer presence, sales performance, and business metrics in real-time with advanced dashboard analytics.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-white mb-3">Theft Detection</h3>
              <p className="text-gray-300">
                AI-powered suspicious behavior detection with video flagging and comprehensive admin review systems.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-4xl mb-4">🔮</div>
              <h3 className="text-xl font-bold text-white mb-3">Demand Prediction</h3>
              <p className="text-gray-300">
                Machine learning forecasting to predict demand, optimize inventory, and maximize profitability.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-white mb-3">Product Management</h3>
              <p className="text-gray-300">
                Complete inventory management with QR codes, multiple images, and comprehensive product database.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Notifications</h3>
              <p className="text-gray-300">
                Automated alerts for stock levels, suspicious activities, and customer communications.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-bold text-white mb-3">Premium Analytics</h3>
              <p className="text-gray-300">
                Advanced customer segmentation, tier-based discounts, and promotional campaign management.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Ready to Transform Your Retail Business?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of retailers who trust MATRIX for their daily operations.
          </p>
          <Link 
            href="/signup"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 rounded-lg text-xl font-semibold transition-all transform hover:scale-105 shadow-2xl"
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">MATRIX</h3>
            <p className="text-gray-400">Smart Retail Management Platform</p>
            <div className="mt-4 text-sm text-gray-500">
              © 2025 MATRIX. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;