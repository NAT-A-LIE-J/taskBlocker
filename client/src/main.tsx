import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker, requestPersistentStorage, isPWA } from './utils/sw-registration';

// Register service worker and handle PWA features
const initializePWA = async () => {
  // Register service worker
  await registerServiceWorker();
  
  // Request persistent storage for better data retention
  await requestPersistentStorage();
  
  // Handle PWA-specific features
  if (isPWA()) {
    console.log('App is running as PWA');
    
    // Prevent accidental page refresh
    window.addEventListener('beforeunload', (e) => {
      // Only show confirmation if there's unsaved data
      const hasUnsavedData = localStorage.getItem('timeblock-has-unsaved-changes');
      if (hasUnsavedData === 'true') {
        e.preventDefault();
        e.returnValue = '';
      }
    });
    
    // Handle back button in PWA
    window.addEventListener('popstate', (e) => {
      // Customize back button behavior if needed
      console.log('Back button pressed in PWA');
    });
  }
  
  // Handle service worker backup requests
  window.addEventListener('sw-backup-request', () => {
    // Trigger your existing backup functionality
    console.log('Service worker requested backup');
    // You can call your backup function here
    // backupData();
  });
  
  // Handle app updates
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt available');
    // You can store this event and trigger it later with a custom install button
    (window as any).deferredPrompt = e;
  });
  
  // Detect when app is launched from home screen
  window.addEventListener('appinstalled', (e) => {
    console.log('PWA was installed');
    // You can track this event or show a welcome message
  });
};

// Handle URL parameters for PWA shortcuts
const handleURLParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  
  if (action) {
    // Handle shortcuts from manifest.json
    setTimeout(() => {
      switch (action) {
        case 'add-task':
          // Trigger add task modal
          window.dispatchEvent(new CustomEvent('pwa-add-task'));
          break;
        case 'start-timer':
          // Trigger timer start
          window.dispatchEvent(new CustomEvent('pwa-start-timer'));
          break;
        default:
          break;
      }
    }, 1000); // Wait for app to load
  }
};

// Performance monitoring for PWA
const trackPerformance = () => {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('App load time:', perfData.loadEventEnd - perfData.fetchStart);
      
      // Track Core Web Vitals if needed
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log('Performance metric:', entry.name, entry.value);
          }
        });
        
        observer.observe({ entryTypes: ['measure', 'mark'] });
      }
    });
  }
};

// Initialize everything
const init = async () => {
  // Remove loading screen
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.remove();
  }
  
  // Initialize PWA features
  await initializePWA();
  
  // Handle URL parameters
  handleURLParams();
  
  // Track performance
  trackPerformance();
  
  // Render React app
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Start the app
init().catch(console.error);