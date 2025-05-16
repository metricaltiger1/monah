document.addEventListener('DOMContentLoaded', function () {
  // Music setup
  const musicFiles = [
    "../audio/birds39-forest-20772.mp3",
    "../audio/meditation1.mp3", 
    "../audio/meditation2.mp3",    
  
  ];

  const randomTrack = musicFiles[Math.floor(Math.random() * musicFiles.length)];
  const audio = new Audio(randomTrack);
  audio.loop = true; // Optional: loop music

  const playPauseBtn = document.getElementById('play-pause');
  const rewindBtn = document.getElementById('rewind');
  const forwardBtn = document.getElementById('forward');
  const progressFill = document.querySelector('.progress-fill');
  const progressBar = document.querySelector('.progress-bar');
  const currentTimeDisplay = document.querySelector('.current-time');
  const durationDisplay = document.querySelector('.duration');
  const muteBtn = document.getElementById('mute-btn');

  let isPlaying = false;
  let progress = 0;
  let progressInterval;

  const backButton = document.querySelector('.back-button');
  backButton.addEventListener('click', () => {
    window.history.back();
  });

 
  forwardBtn.parentElement.insertBefore(muteBtn, forwardBtn);

  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteBtn.innerHTML = audio.muted
      ? '<i class="fas fa-volume-mute"></i>'
      : '<i class="fas fa-volume-up"></i>';
  });

  // Tip carousel functionality
  const tipsCarousel = document.querySelector('.tips-carousel');
  const tipCards = document.querySelectorAll('.tip-card');
  const indicators = document.querySelectorAll('.indicator');
  let currentTip = 0;

  updatePlayerUI();
  startCarousel();

  playPauseBtn.addEventListener('click', togglePlay);
  rewindBtn.addEventListener('click', rewind);
  forwardBtn.addEventListener('click', forward);

  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const newProgress = (clickPosition / rect.width) * 100;
    progress = Math.min(100, Math.max(0, newProgress));
    updateProgress();
  });

  function togglePlay() {
    isPlaying = !isPlaying;

    if (isPlaying) {
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      progressInterval = setInterval(updatePlayback, 1000);
      audio.play();
      animateBreath(true);
    } else {
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      clearInterval(progressInterval);
      audio.pause();
      animateBreath(false);
    }

    updatePlayerUI();
  }

  function updatePlayback() {
    progress = (audio.currentTime / audio.duration) * 100;
    updateProgress();
  }
  

  function updateProgress() {
    progressFill.style.width = `${progress}%`;
    const currentSeconds = Math.floor((progress / 100) * 600);
    const minutes = Math.floor(currentSeconds / 60);
    const seconds = currentSeconds % 60;
    currentTimeDisplay.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  function rewind() {
    const currentTime = audio.currentTime;
    audio.currentTime = Math.max(0, currentTime - 5);
    progress = (audio.currentTime / audio.duration) * 100;
    updateProgress();
  }
  

  function forward() {
    const currentTime = audio.currentTime;
    audio.currentTime = Math.min(audio.duration, currentTime + 5);
    progress = (audio.currentTime / audio.duration) * 100;
    updateProgress();
  }
  

  function updatePlayerUI() {
    if (isPlaying) {
      playPauseBtn.classList.add('playing');
    } else {
      playPauseBtn.classList.remove('playing');
    }
  }

  // Carousel
  function startCarousel() {
    setInterval(() => {
      currentTip = (currentTip + 1) % tipCards.length;
      updateCarousel();
    }, 5000);
  }

  function updateCarousel() {
    tipCards.forEach((card, index) => {
      card.classList.toggle('active', index === currentTip);
    });

    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === currentTip);
    });

    tipsCarousel.scrollTo({
      left: currentTip * tipsCarousel.offsetWidth,
      behavior: 'smooth',
    });
  }

  // Breathing animation
  function animateBreath(animate) {
    const breathCircle = document.querySelector('.breath-circle');
    const siblings = breathCircle?.parentElement?.querySelectorAll('.breath-circle, .circle-1, .circle-2, .circle-3');
    if (!siblings) return;
    siblings.forEach(el => {
      el.style.animationPlayState = animate ? 'running' : 'paused';
    });
  }

  // GSAP animation
  gsap.to('.circle-1', {
    y: '-=20',
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });

  gsap.to('.circle-2', {
    y: '+=20',
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });

  gsap.to('.circle-3', {
    y: '-=15',
    x: '+=10',
    duration: 6,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
});
