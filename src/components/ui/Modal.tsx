'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, children, title, size = 'md' }: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="flex items-center justify-center min-h-full p-4">
        <div
          className={cn(
            'relative bg-white rounded-xl shadow-xl w-full animate-scaleIn',
            sizes[size]
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-[var(--secondary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className={cn(!title && 'pt-4', 'p-4')}>
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--secondary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {children}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}
