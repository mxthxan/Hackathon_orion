/**
 * Focus Management Utilities
 * 
 * These utilities help manage focus for accessibility, especially important
 * for screen reader users and keyboard navigation.
 */

export const focusHelpers = {
  /**
   * Move focus to an element by ID
   */
  focusById(elementId: string): boolean {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      return true;
    }
    return false;
  },

  /**
   * Move focus to the first focusable element within a container
   */
  focusFirst(container: HTMLElement): boolean {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  },

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  },

  /**
   * Trap focus within a modal or dialog
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element initially
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Store current focus and return a function to restore it
   */
  storeFocus(): () => void {
    const activeElement = document.activeElement as HTMLElement;
    
    return () => {
      if (activeElement && typeof activeElement.focus === 'function') {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          activeElement.focus();
        }, 10);
      }
    };
  },

  /**
   * Announce text to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  /**
   * Check if an element is visible and focusable
   */
  isFocusable(element: HTMLElement): boolean {
    if (element.hasAttribute('disabled') || element.getAttribute('tabindex') === '-1') {
      return false;
    }

    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }

    return true;
  },

  /**
   * Find the next focusable element in tab order
   */
  getNextFocusable(currentElement: HTMLElement, direction: 'forward' | 'backward' = 'forward'): HTMLElement | null {
    const allFocusable = this.getFocusableElements(document.body);
    const currentIndex = allFocusable.indexOf(currentElement);
    
    if (currentIndex === -1) return null;
    
    const nextIndex = direction === 'forward' 
      ? (currentIndex + 1) % allFocusable.length
      : (currentIndex - 1 + allFocusable.length) % allFocusable.length;
    
    return allFocusable[nextIndex] || null;
  }
};

/**
 * React hook for focus management in modals
 */
export const useFocusManager = (isOpen: boolean) => {
  const restoreFocusRef = React.useRef<(() => void) | null>(null);
  const trapFocusRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      // Store current focus
      restoreFocusRef.current = focusHelpers.storeFocus();
    } else {
      // Restore focus when modal closes
      if (restoreFocusRef.current) {
        restoreFocusRef.current();
        restoreFocusRef.current = null;
      }
    }

    return () => {
      // Cleanup focus trap
      if (trapFocusRef.current) {
        trapFocusRef.current();
        trapFocusRef.current = null;
      }
    };
  }, [isOpen]);

  const setupFocusTrap = React.useCallback((container: HTMLElement | null) => {
    if (container && isOpen) {
      trapFocusRef.current = focusHelpers.trapFocus(container);
    }
  }, [isOpen]);

  return { setupFocusTrap };
};