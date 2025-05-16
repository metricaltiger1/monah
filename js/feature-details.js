document.addEventListener('DOMContentLoaded', function() {
    // Get the feature parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const featureName = urlParams.get('feature');
    
    // Feature data - in a real app this might come from an API
    const featuresData = {
      'emotional-tracking': {
        title: 'Emotional Tracking',
        tagline: 'Understand your emotional patterns over time',
        icon: '../assets/animations/heart-beat.json',
        description: 'Monah\'s advanced emotional tracking helps you identify patterns in your moods and feelings. Our system learns from your interactions to recognize when you might need extra support, offering proactive check-ins and insights about your emotional wellbeing.',
        benefits: [
          'Identifies recurring emotional patterns',
          'Proactively checks in when detecting mood changes',
          'Provides visual reports of your emotional journey',
          'Helps recognize triggers for different emotional states',
          'Tracks progress over weeks and months'
        ],
        useCases: [
          {
            title: 'Mood Journaling',
            description: 'Automatically logs your emotional states throughout the day without manual input.',
            icon: '../assets/animations/journal.json'
          },
          {
            title: 'Pattern Recognition',
            description: 'Highlights recurring emotional patterns tied to specific times, events, or people.',
            icon: '../assets/animations/pattern.json'
          },
          {
            title: 'Progress Tracking',
            description: 'Shows your emotional growth and stability improvements over time.',
            icon: '../assets/animations/progress.json'
          }
        ]
      },
      'personalized-support': {
        title: 'Personalized Support',
        tagline: 'Responses crafted just for you',
        icon: '../assets/animations/personalized.json',
        description: 'Monah adapts to your unique communication style and emotional needs. The more you interact, the better Monah understands how to support you effectively, creating a truly personalized emotional support experience.',
        benefits: [
          'Learns your preferred communication style',
          'Adapts to your specific emotional needs',
          'Remembers important details about your life',
          'Develops customized coping strategies for you',
          'Adjusts tone and approach based on your mood'
        ],
        useCases: [
          {
            title: 'Tailored Responses',
            description: 'Provides support that matches your personality and current emotional state.',
            icon: '../assets/animations/tailored.json'
          },
          {
            title: 'Memory Context',
            description: 'Remembers past conversations to provide continuity in your emotional journey.',
            icon: '../assets/animations/memory.json'
          },
          {
            title: 'Adaptive Tone',
            description: 'Adjusts its communication style based on your preferences and needs.',
            icon: '../assets/animations/tone.json'
          }
        ]
      },
      'resources': {
        title: 'Well-being Resources',
        tagline: 'Tools for your mental health journey',
        icon: '../assets/animations/resources.json',
        description: 'Access a curated library of mental health resources including guided meditations, breathing exercises, cognitive behavioral therapy tools, and connections to professional help when needed. All resources are personalized based on your emotional patterns and needs.',
        benefits: [
          'Personalized meditation recommendations',
          'Guided breathing exercises for anxiety',
          'CBT-based tools for challenging thoughts',
          'Sleep and relaxation techniques',
          'Direct connections to professional help'
        ],
        useCases: [
          {
            title: 'Guided Meditations',
            description: 'Access mindfulness exercises tailored to your current emotional state.',
            icon: '../assets/animations/meditation.json'
          },
          {
            title: 'Crisis Resources',
            description: 'Get immediate help with curated resources during difficult moments.',
            icon: '../assets/animations/crisis.json'
          },
          {
            title: 'Skill Building',
            description: 'Learn emotional regulation techniques through interactive exercises.',
            icon: '../assets/animations/skills.json'
          }
        ]
      },
      'privacy': {
        title: 'Privacy Focused',
        tagline: 'Your secrets are safe with us',
        icon: '../assets/animations/privacy.json',
        description: 'Your emotional wellbeing data is handled with the utmost care. All conversations are encrypted end-to-end, and we never sell or share your personal information. You have complete control over your data.',
        benefits: [
          'End-to-end encrypted conversations',
          'No data sharing with third parties',
          'Option to delete your data anytime',
          'Anonymous usage options available',
          'Transparent privacy policies'
        ],
        useCases: [
          {
            title: 'Secure Storage',
            description: 'All your data is encrypted both in transit and at rest.',
            icon: '../assets/animations/secure.json'
          },
          {
            title: 'Data Control',
            description: 'Easily view, export, or delete your personal data at any time.',
            icon: '../assets/animations/control.json'
          },
          {
            title: 'Anonymous Mode',
            description: 'Option to use the service without personal identifiers.',
            icon: '../assets/animations/anonymous.json'
          }
        ]
      }
    };
  
    // Get the feature data
    const feature = featuresData[featureName] || featuresData['emotional-tracking'];
    
    // Render the feature details
    renderFeatureDetails(feature);
    
    // Initialize particles
    if (document.getElementById('particles-js')) {
      initParticles();
    }
  });
  
  function renderFeatureDetails(feature) {
    const container = document.getElementById('feature-details');
    
    // Create benefits list HTML
    const benefitsList = feature.benefits.map(benefit => `
      <li class="benefit-item">
        <i class="fas fa-check-circle benefit-icon"></i>
        <span>${benefit}</span>
      </li>
    `).join('');
    
    // Create use cases HTML
    const useCases = feature.useCases.map(useCase => `
      <div class="use-case-card">
        <div class="use-case-icon">
          <lottie-player
            src="${useCase.icon}"
            background="transparent"
            speed="1"
            loop
            autoplay
          ></lottie-player>
        </div>
        <h4 class="use-case-title">${useCase.title}</h4>
        <p>${useCase.description}</p>
      </div>
    `).join('');
    
    // Build the complete HTML
    container.innerHTML = `
      <div class="feature-header">
        <div class="feature-icon-large">
          <lottie-player
            src="${feature.icon}"
            background="transparent"
            speed="1"
            loop
            autoplay
          ></lottie-player>
        </div>
        <div>
          <h1 class="feature-title">${feature.title}</h1>
          <p class="feature-tagline">${feature.tagline}</p>
        </div>
      </div>
      
      <div class="feature-content">
        <div class="feature-description">
          <p>${feature.description}</p>
        </div>
        
        <div class="feature-benefits">
          <h3 class="benefits-title">Key Benefits</h3>
          <ul class="benefits-list">
            ${benefitsList}
          </ul>
        </div>
      </div>
      
      <div class="feature-use-cases">
        <h3 class="use-cases-title">How People Use This Feature</h3>
        <div class="use-cases-grid">
          ${useCases}
        </div>
      </div>
    `;
  }