document.addEventListener('DOMContentLoaded', function() {
  
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/monah/service_worker.js")
      .then(reg => console.log("Service Worker registered!", reg))
      .catch(err => console.error("Service Worker registration failed:", err));
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  
  function toggleMenu() {
    mobileMenuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
    
    // Toggle menu lines animation
    const lines = mobileMenuBtn.querySelectorAll('.menu-line');
    if (mobileMenuBtn.classList.contains('active')) {
      lines[0].style.transform = 'translateY(8px) rotate(45deg)';
      lines[1].style.opacity = '0';
      lines[2].style.transform = 'translateY(-8px) rotate(-45deg)';
    } else {
      lines[0].style.transform = '';
      lines[1].style.opacity = '';
      lines[2].style.transform = '';
    }
  }
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', toggleMenu);
  }
  
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', toggleMenu);
  }
  // Testimonial carousel
  const testimonials = document.querySelectorAll('.testimonial');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const dotsContainer = document.querySelector('.carousel-dots');
  let currentIndex = 0;
  let carouselInterval;

  // Create dots
  testimonials.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.carousel-dot');

  function updateCarousel() {
    testimonials.forEach((testimonial, index) => {
      testimonial.classList.toggle('active', index === currentIndex);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % testimonials.length;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    updateCarousel();
  }

  // Autoplay
  function startAutoplay() {
    carouselInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    clearInterval(carouselInterval);
  }

  // Event listeners
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  document.querySelector('.testimonials-carousel').addEventListener('mouseenter', stopAutoplay);
  document.querySelector('.testimonials-carousel').addEventListener('mouseleave', startAutoplay);

  // Start carousel
  updateCarousel();
  startAutoplay();

 // Typing animation for hero text
  const typingText = document.getElementById('typing-text');
  if (typingText) {
    const phrases = [
      "You're not alone.",
      "How are you really feeling?",
      "Let's talk about it.",
      "Your feelings matter."
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isEnd = false;
    
    function type() {
      const currentPhrase = phrases[phraseIndex];
      
      if (isDeleting) {
        typingText.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingText.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }
      
      if (!isDeleting && charIndex === currentPhrase.length) {
        isEnd = true;
        setTimeout(() => {
          isDeleting = true;
          type();
        }, 2000);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(type, 500);
      } else {
        const speed = isDeleting ? 50 : isEnd ? 100 : 150;
        setTimeout(type, speed);
      }
    }
    
    // Start typing after a short delay
    setTimeout(type, 1000);
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Close mobile menu if open
        if (mobileMenu.classList.contains('active')) {
          toggleMenu();
        }
        
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // Donation buttons
  document.querySelectorAll('.donate-button').forEach(button => {
    button.addEventListener('click', function() {
      const amount = this.getAttribute('data-amount') || 
                    document.querySelector('.donation-input input').value;
      
      // In a real implementation, this would redirect to PayPal/Stripe
      alert(`Thank you for your donation of $${amount}! This would redirect to payment processing in a live implementation.`);
    });
  });

  // Update copyright year
  document.getElementById('current-year').textContent = new Date().getFullYear();

  // Add hover effects to buttons
  document.querySelectorAll('.hover-effect').forEach(button => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      button.style.setProperty('--mouse-x', `${x}px`);
      button.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Add pulse animation to CTA buttons
  document.querySelectorAll('.pulse').forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.classList.add('pulse-animate');
    });
    
    button.addEventListener('animationend', () => {
      button.classList.remove('pulse-animate');
    });
  });

  // Add glow animation to special CTA buttons
  document.querySelectorAll('.pulse-glow').forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.classList.add('glow-animate');
    });
    
    button.addEventListener('animationend', () => {
      button.classList.remove('glow-animate');
    });
  });


// Counter animation
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  const speed = 200;
  
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-count');
    const count = +counter.innerText;
    const increment = target / speed;
    
    if (count < target) {
      counter.innerText = Math.ceil(count + increment);
      counter.classList.add('animated');
      setTimeout(animateCounters, 1);
    } else {
      counter.innerText = target;
    }
  });
}

// Intersection Observer for counter animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const donationSection = document.querySelector('.donation-section');
if (donationSection) {
  observer.observe(donationSection);
}

// Payment buttons (placeholder - in real implementation would redirect to payment processors)
document.querySelectorAll('.payment-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const method = this.classList.contains('mpesa-btn') ? 'M-Pesa' : 'PayPal';
    alert(`This would redirect to ${method} payment processing in a live implementation. Thank you for your support!`);
  });
});


});

