document.addEventListener("DOMContentLoaded", function () {
  // Mark body as loaded for fade-in transition
  document.body.classList.add("loaded");

  // Audio Context Setup
  let audioContext;
  let audioBuffer;
  let sourceNode;
  let gainNode;
  let isPlaying = false;
  let isMuted = false;
  let currentTime = 0;
  const totalDuration = 600; // 10 minutes in seconds
  let timeInterval;
  let breathPhase = 0;
  let currentAmbience = "cosmic";
  const audioUrls = [
    "../audio/birds39-forest-20772.mp3",
    "../audio/meditation1.mp3", 
    "../audio/meditation2.mp3",    
  ];
  
  // DOM Elements
  const startPrompt = document.getElementById("start-prompt");
  const errorMessage = document.getElementById("error-message");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const volumeBtn = document.getElementById("volume-btn");
  const ambienceBtn = document.getElementById("ambience-btn");
  const exitBtn = document.getElementById("exit-btn");
  const currentTimeDisplay = document.getElementById("current-time");
  const totalTimeDisplay = document.getElementById("total-time");
  const breathText = document.getElementById("breath-text");
  const breathInstruction = document.getElementById("breath-instruction");
  const breathingOrb = document.getElementById("breathing-orb");
  const rhythmBars = document.querySelectorAll(".rhythm-bar");
  const starsContainer = document.getElementById("stars");
  const particlesContainer = document.getElementById("particles");

  // Initialize
  initAudio();
  createStars();
  createParticles();
  totalTimeDisplay.textContent = formatTime(totalDuration);
  setupControlListeners();

  // Format time (seconds to mm:ss)
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  // Initialize Web Audio API
  async function initAudio() {
    try {
      // Select a random audio URL from the array
      const randomIndex = Math.floor(Math.random() * audioUrls.length);
      const audioUrl = audioUrls[randomIndex];
  
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioContext.createGain();
      gainNode.gain.value = 0.7; // Initial volume
      gainNode.connect(audioContext.destination);
  
      // Load audio buffer
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
      console.log("Audio initialized successfully");
    } catch (error) {
      console.error("Audio initialization failed:", error);
      showError("Failed to load audio. Falling back to basic audio.");
      fallbackAudio();
    }
  }
  

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 5000);
  }

  function startMeditation() {
    console.log("Starting meditation");
    // Hide start prompt
    startPrompt.classList.add("hidden");

    // Resume audio context and start meditation
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume();
    }
    if (!isPlaying) {
      startAudio();
      isPlaying = true;
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      playPauseBtn.setAttribute("aria-label", "Pause meditation");
      timeInterval = setInterval(updateTime, 1000);
      startBreathingCycle();
    }
  }

  function fallbackAudio() {
    console.log("Using fallback audio");
    const audio = new Audio(audioUrl);
    audio.loop = true;

    document.body.addEventListener(
      "click",
      async function () {
        try {
          console.log("First click: Starting fallback audio");
          startPrompt.classList.add("hidden");
          if (!isPlaying) {
            await audio.play();
            isPlaying = true;
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            playPauseBtn.setAttribute("aria-label", "Pause meditation");
            timeInterval = setInterval(updateTime, 1000);
            startBreathingCycle();
          }
        } catch (error) {
          console.error("Fallback audio failed:", error);
          showError("Unable to play audio. Continuing without sound.");
          // Proceed without audio
          startPrompt.classList.add("hidden");
          if (!isPlaying) {
            isPlaying = true;
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            playPauseBtn.setAttribute("aria-label", "Pause meditation");
            timeInterval = setInterval(updateTime, 1000);
            startBreathingCycle();
          }
        }
      },
      { once: true }
    );

    playPauseBtn.addEventListener("click", async function () {
      console.log("Play/Pause clicked in fallback mode");
      isPlaying = !isPlaying;
      if (isPlaying) {
        try {
          await audio.play();
          this.innerHTML = '<i class="fas fa-pause"></i>';
          this.setAttribute("aria-label", "Pause meditation");
          startBreathingCycle();
          timeInterval = setInterval(updateTime, 1000);
        } catch (error) {
          console.error("Fallback audio play failed:", error);
          showError("Unable to play audio. Continuing without sound.");
        }
      } else {
        audio.pause();
        this.innerHTML = '<i class="fas fa-play"></i>';
        this.setAttribute("aria-label", "Play meditation");
        clearInterval(timeInterval);
        stopBreathingAnimation();
      }
    });
  }
  function startAudio() {
    if (!sourceNode) {
      // Select a random audio URL from the array
      const randomIndex = Math.floor(Math.random() * audioUrls.length);
      const audioUrl = audioUrls[randomIndex];
  
      // Fetch and load the selected audio file
      fetchAudio(audioUrl);
  
      animateRhythmBars();
      console.log("Audio started");
    }
  }

  async function fetchAudio(audioUrl) {
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
      if (sourceNode) {
        sourceNode.stop();
        sourceNode.disconnect();
      }
  
      sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.loop = true;
      sourceNode.connect(gainNode);
      sourceNode.start();
    } catch (error) {
      console.error("Audio loading failed:", error);
      showError("Failed to load audio.");
    }
  }
  

  function stopAudio() {
    if (sourceNode) {
      sourceNode.stop();
      sourceNode.disconnect();
      sourceNode = null;
      console.log("Audio stopped");
    }
  }

  // Update time display
  function updateTime() {
    currentTime++;
    currentTimeDisplay.textContent = formatTime(currentTime);

    if (currentTime >= totalDuration) {
      resetMeditation();
    }
  }

  // Breathing animation
  function startBreathingCycle() {
    updateBreathing();
    animateBreathing();
  }

  function updateBreathing() {
    switch (breathPhase) {
      case 0: // Inhale
        breathText.textContent = "Breathe In";
        breathInstruction.textContent =
          "Inhale deeply through your nose for 4 seconds, filling your lungs completely";
        break;
      case 1: // Hold after inhale
        breathText.textContent = "Hold";
        breathInstruction.textContent =
          "Hold your breath for 4 seconds, maintaining a sense of calm";
        break;
      case 2: // Exhale
        breathText.textContent = "Breathe Out";
        breathInstruction.textContent =
          "Exhale slowly through your mouth for 6 seconds, releasing all tension";
        break;
      case 3: // Hold after exhale
        breathText.textContent = "Hold";
        breathInstruction.textContent =
          "Remain empty for 2 seconds, enjoying the stillness";
        break;
    }

    // Pulse animation for text
    gsap.from(breathText, {
      duration: 0.5,
      scale: 1.2,
      ease: "back.out(1.7)",
    });
  }

  function animateBreathing() {
    gsap.killTweensOf(breathingOrb);
    switch (breathPhase) {
      case 0: // Inhale (4s)
        gsap.to(breathingOrb, {
          scale: 1.2,
          duration: 4,
          ease: "sine.inOut",
          onComplete: function () {
            breathPhase = 1;
            updateBreathing();
            animateBreathing();
          },
        });
        break;
      case 1: // Hold after inhale (4s)
        gsap.to(breathingOrb, {
          scale: 1.2,
          duration: 4,
          ease: "none",
          onComplete: function () {
            breathPhase = 2;
            updateBreathing();
            animateBreathing();
          },
        });
        break;
      case 2: // Exhale (6s)
        gsap.to(breathingOrb, {
          scale: 1,
          duration: 6,
          ease: "sine.inOut",
          onComplete: function () {
            breathPhase = 3;
            updateBreathing();
            animateBreathing();
          },
        });
        break;
      case 3: // Hold after exhale (2s)
        gsap.to(breathingOrb, {
          scale: 1,
          duration: 2,
          ease: "none",
          onComplete: function () {
            breathPhase = 0;
            updateBreathing();
            animateBreathing();
          },
        });
        break;
    }
  }

  function stopBreathingAnimation() {
    gsap.killTweensOf(breathingOrb);
    gsap.set(breathingOrb, { scale: 1 });
    rhythmBars.forEach((bar) => gsap.killTweensOf(bar));
    gsap.set(rhythmBars, { scaleY: 1, opacity: 0.6 });
  }

  // Animate rhythm bars
  function animateRhythmBars() {
    rhythmBars.forEach((bar, i) => {
      gsap.to(bar, {
        duration: 0.5,
        scaleY: Math.random() * 1.5 + 0.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: i * 0.1,
      });
    });
  }

  // Create stars
  function createStars() {
    const starCount = window.innerWidth < 768 ? 100 : 200;

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.classList.add("star");

      const size = Math.random() * 3;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;

      const duration = Math.random() * 5 + 5;
      const opacity = Math.random() * 0.8 + 0.2;
      star.style.setProperty("--duration", `${duration}s`);
      star.style.setProperty("--opacity", opacity);

      starsContainer.appendChild(star);
    }
  }

  // Create floating particles
  function createParticles() {
    const particleCount = window.innerWidth < 768 ? 10 : 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");

      const size = Math.random() * 15 + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      const xPos = Math.random() * 100 - 10;
      particle.style.setProperty("--x", `${xPos}%`);

      const duration = Math.random() * 20 + 20;
      particle.style.setProperty("--duration", `${duration}s`);

      particle.style.animationDelay = `${Math.random() * -20}s`;

      particlesContainer.appendChild(particle);
    }
  }

  // Change ambience
  function changeAmbience() {
    console.log("Ambience button clicked");
    currentAmbience = currentAmbience === "cosmic" ? "nature" : "cosmic";

    // Smooth transition
    gsap.to(
      ".cosmic-bg, .breathing-orb, .breathing-guide, .controls, .time-display",
      {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: updateAmbienceVisuals,
      }
    );
  }

  function updateAmbienceVisuals() {
    if (currentAmbience === "nature") {
      document.body.style.background = "#1B5E20";
      document.querySelector(".cosmic-bg").style.background =
        "linear-gradient(to bottom, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)";
      ambienceBtn.innerHTML = '<i class="fas fa-star"></i>';
    } else {
      document.body.style.background = "#2E3440";
      document.querySelector(".cosmic-bg").style.background =
        "radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)";
      ambienceBtn.innerHTML = '<i class="fas fa-mountain"></i>';
    }

    gsap.to(
      ".cosmic-bg, .breathing-orb, .breathing-guide, .controls, .time-display",
      {
        opacity: 1,
        duration: 0.8,
        ease: "power2.inOut",
      }
    );
  }

  // Reset meditation
  function resetMeditation() {
    stopAudio();
    clearInterval(timeInterval);
    stopBreathingAnimation();

    isPlaying = false;
    currentTime = 0;
    currentTimeDisplay.textContent = "0:00";
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    playPauseBtn.setAttribute("aria-label", "Play meditation");
    startPrompt.classList.remove("hidden");
    console.log("Meditation reset");
  }

  // Setup control event listeners
  function setupControlListeners() {
    if (!playPauseBtn || !volumeBtn || !ambienceBtn || !exitBtn) {
      console.error("One or more control buttons not found");
      return;
    }

    console.log("Setting up control event listeners");

    playPauseBtn.addEventListener("click", function () {
      console.log("Play/Pause button clicked");
      isPlaying = !isPlaying;

      if (isPlaying) {
        if (audioContext) {
          startAudio();
        }
        this.innerHTML = '<i class="fas fa-pause"></i>';
        this.setAttribute("aria-label", "Pause meditation");
        timeInterval = setInterval(updateTime, 1000);
        startBreathingCycle();
      } else {
        if (audioContext) {
          stopAudio();
        }
        this.innerHTML = '<i class="fas fa-play"></i>';
        this.setAttribute("aria-label", "Play meditation");
        clearInterval(timeInterval);
        stopBreathingAnimation();
      }
    });

    volumeBtn.addEventListener("click", function () {
      console.log("Volume button clicked");
      isMuted = !isMuted;
      if (gainNode) {
        gainNode.gain.value = isMuted ? 0 : 0.7;
      }
      this.innerHTML = isMuted
        ? '<i class="fas fa-volume-mute"></i>'
        : '<i class="fas fa-volume-up"></i>';
      this.setAttribute(
        "aria-label",
        isMuted ? "Unmute audio" : "Mute audio"
      );
    });

    ambienceBtn.addEventListener("click", changeAmbience);

    exitBtn.addEventListener("click", function () {
      console.log("Exit button clicked");
      gsap.to(".meditation-container", {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: function () {
          try {
            window.history.back();
          } catch (e) {
            console.warn("History back failed, redirecting to home");
            window.location.href = "/"; // Fallback
          }
        },
      });
    });

    // Enable audio and meditation on first interaction
    document.body.addEventListener("click", startMeditation, {
      once: true,
    });
  }

  // Handle visibility changes
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (isPlaying && audioContext) {
        stopAudio();
      }
      isPlaying = false;
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      playPauseBtn.setAttribute("aria-label", "Play meditation");
      clearInterval(timeInterval);
      stopBreathingAnimation();
      console.log("Page hidden, meditation paused");
    } else if (isPlaying && audioContext) {
      startAudio();
      console.log("Page visible, resuming audio");
    }
  });
});
