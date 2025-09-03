import { useEffect, useRef, useCallback } from 'react';

/**
 * Focus Management Hook for Modals and Dialogs
 * 
 * Provides accessible focus management including:
 * - Focus trapping within modals
 * - Focus restoration when modals close
 * - Keyboard navigation support
 * - Screen reader announcements
 */

interface UseFocusManagerOptions {
  isOpen: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
  autoFocus?: boolean;
}

export const useFocusManager = ({
  isOpen,
  restoreFocus = true,
  trapFocus = true,
  autoFocus = true
}: UseFocusManagerOptions) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const focusTrapCleanupRef = useRef<(() => void) | null>(null);

  // Store previous focus when modal opens
  useEffect(() => {
    if (isOpen && restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen, restoreFocus]);

  // Set up focus trap and auto-focus
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const container = containerRef.current;

      // Auto-focus first focusable element
      if (autoFocus) {
        const focusableElements = getFocusableElements(container);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }

      // Set up focus trap
      if (trapFocus) {
        focusTrapCleanupRef.current = setupFocusTrap(container);
      }
    }

    return () => {
      // Clean up focus trap
      if (focusTrapCleanupRef.current) {
        focusTrapCleanupRef.current();
        focusTrapCleanupRef.current = null;
      }
    };
  }, [isOpen, autoFocus, trapFocus]);

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && restoreFocus && previousFocusRef.current) {
      // Small delay to ensure modal is fully closed
      setTimeout(() => {
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus();
        }
      }, 10);
    }
  }, [isOpen, restoreFocus]);

  const setContainerRef = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
  }, []);

  return {
    setContainerRef
  };
};

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled]):not([aria-hidden="true"])',
    'input:not([disabled]):not([aria-hidden="true"])',
    'select:not([disabled]):not([aria-hidden="true"])',
    'textarea:not([disabled]):not([aria-hidden="true"])',
    'a[href]:not([aria-hidden="true"])',
    '[tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])',
    '[role="button"]:not([disabled]):not([aria-hidden="true"])',
    '[role="link"]:not([aria-hidden="true"])'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter(element => {
      const htmlElement = element as HTMLElement;
      const style = window.getComputedStyle(htmlElement);
      
      // Check if element is visible
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             htmlElement.offsetParent !== null;
    }) as HTMLElement[];
}

/**
 * Set up focus trap within a container
 */
function setupFocusTrap(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    // If no focusable elements, prevent tabbing
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    // If only one focusable element, keep focus on it
    if (focusableElements.length === 1) {
      event.preventDefault();
      firstElement.focus();
      return;
    }

    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab (forward)
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  // Add event listener
  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Hook for managing focus within a specific component
 */
export const useComponentFocus = () => {
  const elementRef = useRef<HTMLElement | null>(null);

  const focusElement = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.focus();
    }
  }, []);

  const blurElement = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.blur();
    }
  }, []);

  const setElementRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  return {
    elementRef: elementRef.current,
    setElementRef,
    focusElement,
    blurElement
  };
};