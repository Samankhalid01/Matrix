'use client';
import { useEffect } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className={`relative ${sizeClasses[size]} w-full mx-4 animate-slide-up`}>
        <div className="glass-effect rounded-lg shadow-matrix-lg border border-matrix-accent/20 overflow-hidden">
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-matrix-accent/20">
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-matrix-white/60 hover:text-matrix-accent transition-colors p-1"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary' // primary, danger, success
}) => {
  const variantStyles = {
    primary: 'bg-matrix-accent hover:bg-matrix-accent-dark text-black',
    danger: 'bg-matrix-red hover:bg-matrix-red-dark text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-matrix-white/80">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-matrix-accent/30 text-matrix-white/80 hover:bg-matrix-gray transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${variantStyles[confirmVariant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Alert Modal
export const AlertModal = ({ 
  isOpen, 
  onClose, 
  title = 'Alert',
  message,
  variant = 'info' // info, success, warning, error
}) => {
  const variantConfig = {
    info: { color: 'text-matrix-blue', icon: 'ℹ️' },
    success: { color: 'text-green-500', icon: '✓' },
    warning: { color: 'text-matrix-yellow', icon: '⚠️' },
    error: { color: 'text-matrix-red', icon: '✕' },
  };

  const config = variantConfig[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className={`text-2xl ${config.color}`}>{config.icon}</span>
          <p className="text-matrix-white/80 flex-1">{message}</p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-matrix-accent hover:bg-matrix-accent-dark text-black font-medium transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
