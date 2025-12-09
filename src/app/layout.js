'use client';
import './globals.css';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function RootLayout({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <html lang="en">
        <body>
          <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <Image 
                  src="/image.png" 
                  alt="Matrix Logo" 
                  width={120} 
                  height={120}
                  className="animate-pulse-slow"
                />
              </div>
              <div className="flex flex-col items-center gap-4">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-matrix-accent to-purple-400">
                  MATRIX
                </h1>
                <p className="text-white text-lg">Redirecting to Matrix...</p>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-matrix-accent rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="w-3 h-3 bg-matrix-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-3 h-3 bg-matrix-accent rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        {/* Preconnect to Supabase for faster API calls */}
        <link rel="preconnect" href="https://qdwsqbzlhyxhebdlqath.supabase.co" />
        <link rel="dns-prefetch" href="https://qdwsqbzlhyxhebdlqath.supabase.co" />
      </head>
      <body>{children}</body>
    </html>
  );
}