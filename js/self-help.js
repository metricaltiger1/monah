document.addEventListener('DOMContentLoaded', function() {
  // Check for user data and get first name
  const firstName = window.userData?.username?.split(' ')[0] || 'User';
  
  // DOM Elements
  const searchInput = document.getElementById('search-input');
  const searchButton = document.querySelector('.search-button');
  const tabButtons = document.querySelectorAll('.tab-button');
  const resourceCards = document.querySelectorAll('.resource-card');
  const playButtons = document.querySelectorAll('.play-button');
  const audioPlayerContainer = document.querySelector('.audio-player');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const progressBar = document.getElementById('progress-bar');
  const currentTimeEl = document.getElementById('current-time');
  const durationEl = document.getElementById('duration');
  const closePlayerBtn = document.getElementById('close-player-btn');
  const playerTitle = document.getElementById('player-title');
  const playerDescription = document.getElementById('player-description');
  const journalTabs = document.querySelectorAll('.journal-tab');
  const newEntryTab = document.getElementById('new-entry-tab');
  const pastEntriesTab = document.getElementById('past-entries-tab');
  const journalText = document.getElementById('journal-text');
  const wordCount = document.querySelector('.word-count');
  const saveEntryBtn = document.getElementById('save-entry-btn');
  const newPromptBtn = document.getElementById('new-prompt-btn');
  const promptText = document.querySelector('.prompt-text');
  const entriesContainer = document.getElementById('entries-container');
  const editModal = document.getElementById('edit-modal');
  const closeEditModalBtn = document.getElementById('close-edit-modal');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const saveEditBtn = document.getElementById('save-edit-btn');
  const deleteEntryBtn = document.getElementById('delete-entry-btn');
  const editEntryDate = document.getElementById('edit-entry-date');
  const editEntryPrompt = document.getElementById('edit-entry-prompt');
  const editEntryText = document.getElementById('edit-entry-text');
  const searchClearButton = document.getElementById('search-clear-button');
  const searchIcon = document.getElementById('search-icon');
  const clearIcon = document.getElementById('clear-icon');

// Add this event listener with your other setup
searchInput.addEventListener('input', toggleSearchIcons);
searchClearButton.addEventListener('click', handleSearchClear);

function toggleSearchIcons() {
  if (searchInput.value.trim() !== '') {
    // Show clear icon when there's text
    searchIcon.classList.add('hidden');
    clearIcon.classList.remove('hidden');
  } else {
    // Show search icon when empty
    searchIcon.classList.remove('hidden');
    clearIcon.classList.add('hidden');
    // Also trigger search with empty term to reset view
    handleSearch();
  }
}

function handleSearchClear() {
  if (searchInput.value.trim() !== '') {
    // Clear the input
    searchInput.value = '';
    // Trigger search to reset view
    handleSearch();
    // Toggle icons back to search
    toggleSearchIcons();
    // Focus back on the input
    searchInput.focus();
  }
}

  // Audio Player State
  const audio = new Audio();
  let isPlaying = false;
  let currentAudio = null;
  let currentEntryId = null;
  let progressInterval = null;

  // Set current date
  const currentDate = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('current-date').textContent = currentDate.toLocaleDateString('en-US', options);

  // Journal prompts with personalized options
  const prompts = [
    "What was the highlight of your day and why?",
    "What's one thing you learned about yourself recently?",
    "Describe a challenge you faced today and how you handled it.",
    "What are three things that made you smile today?",
    "If you could give your past self one piece of advice, what would it be?",
    "What's one small step you can take tomorrow toward a personal goal?",
    `How are you feeling right now, ${firstName}?`,
    "What's something you appreciate about yourself today?",
    "What would make tomorrow a good day for you?",
    "Describe a moment today when you felt at peace."
  ];

  // Initialize the app
  init();

  function init() {
    loadJournalEntries();
    setupEventListeners();
  }

  function setupEventListeners() {
    // Tab filtering
    tabButtons.forEach(button => {
      button.addEventListener('click', handleTabClick);
    });

    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    searchButton.addEventListener('click', handleSearch);

    // Audio playback
    playButtons.forEach(button => {
      button.addEventListener('click', handlePlayButtonClick);
    });

    // Audio player controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    closePlayerBtn.addEventListener('click', resetAudioPlayer);
    document.querySelector('.progress-container').addEventListener('click', handleProgressBarClick);

    // Journal functionality
    journalText.addEventListener('input', updateWordCount);
    saveEntryBtn.addEventListener('click', handleSaveEntry);
    newPromptBtn.addEventListener('click', getNewPrompt);

    // Journal tabs
    journalTabs.forEach(tab => {
      tab.addEventListener('click', handleJournalTabClick);
    });

    // Modal functionality
    closeEditModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveEditedEntry);
    deleteEntryBtn.addEventListener('click', handleDeleteEntry);
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) closeEditModal();
    });

    // Audio event listeners
    audio.addEventListener('timeupdate', updateProgressBar);
    audio.addEventListener('ended', resetAudioPlayer);
    audio.addEventListener('loadedmetadata', () => {
      durationEl.textContent = formatTime(audio.duration);
    });
  }

  // Tab and search functionality
  function handleTabClick() {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    filterResources(this.dataset.category, searchInput.value);
  }

  function handleSearch() {
    const activeTab = document.querySelector('.tab-button.active');
    filterResources(activeTab.dataset.category, searchInput.value);
  }

  function filterResources(category, searchTerm) {
  const searchLower = searchTerm.toLowerCase();
  let visibleCount = 0;
  const noResultsMessage = document.querySelector('.no-results-message');
  
  resourceCards.forEach(card => {
    const matchesCategory = category === 'all' || card.dataset.category === category;
    const matchesSearch = searchTerm === '' || 
      card.dataset.title.toLowerCase().includes(searchLower) || 
      card.dataset.description.toLowerCase().includes(searchLower);
    
    if (matchesCategory && matchesSearch) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });
  
  // Show no results message if no cards are visible
  if (visibleCount === 0) {
    noResultsMessage.classList.remove('hidden');
  } else {
    noResultsMessage.classList.add('hidden');
  }
}

  // Audio player functionality
  function handlePlayButtonClick() {
    const card = this.closest('.resource-card');
    const title = card.querySelector('h3').textContent;
    const description = card.querySelector('p').textContent;
    const audioFile = this.dataset.audio;
    
    if (currentAudio === audioFile && isPlaying) {
      pauseAudio();
      return;
    }
    
    playAudio(title, description, audioFile);
  }

  function playAudio(title, description, audioFile) {
      // Stop any currently playing audio
      resetAudioPlayer();
      
      // Set up new audio - changed this line to point to the audio folder
      audio.src = `audio/${audioFile}`;
      currentAudio = audioFile;
      
      // Update UI
      playerTitle.textContent = title;
      playerDescription.textContent = description;
      audioPlayerContainer.classList.remove('hidden');
      
      // Play audio
      audio.play()
        .then(() => {
          isPlaying = true;
          updatePlayPauseButton();
        })
        .catch(error => {
          console.error('Audio playback error:', error);
          alert('Could not play the audio. Please try again.');
        });
  }

  function togglePlayPause() {
    if (isPlaying) {
      pauseAudio();
    } else if (currentAudio) {
      audio.play()
        .then(() => {
          isPlaying = true;
          updatePlayPauseButton();
        });
    }
  }

  function pauseAudio() {
    audio.pause();
    isPlaying = false;
    updatePlayPauseButton();
  }

  function resetAudioPlayer() {
    audio.pause();
    isPlaying = false;
    currentAudio = null;
    audio.currentTime = 0;
    updatePlayPauseButton();
    progressBar.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    audioPlayerContainer.classList.add('hidden');
  }

  function updatePlayPauseButton() {
    playPauseBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
  }

  function updateProgressBar() {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }

  function handleProgressBarClick(e) {
    if (!currentAudio) return;
    
    const progressContainer = e.currentTarget;
    const clickPosition = e.clientX - progressContainer.getBoundingClientRect().left;
    const seekPercentage = (clickPosition / progressContainer.clientWidth) * 100;
    const seekTime = (seekPercentage / 100) * audio.duration;
    
    audio.currentTime = seekTime;
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Journal functionality
  function updateWordCount() {
    const words = journalText.value.trim().split(/\s+/).filter(word => word.length > 0);
    wordCount.textContent = `${words.length}/500 words`;
    wordCount.style.color = words.length > 500 ? '#e74c3c' : 'var(--text-lighter)';
  }

  function handleJournalTabClick() {
    journalTabs.forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    
    newEntryTab.classList.toggle('hidden', this.dataset.tab !== 'new-entry');
    pastEntriesTab.classList.toggle('hidden', this.dataset.tab !== 'past-entries');
    
    if (this.dataset.tab === 'past-entries') {
      loadJournalEntries();
    }
  }

  function handleSaveEntry() {
    const entry = journalText.value.trim();
    const prompt = promptText.textContent;
    
    if (!entry) {
      alert('Please write something before saving.');
      return;
    }
    
    saveJournalEntry(prompt, entry);
  }

  function getNewPrompt() {
    const availablePrompts = prompts.filter(p => p !== promptText.textContent);
    const randomPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)] || prompts[0];
    promptText.textContent = randomPrompt;
    
    // Visual feedback
    newPromptBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Prompt Changed!';
    setTimeout(() => {
      newPromptBtn.innerHTML = '<i class="fas fa-lightbulb"></i> New Prompt';
    }, 1500);
  }

  // Journal data management
  function loadJournalEntries() {
    const entries = getJournalEntries();
    entriesContainer.innerHTML = '';
    
    if (!entries.length) {
      entriesContainer.innerHTML = `
        <div class="no-entries">
          <i class="far fa-clipboard"></i>
          <p>No journal entries yet. Start writing to see them here.</p>
        </div>
      `;
      return;
    }
    
    entries.forEach(entry => {
      const entryEl = createJournalEntryElement(entry);
      entriesContainer.appendChild(entryEl);
    });
  }

  function createJournalEntryElement(entry) {
    const entryDate = new Date(entry.date);
    const formattedDate = entryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const entryEl = document.createElement('div');
    entryEl.className = 'journal-entry-card';
    entryEl.dataset.entryId = entry.id;
    entryEl.innerHTML = `
      <div class="entry-header">
        <div class="entry-date">${formattedDate}</div>
        <div class="entry-actions">
          <button class="entry-action edit-entry" data-entry-id="${entry.id}">
            <i class="far fa-edit"></i> Edit
          </button>
          <button class="entry-action delete-entry" data-entry-id="${entry.id}">
            <i class="far fa-trash-alt"></i> Delete
          </button>
        </div>
      </div>
      <div class="entry-prompt">${entry.prompt}</div>
      <div class="entry-content">${entry.content}</div>
    `;
    
    // Add event listeners to action buttons
    entryEl.querySelector('.edit-entry').addEventListener('click', () => openEditModal(entry.id));
    entryEl.querySelector('.delete-entry').addEventListener('click', () => deleteJournalEntry(entry.id));
    
    return entryEl;
  }

  function getJournalEntries() {
    try {
      const entriesJson = localStorage.getItem('journalEntries');
      return entriesJson ? JSON.parse(entriesJson) : [];
    } catch (error) {
      console.error('Error loading journal entries:', error);
      return [];
    }
  }

  function saveJournalEntry(prompt, content) {
    const entries = getJournalEntries();
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      prompt,
      content,
      firstName
    };
    
    entries.unshift(newEntry);
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    
    // Clear and reset UI
    journalText.value = '';
    updateWordCount();
    getNewPrompt();
    
    // Show success feedback
    showSaveSuccess();
    
    // Refresh if on past entries view
    if (document.querySelector('.journal-tab[data-tab="past-entries"]').classList.contains('active')) {
      loadJournalEntries();
    }
  }

  function showSaveSuccess() {
    saveEntryBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    saveEntryBtn.style.backgroundColor = '#2ecc71';
    
    setTimeout(() => {
      saveEntryBtn.innerHTML = '<i class="far fa-save"></i> Save Entry';
      saveEntryBtn.style.backgroundColor = 'var(--primary)';
    }, 2000);
  }

  // Modal functionality
  function openEditModal(entryId) {
    const entries = getJournalEntries();
    const entry = entries.find(e => e.id === entryId);
    
    if (!entry) return;
    
    currentEntryId = entryId;
    const entryDate = new Date(entry.date);
    const formattedDate = entryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    editEntryDate.textContent = formattedDate;
    editEntryPrompt.textContent = entry.prompt;
    editEntryText.value = entry.content;
    
    editModal.classList.add('active');
  }

  function closeEditModal() {
    editModal.classList.remove('active');
    currentEntryId = null;
  }

  function saveEditedEntry() {
    if (!currentEntryId) return;
    
    const entries = getJournalEntries();
    const entryIndex = entries.findIndex(e => e.id === currentEntryId);
    
    if (entryIndex === -1) return;
    
    entries[entryIndex].content = editEntryText.value;
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    
    loadJournalEntries();
    closeEditModal();
  }

  function handleDeleteEntry() {
    if (currentEntryId) {
      deleteJournalEntry(currentEntryId);
    }
  }

  function deleteJournalEntry(entryId) {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;
    
    const entries = getJournalEntries();
    const updatedEntries = entries.filter(e => e.id !== entryId);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    
    loadJournalEntries();
    if (currentEntryId === entryId) {
      closeEditModal();
    }
  }
});