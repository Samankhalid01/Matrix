'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Services', path: '/services' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Admin', path: '/admin' }
  ];

  return (
    <nav className="glass-effect border-b border-matrix-accent/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10">
                <Image 
                  src="/logo.svg" 
                  alt="Matrix Logo" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-matrix-accent transition-colors">
                MATRIX
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="text-matrix-white/70 hover:text-matrix-accent px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-matrix-gray"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/login"
              className="ml-4 px-4 py-2 rounded-lg bg-matrix-accent hover:bg-matrix-accent-dark text-black font-medium transition-all hover-lift"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-matrix-white/70 hover:text-matrix-accent hover:bg-matrix-gray transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-matrix-accent/20 animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="text-matrix-white/70 hover:text-matrix-accent hover:bg-matrix-gray block px-3 py-2 rounded-lg text-base font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/login"
              className="block px-3 py-2 rounded-lg bg-matrix-accent hover:bg-matrix-accent-dark text-black font-medium text-center transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
