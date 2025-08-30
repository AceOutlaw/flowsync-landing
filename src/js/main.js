/**
 * FlowSync Landing Page - Main JavaScript
 * Modern ES6+ JavaScript for interactive functionality
 */

// ==========================================================================
// DOM Ready Handler
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('FlowSync Landing Page initialized');
    
    // Initialize all components
    initializeNavigation();
    initializeSmoothScrolling();
    initializeCurrentYear();
    initializeScrollEffects();
    initializeFormHandlers();
    
    // Example of modern async/await usage
    initializeAsyncComponents();
});

// ==========================================================================
// Navigation Component
// ==========================================================================

function initializeNavigation() {
    const navbarToggle = document.getElementById('navbar-toggle');
    const navbarMenu = document.getElementById('navbar-menu');
    
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', () => {
            const isExpanded = navbarToggle.getAttribute('aria-expanded') === 'true';
            
            // Toggle aria-expanded for accessibility
            navbarToggle.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle menu visibility
            navbarMenu.classList.toggle('is-active');
            
            // Update hamburger animation
            navbarToggle.classList.toggle('is-active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbarToggle.contains(e.target) && !navbarMenu.contains(e.target)) {
                navbarMenu.classList.remove('is-active');
                navbarToggle.classList.remove('is-active');
                navbarToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navbarMenu.classList.contains('is-active')) {
                navbarMenu.classList.remove('is-active');
                navbarToggle.classList.remove('is-active');
                navbarToggle.setAttribute('aria-expanded', 'false');
                navbarToggle.focus();
            }
        });
    }
}

// ==========================================================================
// Smooth Scrolling for Anchor Links
// ==========================================================================

function initializeSmoothScrolling() {
    // Select all anchor links that point to sections on the same page
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Close mobile menu if open
                const navbarMenu = document.getElementById('navbar-menu');
                const navbarToggle = document.getElementById('navbar-toggle');
                if (navbarMenu?.classList.contains('is-active')) {
                    navbarMenu.classList.remove('is-active');
                    navbarToggle?.classList.remove('is-active');
                    navbarToggle?.setAttribute('aria-expanded', 'false');
                }
                
                // Smooth scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update focus for accessibility
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
                targetElement.addEventListener('blur', () => {
                    targetElement.removeAttribute('tabindex');
                }, { once: true });
            }
        });
    });
}

// ==========================================================================
// Current Year Update
// ==========================================================================

function initializeCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ==========================================================================
// Scroll Effects
// ==========================================================================

function initializeScrollEffects() {
    let ticking = false;
    
    function updateScrollEffects() {
        const scrollY = window.scrollY;
        const header = document.querySelector('.header');
        
        // Add/remove scrolled class for header styling
        if (header) {
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        ticking = false;
    }
    
    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
}

// ==========================================================================
// Form Handlers
// ==========================================================================

function initializeFormHandlers() {
    // Example form handler for future contact forms
    const forms = document.querySelectorAll('form[data-form-type]');
    
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmission);
    });
}

async function handleFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const formType = form.dataset.formType;
    
    // Disable form during submission
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent;
    
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
    }
    
    try {
        // Example API call (replace with actual endpoint)
        const response = await fetch(`/api/${formType}`, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.ok) {
            showNotification('Thank you! Your message has been sent.', 'success');
            form.reset();
        } else {
            throw new Error('Failed to send message');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
        
    } finally {
        // Re-enable form
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }
}

// ==========================================================================
// Notification System
// ==========================================================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease-in-out',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    });
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Allow manual dismissal on click
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// ==========================================================================
// Async Component Initialization
// ==========================================================================

async function initializeAsyncComponents() {
    try {
        // Example: Load and initialize components that require async operations
        await initializeAnalytics();
        await loadExternalWidgets();
        
    } catch (error) {
        console.warn('Some async components failed to initialize:', error);
    }
}

async function initializeAnalytics() {
    // Example: Initialize analytics (Google Analytics, etc.)
    // This is where you'd load your analytics code
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('Analytics initialized');
            resolve();
        }, 100);
    });
}

async function loadExternalWidgets() {
    // Example: Load external widgets or third-party scripts
    // This could include chat widgets, social media embeds, etc.
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('External widgets loaded');
            resolve();
        }, 200);
    });
}

// ==========================================================================
// Utility Functions
// ==========================================================================

// Debounce function for performance optimization
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ==========================================================================
// Export functions for potential module usage
// ==========================================================================

// If using modules in the future, these functions can be exported
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeNavigation,
        initializeSmoothScrolling,
        showNotification,
        debounce,
        throttle,
        isElementInViewport
    };
}