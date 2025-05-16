document.addEventListener('DOMContentLoaded', function() {
    // Typing animation for landing page
    const typingText = document.getElementById('typing-text');
    if (typingText) {
        initTypingAnimation();
    }
    
    // Setup hover effects
    setupHoverEffects();
    
    // Initialize emotion floaties if on chat page
    if (document.getElementById('emotion-floaties')) {
        initEmotionFloaties();
    }
});

// Typing animation
function initTypingAnimation() {
    const phrases = [
        "I'm here to listen",
        "Tell me how you feel",
        "You're not alone",
        "Let's talk about it"
    ];
    
    const typingText = document.getElementById('typing-text');
    let currentPhrase = 0;
    let currentChar = 0;
    let isDeleting = false;
    let isEnd = false;
    
    function type() {
        const fullTxt = phrases[currentPhrase];
        
        if (isDeleting) {
            typingText.textContent = fullTxt.substring(0, currentChar - 1);
            currentChar--;
        } else {
            typingText.textContent = fullTxt.substring(0, currentChar + 1);
            currentChar++;
        }
        
        // Typing speed
        let typeSpeed = 100;
        
        if (isDeleting) {
            typeSpeed /= 2;
        }
        
        // If word is complete
        if (!isDeleting && currentChar === fullTxt.length) {
            isEnd = true;
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && currentChar === 0) {
            isDeleting = false;
            isEnd = false;
            currentPhrase = (currentPhrase + 1) % phrases.length;
            typeSpeed = 500;
        }
        
        setTimeout(type, typeSpeed);
    }
    
    // Start typing animation
    setTimeout(type, 1000);
}

// Hover effects
function setupHoverEffects() {
    document.querySelectorAll('.hover-effect').forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            button.style.setProperty('--mouse-x', `${x}px`);
            button.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// Emotion floaties
function initEmotionFloaties() {
    const floatiesContainer = document.getElementById('emotion-floaties');
    const emotions = ['happy', 'sad', 'angry', 'anxious', 'neutral'];
    
    // Create initial floaties
    for (let i = 0; i < 12; i++) {
        createFloaties(floatiesContainer, emotions[Math.floor(Math.random() * emotions.length)]);
    }
    
    // Add new floaties periodically
    setInterval(() => {
        if (floatiesContainer.children.length < 15) {
            createFloaties(floatiesContainer, emotions[Math.floor(Math.random() * emotions.length)]);
        }
    }, 3000);
}

function createFloaties(container, emotion) {
    const floatie = document.createElement('div');
    floatie.className = 'emotion-floatie';
    
    // Set floatie content based on emotion
    const floatieContent = {
        happy: ['😊', '😄', '🌟', '🎉'],
        sad: ['😢', '☔', '🌧️', '💔'],
        angry: ['😠', '💢', '👊', '🔥'],
        anxious: ['😰', '😨', '🌀', '⚠️'],
        neutral: ['😐', '⚖️', '🌫️', '🌀']
    }[emotion];
    
    floatie.textContent = floatieContent[Math.floor(Math.random() * floatieContent.length)];
    
    // Random positioning and styling
    const leftPos = Math.random() * 100;
    const size = Math.random() * 20 + 10;
    const duration = Math.random() * 10 + 5;
    const delay = Math.random() * 3;
    const opacity = Math.random() * 0.5 + 0.3;
    
    floatie.style.left = `${leftPos}%`;
    floatie.style.fontSize = `${size}px`;
    floatie.style.animationDuration = `${duration}s`;
    floatie.style.animationDelay = `${delay}s`;
    floatie.style.opacity = opacity;
    
    container.appendChild(floatie);
    
    // Remove floatie after animation completes
    setTimeout(() => {
        floatie.remove();
    }, (duration + delay) * 1000);
}

// Ripple effect
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple effect to buttons
document.querySelectorAll('.ripple-effect').forEach(button => {
    button.addEventListener('click', createRipple);
});