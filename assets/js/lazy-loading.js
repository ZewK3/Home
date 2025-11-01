/**
 * PHASE 3: Code Splitting & Lazy Loading Helper
 * Dynamically load modules on demand
 */

class ModuleLoader {
  constructor() {
    this.loaded = new Map();
    this.loading = new Map();
  }
  
  /**
   * Lazy load a module
   * @param {string} moduleName - Module name/path
   * @param {string} path - Module path
   * @returns {Promise} Module exports
   */
  async load(moduleName, path) {
    // Return if already loaded
    if (this.loaded.has(moduleName)) {
      return this.loaded.get(moduleName);
    }
    
    // Wait if currently loading
    if (this.loading.has(moduleName)) {
      return this.loading.get(moduleName);
    }
    
    // Start loading
    const loadPromise = this.loadModule(path);
    this.loading.set(moduleName, loadPromise);
    
    try {
      const module = await loadPromise;
      this.loaded.set(moduleName, module);
      this.loading.delete(moduleName);
      console.log(`✅ Loaded module: ${moduleName}`);
      return module;
    } catch (error) {
      this.loading.delete(moduleName);
      console.error(`❌ Failed to load module: ${moduleName}`, error);
      throw error;
    }
  }
  
  /**
   * Load module via script tag
   */
  loadModule(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = path;
      script.async = true;
      
      script.onload = () => {
        resolve(window); // Return window object with loaded module
      };
      
      script.onerror = () => {
        reject(new Error(`Failed to load script: ${path}`));
      };
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * Preload modules
   */
  preload(modules) {
    modules.forEach(({ name, path }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = path;
      document.head.appendChild(link);
    });
  }
  
  /**
   * Unload module (remove from cache)
   */
  unload(moduleName) {
    this.loaded.delete(moduleName);
    this.loading.delete(moduleName);
  }
}

// Global module loader
const moduleLoader = new ModuleLoader();

/**
 * Lazy component loader
 */
class ComponentLoader {
  constructor() {
    this.components = new Map();
  }
  
  /**
   * Register component
   */
  register(name, loadFn) {
    this.components.set(name, { loadFn, instance: null });
  }
  
  /**
   * Load and render component
   */
  async load(name, container, props = {}) {
    const component = this.components.get(name);
    if (!component) {
      throw new Error(`Component not registered: ${name}`);
    }
    
    // Load if not loaded
    if (!component.instance) {
      console.log(`📦 Loading component: ${name}`);
      component.instance = await component.loadFn();
    }
    
    // Render component
    if (typeof component.instance.render === 'function') {
      component.instance.render(container, props);
    }
    
    return component.instance;
  }
  
  /**
   * Unload component
   */
  unload(name) {
    const component = this.components.get(name);
    if (component && component.instance && typeof component.instance.destroy === 'function') {
      component.instance.destroy();
    }
    this.components.delete(name);
  }
}

// Global component loader
const componentLoader = new ComponentLoader();

/**
 * Route-based code splitting
 */
class RouteLoader {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
  }
  
  /**
   * Register route with lazy loading
   */
  register(path, loadFn) {
    this.routes.set(path, { loadFn, loaded: false });
  }
  
  /**
   * Load route
   */
  async loadRoute(path) {
    const route = this.routes.get(path);
    if (!route) {
      throw new Error(`Route not found: ${path}`);
    }
    
    // Unload current route if different
    if (this.currentRoute && this.currentRoute !== path) {
      await this.unloadCurrentRoute();
    }
    
    // Load new route
    if (!route.loaded) {
      console.log(`🚀 Loading route: ${path}`);
      await route.loadFn();
      route.loaded = true;
    }
    
    this.currentRoute = path;
  }
  
  /**
   * Unload current route
   */
  async unloadCurrentRoute() {
    if (this.currentRoute) {
      console.log(`🗑️  Unloading route: ${this.currentRoute}`);
      // Cleanup logic here
      this.currentRoute = null;
    }
  }
}

// Global route loader
const routeLoader = new RouteLoader();

// Make available globally
if (typeof window !== 'undefined') {
  window.moduleLoader = moduleLoader;
  window.componentLoader = componentLoader;
  window.routeLoader = routeLoader;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ModuleLoader,
    ComponentLoader,
    RouteLoader,
    moduleLoader,
    componentLoader,
    routeLoader
  };
}
