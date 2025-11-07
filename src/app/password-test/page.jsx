'use client';
import { useState, useEffect } from 'react';

export default function PasswordTest() {
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Force password field styling
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
      input.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      input.style.fontSize = '16px';
      input.style.letterSpacing = '0.1em';
      input.style.color = '#374151';
      input.style.backgroundColor = '#ffffff';
      
      // Additional WebKit-specific styling
      if (window.chrome) {
        input.style.webkitTextSecurity = 'disc';
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Password Field Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Password Field:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type here - you should see bullets"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '16px',
                letterSpacing: '0.1em',
                color: '#374151',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fallback Style (Courier Font):
            </label>
            <input
              type="password"
              placeholder="Alternative styling"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '18px',
                letterSpacing: '0.2em',
                color: '#374151',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Current password value: {password.replace(/./g, '•')}</p>
            <p>Length: {password.length} characters</p>
          </div>
        </div>
      </div>
    </div>
  );
}