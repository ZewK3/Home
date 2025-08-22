// =====================================================
// DOM UTILITY - EFFICIENT DOM MANIPULATION
// =====================================================
// Utilities to replace innerHTML usage with more efficient
// and secure DOM manipulation methods
// =====================================================

class DOMUtils {
  // Create element with attributes and content
  static createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value; // Keep innerHTML for HTML content
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // Set content
    if (content && typeof content === 'string') {
      element.textContent = content;
    }
    
    return element;
  }

  // Clear and replace content efficiently
  static replaceContent(container, newContent) {
    if (!container) return;
    
    // Clear existing content
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Add new content
    if (typeof newContent === 'string') {
      container.textContent = newContent;
    } else if (newContent instanceof Element) {
      container.appendChild(newContent);
    } else if (Array.isArray(newContent)) {
      newContent.forEach(item => {
        if (typeof item === 'string') {
          container.appendChild(document.createTextNode(item));
        } else if (item instanceof Element) {
          container.appendChild(item);
        }
      });
    }
  }

  // Add multiple options to select element efficiently
  static populateSelect(selectElement, options, defaultOption = null) {
    if (!selectElement) return;
    
    // Clear existing options
    selectElement.innerHTML = '';
    
    // Add default option if provided
    if (defaultOption) {
      const defaultOpt = this.createElement('option', {
        value: defaultOption.value || '',
        textContent: defaultOption.text || 'Chọn...'
      });
      selectElement.appendChild(defaultOpt);
    }
    
    // Add options
    options.forEach(option => {
      const optElement = this.createElement('option', {
        value: option.value || option.storeName || option,
        textContent: option.text || option.storeName || option
      });
      selectElement.appendChild(optElement);
    });
  }

  // Create loading state element
  static createLoadingElement(message = 'Đang tải...') {
    return this.createElement('div', {
      className: 'loading-state',
      innerHTML: `
        <div class="loading-spinner"></div>
        <span class="loading-text">${message}</span>
      `
    });
  }

  // Create error state element
  static createErrorElement(message = 'Đã có lỗi xảy ra') {
    return this.createElement('div', {
      className: 'error-state',
      innerHTML: `
        <div class="error-icon">⚠️</div>
        <span class="error-text">${message}</span>
      `
    });
  }

  // Create empty state element
  static createEmptyElement(message = 'Không có dữ liệu') {
    return this.createElement('div', {
      className: 'empty-state',
      innerHTML: `
        <div class="empty-icon">📭</div>
        <span class="empty-text">${message}</span>
      `
    });
  }

  // Efficient notification creation
  static createNotification(message, type = 'info') {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    return this.createElement('div', {
      className: `notification notification-${type}`,
      innerHTML: `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
      `
    });
  }

  // Safely update element content with text
  static updateTextContent(element, content) {
    if (!element) return;
    element.textContent = content || '';
  }

  // Safely update element with HTML (use sparingly)
  static updateHTMLContent(element, htmlContent, sanitize = true) {
    if (!element) return;
    
    if (sanitize) {
      // Basic sanitization - remove script tags
      htmlContent = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    
    element.innerHTML = htmlContent;
  }

  // Add CSS animation class temporarily
  static animateElement(element, animationClass, duration = 1000) {
    if (!element) return;
    
    element.classList.add(animationClass);
    
    setTimeout(() => {
      element.classList.remove(animationClass);
    }, duration);
  }

  // Toggle element visibility with animation
  static toggleVisibility(element, show = null) {
    if (!element) return;
    
    const isVisible = element.style.display !== 'none';
    const shouldShow = show !== null ? show : !isVisible;
    
    if (shouldShow) {
      element.style.display = '';
      element.classList.add('fade-in');
      setTimeout(() => element.classList.remove('fade-in'), 300);
    } else {
      element.classList.add('fade-out');
      setTimeout(() => {
        element.style.display = 'none';
        element.classList.remove('fade-out');
      }, 300);
    }
  }

  // Create card element with content
  static createCard(title, content, className = '') {
    const card = this.createElement('div', {
      className: `card ${className}`
    });

    if (title) {
      const cardHeader = this.createElement('div', {
        className: 'card-header'
      });
      const cardTitle = this.createElement('h3', {
        className: 'card-title',
        textContent: title
      });
      cardHeader.appendChild(cardTitle);
      card.appendChild(cardHeader);
    }

    const cardBody = this.createElement('div', {
      className: 'card-body'
    });

    if (typeof content === 'string') {
      cardBody.textContent = content;
    } else if (content instanceof Element) {
      cardBody.appendChild(content);
    }

    card.appendChild(cardBody);
    return card;
  }

  // Batch DOM operations for better performance
  static batchUpdate(container, updateFunction) {
    if (!container || typeof updateFunction !== 'function') return;
    
    // Hide container during updates to prevent reflows
    const originalDisplay = container.style.display;
    container.style.display = 'none';
    
    try {
      updateFunction(container);
    } finally {
      // Restore display
      container.style.display = originalDisplay;
    }
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMUtils;
}

// Global assignment for script tag usage
if (typeof window !== 'undefined') {
  window.DOMUtils = DOMUtils;
}