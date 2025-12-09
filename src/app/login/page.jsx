'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertModal } from '@/components/Modal';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid username or password');
        return;
      }

      // Success - store user info and redirect
      console.log('Login successful:', data.user);
      
      // Store user info in localStorage for frontend use
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      // Redirect to dashboard after successful login
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-matrix-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-6">
            <Image src="/image.png" alt="Matrix Logo" width={80} height={80} className="object-contain" style={{ width: 'auto', height: 'auto' }} priority fetchpriority="high" />
          </div>
          <h2 className="text-4xl font-extrabold text-white">Admin Login</h2>
          <p className="mt-2 text-sm text-matrix-white/60">
            Sign in to your admin account
          </p>
        </div>

        <div className="mt-8 glass-effect py-8 px-4 shadow-matrix-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-matrix-red/10 border border-matrix-red/30 text-matrix-red px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-3 bg-white border border-matrix-accent/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-matrix-accent/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent transition-colors"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-matrix-accent bg-matrix-gray border-matrix-accent/30 rounded focus:ring-matrix-accent focus:ring-offset-matrix-black"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-bold text-black bg-matrix-accent hover:bg-matrix-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-matrix-accent transition-all duration-200 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-matrix-accent/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-matrix-dark text-matrix-white/60">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-matrix-accent/30 rounded-lg shadow-sm bg-matrix-gray text-sm font-medium text-white hover:bg-matrix-accent/10 transition-colors"
              >
                <span className="sr-only">Sign in with Google</span>
                Google
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-matrix-accent/30 rounded-lg shadow-sm bg-matrix-gray text-sm font-medium text-white hover:bg-matrix-accent/10 transition-colors"
              >
                <span className="sr-only">Sign in with Microsoft</span>
                Microsoft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
