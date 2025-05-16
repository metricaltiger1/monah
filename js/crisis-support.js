document.addEventListener('DOMContentLoaded', function() {
  // Tab functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Show corresponding content
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Make call buttons functional
  const callButtons = document.querySelectorAll('.action-btn.call');
  callButtons.forEach(button => {
    button.addEventListener('click', function() {
      const phoneNumber = this.closest('.hotline-card').querySelector('.contact-method span').textContent;
      // In a real app, this would initiate a phone call
      alert(`Calling ${phoneNumber}`);
    });
  });

  // Make text buttons functional
  const textButtons = document.querySelectorAll('.action-btn.text');
  textButtons.forEach(button => {
    button.addEventListener('click', function() {
      const textNumber = this.closest('.hotline-card').querySelector('.contact-method span').textContent;
      // In a real app, this would initiate a text message
      alert(`Preparing to text ${textNumber}`);
    });
  });

  // Emergency button functionality
  const emergencyBtn = document.querySelector('.emergency-btn');
  emergencyBtn.addEventListener('click', () => {
    alert('Calling emergency services (911)');
  });

  // Add animation to cards when they come into view
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll('.hotline-card, .emergency-alert, .resource-item');
  animatedElements.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});