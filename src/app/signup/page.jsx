'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    storeName: '',
    storeAddress: '',
    phoneNumber: '',
    role: 'admin', // Default to admin for store owners
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.storeName || !formData.storeAddress || !formData.phoneNumber) {
      setError('Please fill in all fields');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error creating account. Please try again.');
        return;
      }

      // Success - redirect to admin dashboard
      console.log('Signup successful:', data.user);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-matrix-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/image.png" alt="Matrix Logo" width={60} height={60} className="object-contain" style={{ width: 'auto', height: 'auto' }} priority fetchpriority="high" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Create your account</h2>
          <p className="mt-2 text-sm text-matrix-white/60">
            Already have an account?{' '}
            <Link href="/login" className="text-matrix-accent hover:text-matrix-accent-dark font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 glass-effect py-8 px-4 shadow-matrix-lg sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-8 flex justify-center">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-matrix-accent text-black' : 'bg-matrix-gray text-matrix-white/40'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-matrix-accent' : 'bg-matrix-gray'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-matrix-accent text-black' : 'bg-matrix-gray text-matrix-white/40'
              }`}>
                2
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-white">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-4 py-3 bg-matrix-gray border border-matrix-accent/30 rounded-lg text-white placeholder-matrix-white/50 focus:outline-none focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-white">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-4 py-3 bg-matrix-gray border border-matrix-accent/30 rounded-lg text-white placeholder-matrix-white/50 focus:outline-none focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-3 bg-matrix-gray border border-matrix-accent/30 rounded-lg text-white placeholder-matrix-white/50 focus:outline-none focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      className="block w-full px-4 py-3 pr-12 bg-matrix-gray border border-matrix-accent/30 rounded-lg text-white placeholder-matrix-white/50 focus:outline-none focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent transition-colors"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-matrix-white/60 hover:text-matrix-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12l4.242-4.242M9.878 9.878a3 3 0 00-4.242 4.242m0 0L12 12m7.02-2.66c.578.95.92 2.049.92 3.16 0 1.111-.342 2.21-.92 3.16m-7.02 2.66a3 3 0 110-6m0 6l-4.242-4.242" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-matrix-white/60 hover:text-matrix-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm your password"
                      className="block w-full px-4 py-3 pr-12 bg-matrix-gray border border-matrix-accent/30 rounded-lg text-white placeholder-matrix-white/50 focus:outline-none focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent transition-colors"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5 text-matrix-white/60 hover:text-matrix-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12l4.242-4.242M9.878 9.878a3 3 0 00-4.242 4.242m0 0L12 12m7.02-2.66c.578.95.92 2.049.92 3.16 0 1.111-.342 2.21-.92 3.16m-7.02 2.66a3 3 0 110-6m0 6l-4.242-4.242" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-matrix-white/60 hover:text-matrix-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-bold text-black bg-matrix-accent hover:bg-matrix-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-matrix-accent transition-all"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="storeName" className="block text-sm font-medium text-white">
                    Store Name
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    id="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-3 bg-matrix-gray border border-matrix-accent/30 rounded-lg text-white placeholder-matrix-white/50 focus:outline-none focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="storeAddress" className="block text-sm font-medium text-white">
                    Store Address
                  </label>
                  <textarea
                    name="storeAddress"
                    id="storeAddress"
                    rows="3"
                    value={formData.storeAddress}
                    onChange={handleChange}
                    required
                    placeholder="Enter your store address..."
                    className="mt-1 block w-full px-4 py-3 bg-matrix-gray border border-matrix-accent/30 rounded-lg text-white placeholder-matrix-white/50 focus:outline-none focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent transition-colors resize-none"
                    style={{ minHeight: '80px' }}
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-white">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-3 bg-matrix-gray border border-matrix-accent/30 rounded-lg text-white placeholder-matrix-white/50 focus:outline-none focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent transition-colors"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 px-4 border border-matrix-accent/30 rounded-lg shadow-sm text-sm font-medium text-white bg-matrix-gray hover:bg-matrix-accent/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-matrix-accent transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 py-3 px-4 rounded-lg shadow-sm text-sm font-bold text-black bg-matrix-accent hover:bg-matrix-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-matrix-accent transition-all ${
                      isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
