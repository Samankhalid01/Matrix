'use client';

import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, type, message }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-red-500" />;
      default:
        return <CheckCircle className="h-16 w-16 text-blue-500" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error';
      default:
        return 'Notification';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-bold mb-3 ${
            type === 'success' ? 'text-green-600' : 
            type === 'error' ? 'text-red-600' : 
            'text-blue-600'
          }`}>
            {getTitle()}
          </h2>

          {/* Message */}
          <p className="text-gray-600 text-lg mb-6">
            {message}
          </p>

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
              type === 'success' 
                ? 'bg-green-500 hover:bg-green-600' 
                : type === 'error'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            OK
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
