/**
 * ============================================
 * SKETCHIFY - Landing Page Scripts
 * Animations and interactions for the landing page
 * ============================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all landing page functionality
    initThemeToggle();
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
});

/**
 * Theme Toggle Functionality
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Load saved theme
    const savedTheme = localStorage.getItem('sketchify-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Toggle theme on click
    themeToggle?.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('sketchify-theme', newTheme);
    });
}

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    mobileMenuBtn?.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    mobileMenu?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu?.contains(e.target) && !mobileMenuBtn?.contains(e.target)) {
            mobileMenuBtn?.classList.remove('active');
            mobileMenu?.classList.remove('active');
        }
    });
}

/**
 * Scroll-triggered Animations
 */
function initScrollAnimations() {
    // Elements to animate on scroll
    const animatedElements = document.querySelectorAll(
        '.feature-card, .step, .section-header'
    );
    
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Set initial styles and observe
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
    
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Parallax Effect for Hero Section (subtle)
 */
function initParallax() {
    const hero = document.querySelector('.hero');
    const shapes = document.querySelectorAll('.shape');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        shapes.forEach((shape, index) => {
            const speed = 0.1 + index * 0.05;
            shape.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });
}

/**
 * Counter Animation for Stats
 */
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                const numericValue = parseInt(finalValue.replace(/\D/g, ''));
                
                if (numericValue > 0) {
                    animateValue(target, 0, numericValue, 1500, finalValue);
                }
                
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateValue(element, start, end, duration, template) {
    const range = end - start;
    const startTime = performance.now();
    const suffix = template.replace(/[\d,]+/, '');
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quad
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(start + range * easeProgress);
        
        element.textContent = current.toLocaleString() + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Initialize parallax if hero exists
if (document.querySelector('.hero')) {
    initParallax();
    animateCounters();
}
