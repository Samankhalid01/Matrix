'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-lg border-b border-purple-500/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              <div className="w-21 h-21">
                <Image src="/imagebg.png" alt="Matrix Logo" width={380} height={740} className="object-contain" priority fetchpriority="high" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
              <Link href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</Link>
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
              <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl top-10 left-10 animate-pulse-slow"></div>
          <div className="absolute w-96 h-96 bg-pink-600/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16 mt-10 animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              Smarter Ways to Manage
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Your Retail</span>
            </h1>
            <p className="text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Track inventory, monitor theft, analyze sales and lead your retail with a dashboard built for you.
            </p>
            <Link href="/signup" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105">
              Start Managing Smarter →
            </Link>
          </div>


        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 relative bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Features <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">That Put You</span>
              <br />in Control
            </h2>
            <p className="text-gray-400 text-lg">
              Simplify your retail operations with features built to give you complete control.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Feature 1 - Inventory Tracking */}
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-8 hover:border-purple-500/40 transition-all">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Inventory & Stock Tracking</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Get real-time updates on your product inventory with automated stock alerts and comprehensive tracking across all store locations.
                  </p>
                  <div className="h-24 bg-gray-800/50 rounded-xl p-4 flex items-center justify-around">
                    {[60, 85, 45, 90, 70, 55, 80].map((h, i) => (
                      <div key={i} className="flex-1 mx-1">
                        <div className="bg-gradient-to-t from-purple-600 to-purple-400 rounded-t" style={{height: `${h}%`}}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 - Smart Transactions */}
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-pink-500/20 p-8 hover:border-pink-500/40 transition-all">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-600 to-pink-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Smart Transactions</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Automate your checkout process with QR code scanning and get real-time insights without the paperwork.
                  </p>
                  <div className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-2xl p-6 border border-pink-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300 text-sm">Payment Methods</span>
                      <span className="text-pink-400 text-sm font-semibold">● Card</span>
                    </div>
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-white">
                      <div className="text-xs mb-2">VISA</div>
                      <div className="text-xl font-bold">**** **** **** 4242</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 - Budget & Goals */}
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-8 hover:border-blue-500/40 transition-all">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Sales Analytics & Goals</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Set sales targets, monitor performance metrics and stay on track with your business goals with ease.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">Monthly Target</span>
                      <span className="text-blue-400 font-semibold">$25,000</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                      <span className="text-gray-300 text-sm">Current</span>
                      <span className="text-green-400 font-semibold">$18,750</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-600 to-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4 - Theft Detection */}
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-orange-500/20 p-8 hover:border-orange-500/40 transition-all">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">AI Theft Monitoring</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Stay vigilant and alert with advanced AI surveillance that detects suspicious behavior and allows real-time investigation.
                  </p>
                  <div className="relative bg-gray-800/50 rounded-xl p-4 h-24">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-red-500/20 border border-red-500 rounded px-2 py-1 text-xs text-red-400 font-semibold">
                      ● ALERT DETECTED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Steps Section */}
      <div className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Take Control In <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">3 Simple Steps</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Connect your storefront, overview your metrics, and start tracking your money with ease.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-8 hover:border-purple-500/40 transition-all hover:scale-105">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-3">STEP 1</h3>
              <h4 className="text-xl font-semibold text-purple-400 text-center mb-4">Sign Up in Minutes</h4>
              <p className="text-gray-400 text-center leading-relaxed">
                Create your account and add your business details and you're ready to start. Takes only minutes!
              </p>
            </div>

            {/* Step 2 */}
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-pink-500/20 p-8 hover:border-pink-500/40 transition-all hover:scale-105">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-pink-600 to-pink-800 rounded-2xl flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-3">STEP 2</h3>
              <h4 className="text-xl font-semibold text-pink-400 text-center mb-4">Connect Your Store</h4>
              <p className="text-gray-400 text-center leading-relaxed">
                Securely link your POS systems, e-wallets, or cards— all your data sync automatically.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-8 hover:border-blue-500/40 transition-all hover:scale-105">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-3">STEP 3</h3>
              <h4 className="text-xl font-semibold text-blue-400 text-center mb-4">Track, Plan & Grow</h4>
              <p className="text-gray-400 text-center leading-relaxed">
                Get real-time insights, budget alerts, and revenue reports within your already existing workflow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 relative bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Perfect</span> Plan
            </h2>
            <p className="text-gray-400 text-lg">
              Whether you're just starting out or scaling up, we've got a plan for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700 p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Starter Plan</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">$29</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Perfect for small businesses</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Up to 5 bank accounts
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  500 products tracking
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic analytics
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Email support
                </li>
              </ul>
              <Link href="/signup" className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all">
                Get Started
              </Link>
            </div>

            {/* Plus Plan - Popular */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 relative transform scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Plus Plan</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">$69</span>
                  <span className="text-purple-100">/month</span>
                </div>
                <p className="text-purple-100 text-sm mt-2">All the essentials plus features</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Unlimited bank accounts
                </li>
                <li className="flex items-center gap-3 text-white">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Unlimited products
                </li>
                <li className="flex items-center gap-3 text-white">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Advanced theft detection
                </li>
                <li className="flex items-center gap-3 text-white">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center gap-3 text-white">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  AI-Powered insights
                </li>
              </ul>
              <Link href="/signup" className="block w-full text-center bg-white text-purple-600 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all">
                Choose Plan
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700 p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Premium Plan</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">$99</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">For enterprises and large teams</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Plus
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Multi-location support
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Custom integrations
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  24/7 phone support
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dedicated account manager
                </li>
              </ul>
              <Link href="/signup" className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Matrix Section */}
      <div className="py-24 relative bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">MATRIX</span>?
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to run a modern retail business, all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Benefit 1 */}
            <div className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Trusted by 10K+ Users</h3>
              <p className="text-gray-400 text-sm">Retailers worldwide trust our platform daily</p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-gradient-to-br from-pink-600/10 to-pink-800/10 backdrop-blur-xl rounded-2xl border border-pink-500/30 p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-pink-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">Real-time updates and instant sync across devices</p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Secure & Reliable</h3>
              <p className="text-gray-400 text-sm">Bank-level encryption and 99.9% uptime</p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-gradient-to-br from-green-600/10 to-green-800/10 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Hidden Fees</h3>
              <p className="text-gray-400 text-sm">Transparent pricing with no surprises</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">They</span> Choose Us
            </h2>
            <p className="text-gray-400 text-lg">
              See what our customers have to say about their experience with MATRIX.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  JD
                </div>
                <div className="ml-4">
                  <h4 className="text-white font-semibold">John Davis</h4>
                  <p className="text-gray-400 text-sm">Store Owner</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed">
                "MATRIX transformed how we manage our store. The theft detection alone has saved us thousands. Highly recommend!"
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-pink-500/20 p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-pink-800 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  SA
                </div>
                <div className="ml-4">
                  <h4 className="text-white font-semibold">Sarah Anderson</h4>
                  <p className="text-gray-400 text-sm">Retail Manager</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed">
                "The analytics dashboard gives us insights we never had before. We can track inventory in real-time and make better decisions."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  MC
                </div>
                <div className="ml-4">
                  <h4 className="text-white font-semibold">Michael Chen</h4>
                  <p className="text-gray-400 text-sm">Business Owner</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed">
                "Easy to set up and use. The QR code checkout system has made transactions so much faster. Our customers love it!"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 animate-slide-up">
            Ready to Transform Your Retail Business?
          </h2>
          <p className="text-xl text-gray-400 mb-12 animate-slide-up" style={{animationDelay: '0.1s'}}>
            Join thousands of retailers who trust MATRIX for their daily operations.
          </p>
          <Link 
            href="/signup"
            className="inline-block group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-5 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl animate-slide-up overflow-hidden"
            style={{animationDelay: '0.2s'}}
          >
            <span className="relative z-10">Start Your Free Trial →</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-white/10">
        {/* Integration Partners */}
        <div className="border-b border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-center text-gray-400 text-sm font-semibold mb-8 uppercase tracking-wider">
              Integrates With Your Favorite Tools
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {/* Integration logos as text badges */}
              <div className="bg-gray-800/50 px-6 py-3 rounded-lg border border-gray-700">
                <span className="text-gray-300 font-semibold">Stripe</span>
              </div>
              <div className="bg-gray-800/50 px-6 py-3 rounded-lg border border-gray-700">
                <span className="text-gray-300 font-semibold">PayPal</span>
              </div>
              <div className="bg-gray-800/50 px-6 py-3 rounded-lg border border-gray-700">
                <span className="text-gray-300 font-semibold">Square</span>
              </div>
              <div className="bg-gray-800/50 px-6 py-3 rounded-lg border border-gray-700">
                <span className="text-gray-300 font-semibold">Shopify</span>
              </div>
              <div className="bg-gray-800/50 px-6 py-3 rounded-lg border border-gray-700">
                <span className="text-gray-300 font-semibold">QuickBooks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-21 h-21 flex items-center justify-center">
                    <Image 
                      src="/imagebg.png" 
                      alt="MATRIX Logo" 
                      width={380}
                      height={740}
                      className="w-21 h-21 object-contain"
                    />
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  Smart Retail Management Platform for modern businesses.
                </p>
              </div>

              {/* Product Links */}
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><Link href="#features" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Features</Link></li>
                  <li><Link href="#pricing" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Pricing</Link></li>
                  <li><Link href="/dashboard" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Dashboard</Link></li>
                  <li><Link href="/analytics" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Analytics</Link></li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">About Us</a></li>
                  <li><a href="#testimonials" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Testimonials</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Contact</a></li>
                </ul>
              </div>

              {/* Resources Links */}
              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Documentation</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">API Reference</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 text-center md:text-left">
                © 2025 MATRIX. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;