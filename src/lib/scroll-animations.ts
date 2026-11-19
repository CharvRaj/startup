// Intersection Observer for scroll animations - High performance & mobile optimized
export const initScrollAnimations = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  document.documentElement.classList.add('js-ready');

  const observerOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '60px 0px 60px 0px',
    threshold: 0.02,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Unobserve to free up CPU cycles on mobile
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with scroll-reveal classes
  const revealElements = document.querySelectorAll(
    '.scroll-reveal:not(.revealed), .scroll-reveal-left:not(.revealed), .scroll-reveal-right:not(.revealed), .scroll-reveal-scale:not(.revealed), .stagger-children:not(.revealed)'
  );

  revealElements.forEach((el) => {
    // If already in viewport on load, reveal immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 60 && rect.bottom > -60) {
      el.classList.add('revealed');
    } else {
      observer.observe(el);
    }
  });

  return observer;
};

// Call this function when the DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initScrollAnimations());
  } else {
    initScrollAnimations();
  }

  // Safety fallback: reveal all elements after 1.8s so content is never hidden on slow devices
  setTimeout(() => {
    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .stagger-children')
      .forEach((el) => el.classList.add('revealed'));
  }, 1800);

  // Re-initialize on route changes
  window.addEventListener('popstate', () => {
    setTimeout(initScrollAnimations, 50);
  });
}
