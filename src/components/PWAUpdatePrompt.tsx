'use client';

import { useState, useEffect } from 'react';
import { X, Download, RefreshCw } from 'lucide-react';

interface PWAUpdatePromptProps {
  onUpdate?: () => void;
  onDismiss?: () => void;
}

export default function PWAUpdatePrompt({ onUpdate, onDismiss }: PWAUpdatePromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    let registration: ServiceWorkerRegistration | null = null;

    // Check for service worker updates
    const checkForUpdates = async () => {
      if ('serviceWorker' in navigator) {
        try {
          registration = await navigator.serviceWorker.ready;
          
          // Listen for new service worker installations
          registration.addEventListener('updatefound', () => {
            const newWorker = registration!.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New update available
                  setUpdateAvailable(true);
                  setIsVisible(true);
                }
              });
            }
          });

          // Check if there's already a waiting service worker
          if (registration.waiting) {
            setUpdateAvailable(true);
            setIsVisible(true);
          }

          // Listen for controller change (when update is applied)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });

        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      }
    };

    checkForUpdates();

    // Check for updates periodically
    const interval = setInterval(() => {
      if (registration) {
        registration.update();
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleUpdate = () => {
    setIsInstalling(true);
    
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          // Tell the waiting service worker to become active
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }

    onUpdate?.();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Update Available
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A new version is ready
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          A new version of IT Quiz App is available with improvements and bug fixes. 
          Update now to get the latest features.
        </p>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={handleUpdate}
            disabled={isInstalling}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isInstalling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Update Now</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleDismiss}
            className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200"
          >
            Later
          </button>
        </div>

        {/* Version info */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Version: {process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'} • 
            <span className="ml-1">Auto-update enabled</span>
          </p>
        </div>
      </div>
    </div>
  );
}