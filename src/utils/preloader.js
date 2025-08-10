// Utility to preload critical routes for better user experience

// Preload critical components that users are likely to visit
export const preloadCriticalRoutes = () => {
  // Preload home page and common routes
  const criticalImports = [
    () => import('../pages/home/Index'),
    () => import('../pages/About'),
    () => import('../pages/Courses/Index'),
    () => import('../pages/auth/Login'),
    () => import('../pages/auth/Register')
  ];

  // Use requestIdleCallback for better performance
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      criticalImports.forEach(importFn => {
        importFn().catch(() => {
          // Silently ignore preload errors
        });
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      criticalImports.forEach(importFn => {
        importFn().catch(() => {
          // Silently ignore preload errors
        });
      });
    }, 2000);
  }
};

// Preload service pages on hover or interaction
export const preloadServiceRoutes = () => {
  const serviceImports = [
    () => import('../pages/services/iGamingDetail'),
    () => import('../pages/services/CryptoExchangeDetail'),
    () => import('../pages/services/AISolutionsDetail'),
    () => import('../pages/services/MobileAppsDetail'),
    () => import('../pages/services/EcommerceDetail'),
    () => import('../pages/services/TechTrainingDetail')
  ];

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      serviceImports.forEach(importFn => {
        importFn().catch(() => {
          // Silently ignore preload errors
        });
      });
    });
  }
};

// Preload user dashboard after successful login
export const preloadUserDashboard = () => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      import('../pages/students/StudentDashboard').catch(() => {
        // Silently ignore preload errors
      });
    });
  }
};

// Initialize preloading on app start
export const initializePreloading = () => {
  // Wait for initial render before preloading
  setTimeout(() => {
    preloadCriticalRoutes();
    
    // Preload service routes after a delay
    setTimeout(() => {
      preloadServiceRoutes();
    }, 3000);
  }, 1000);
};
