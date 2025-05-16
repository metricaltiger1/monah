// OpenAI API configuration (client-side for demo; move to server in production)
const OPENAI_API_KEY = 'your-openai-api-key-here'; // Replace with your key (securely in production)
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Storage keys
const CONVERSATION_STORAGE_KEY = 'chat_conversation';
const EMOTION_HISTORY_KEY = 'emotion_history';
const CURRENT_MOOD_KEY = 'currentMood';
const RESPONSE_HISTORY_KEY = 'response_history';
const STREAK_STORAGE_KEY = 'streak';
const LAST_VISIT_KEY = 'lastVisit';

// Global variables
let conversationHistory = [];
let streak = localStorage.getItem(STREAK_STORAGE_KEY) ? parseInt(localStorage.getItem(STREAK_STORAGE_KEY)) : 1;

document.addEventListener("DOMContentLoaded", function() {
  // DOM Elements
  const chatAppContainer = document.getElementById("chat-app-container");
  const chatMessages = document.getElementById("chat-messages");
  const messageInput = document.getElementById("message-input");
  const sendBtn = document.getElementById("send-btn");
  const emojiBtn = document.querySelector(".emoji-btn");
  const emotionFloaties = document.getElementById("emotion-floaties");
  const currentEmotionIndicator = document.getElementById("current-emotion");
  const streakCountEl = document.getElementById("streak-count");
  const menuBtn = document.querySelector(".menu-btn");
  const dropdownMenu = document.querySelector(".dropdown-menu");
  const resourcesBtn = document.getElementById("resources-btn");
  const signoutBtn = document.getElementById("signout-btn");
  const resourcesModal = document.getElementById("resources-modal");
  const emotionFeedbackModal = document.getElementById("emotion-feedback-modal");
  const detectedEmotionSpan = document.getElementById("detected-emotion");
  const closeModals = document.querySelectorAll(".close-modal");
  const backBtn = document.querySelector(".back-btn");
  const feedbackOptions = document.querySelectorAll(".feedback-option");

  // Current state
  let currentEmotionState = localStorage.getItem(CURRENT_MOOD_KEY) || "neutral";
  let currentModal = null;

  // Initialize
  init();

  async function init() {
    // Set initial emotion
    setCurrentEmotion(currentEmotionState);

    // Check and update streak
    checkStreak();
    streakCountEl.textContent = `${streak} ${streak === 1 ? "day" : "days"}`; 

    // Wait for user data
    await waitForUserData();

    // Load all history data
    await loadAllHistoryData();

    // Load initial messages
    loadDemoMessages();

    // Set up event listeners
    setupEventListeners();
  }

  function checkStreak() {
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const today = new Date().toDateString();
    
    if (lastVisit !== today) {
        streak++;
        localStorage.setItem(STREAK_STORAGE_KEY, streak);
        localStorage.setItem(LAST_VISIT_KEY, today);
        streakCountEl.textContent = `${streak} ${streak === 1 ? "day" : "days"}`; // Update display immediately
        
        if (streak > 1) {
            alert(`🎉 Great job! You've kept your streak going for ${streak} days!`);
        }
    } else {
        // Ensure the display shows the current streak even if no update was needed
        streakCountEl.textContent = `${streak} ${streak === 1 ? "day" : "days"}`;
    }
}

  function waitForUserData() {
    return new Promise((resolve) => {
      if (window.userData) {
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          if (window.userData) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      }
    });
  }

  async function loadAllHistoryData() {
    // Try LocalStorage first
    const localConvo = localStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (localConvo) {
      conversationHistory = JSON.parse(localConvo);
      renderConversationHistory();
      return;
    }

    // If no local storage, try Firebase
    const user = firebase.auth().currentUser;
    if (user) {
      try {
        // Load conversation history
        const convoDoc = await firebase.firestore()
          .collection('conversations')
          .doc(user.uid)
          .get();
        
        if (convoDoc.exists) {
          conversationHistory = convoDoc.data().messages || [];
          localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversationHistory));
          renderConversationHistory();
        }

        // Load emotion history
        const emotionDoc = await firebase.firestore()
          .collection('emotion_history')
          .doc(user.uid)
          .get();
        
        if (emotionDoc.exists) {
          localStorage.setItem(EMOTION_HISTORY_KEY, JSON.stringify(emotionDoc.data().emotions || []));
        }

        // Load response history
        const responseDoc = await firebase.firestore()
          .collection('response_history')
          .doc(user.uid)
          .get();
        
        if (responseDoc.exists) {
          localStorage.setItem(RESPONSE_HISTORY_KEY, JSON.stringify(responseDoc.data().responses || []));
        }

        // Load current mood
        const userDoc = await firebase.firestore()
          .collection('users')
          .doc(user.uid)
          .get();
        
        if (userDoc.exists && userDoc.data().currentMood) {
          localStorage.setItem(CURRENT_MOOD_KEY, userDoc.data().currentMood);
          currentEmotionState = userDoc.data().currentMood;
          setCurrentEmotion(currentEmotionState);
        }

      } catch (error) {
        console.error('Error loading data from Firebase:', error);
      }
    }
  }

  function renderConversationHistory() {
    conversationHistory.forEach(msg => {
      const messageElement = createMessageElement(msg.content, msg.role === 'user' ? 'user' : 'monah');
      chatMessages.appendChild(messageElement);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function loadDemoMessages() {
    if (chatMessages.children.length <= 1 && conversationHistory.length === 0) {
      let greeting = "Hello! I'm Monah, your emotional support companion.";
      if (window.userData && window.userData.username) {
        const firstName = window.userData.username.split(' ')[0];
        greeting = `Hello ${firstName}! I'm Monah, your emotional support companion.`;
      }
      const welcomeMessage = createMessageElement(
        `${greeting} I'm here to listen and support you. How are you feeling today?`,
        "monah"
      );
      chatMessages.appendChild(welcomeMessage);
      
      const welcomeMessageData = { 
        role: 'assistant', 
        content: welcomeMessage.textContent,
        timestamp: new Date().toISOString()
      };
      
      conversationHistory.push(welcomeMessageData);
      saveConversationToLocalStorage();
      saveResponseToLocalStorage(welcomeMessageData.content);
    }
  }

  function setupEventListeners() {
    // Message sending
    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Emoji picker
    const picker = document.createElement('emoji-picker');
    picker.classList.add('emoji-picker');
    picker.style.position = 'absolute';
    picker.style.bottom = '60px';
    picker.style.right = '10px';
    picker.style.display = 'none';
    picker.style.zIndex = '1000';
    chatAppContainer.appendChild(picker);

    emojiBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
    });

    picker.addEventListener('emoji-click', event => {
      const emoji = event.detail.unicode;
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(messageInput);
      range.collapse(false);
      const textNode = document.createTextNode(emoji);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      messageInput.focus();
    });

    document.addEventListener('click', function(e) {
      if (!emojiBtn.contains(e.target) && !picker.contains(e.target)) {
        picker.style.display = 'none';
      }
    });

    // Menu and dropdown
    menuBtn.addEventListener('click', function() {
      this.classList.toggle('active');
      dropdownMenu.classList.toggle('active');
      document.addEventListener('click', closeMenuOnClickOutside);
    });

    function closeMenuOnClickOutside(e) {
      if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        menuBtn.classList.remove('active');
        dropdownMenu.classList.remove('active');
        document.removeEventListener('click', closeMenuOnClickOutside);
      }
    }

    // Modal triggers
    resourcesBtn.addEventListener("click", () => toggleModal(resourcesModal));
    signoutBtn.addEventListener("click", signOut);

    // Close modals
    closeModals.forEach(btn => {
      btn.addEventListener("click", function() {
        const modal = this.closest(".modal");
        toggleModal(modal, false);
      });
    });

    // Feedback options
    feedbackOptions.forEach(option => {
      option.addEventListener("click", function() {
        handleFeedbackOption(this);
      });
    });

    // Back button
    backBtn.addEventListener("click", function() {
      window.location.href = "../index.html";
    });
  }

  async function sendMessage() {
    const messageText = messageInput.innerText.trim();
    if (!messageText) return;

    // Create user message
    const userMessage = createMessageElement(messageText, "user");
    chatMessages.appendChild(userMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Clear input
    messageInput.innerHTML = "";
    moveCursorToEnd(messageInput);

    // Add to conversation history
    const messageData = { 
        role: 'user', 
        content: messageText,
        timestamp: new Date().toISOString()
    };
    conversationHistory.push(messageData);
    saveConversationToLocalStorage();

    // Analyze emotion and save to emotion history
    const detectedEmotion = analyzeMessageForEmotion(messageText);
    setCurrentEmotion(detectedEmotion);

    // Save to emotion history
    const emotionHistory = JSON.parse(localStorage.getItem(EMOTION_HISTORY_KEY) || '[]');
    emotionHistory.push({
        content: messageText,
        emotion: detectedEmotion,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(EMOTION_HISTORY_KEY, JSON.stringify(emotionHistory));

    // Save current mood
    localStorage.setItem(CURRENT_MOOD_KEY, detectedEmotion);

    // Show feedback modal for negative emotions
    if (['sadness', 'anger', 'anxious'].includes(detectedEmotion)) {
        detectedEmotionSpan.textContent = detectedEmotion;
        toggleModal(emotionFeedbackModal);
    }

    const typingIndicator = showTypingIndicator();

    try {
        const response = await generateResponse(messageText, detectedEmotion);
        hideTypingIndicator(typingIndicator);
        
        const monahMessage = createMessageElement(response, "monah");
        chatMessages.appendChild(monahMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add response to history
        const responseData = { 
            role: 'assistant', 
            content: response,
            timestamp: new Date().toISOString()
        };
        conversationHistory.push(responseData);
        saveConversationToLocalStorage();
        saveResponseToLocalStorage(response);
        
    } catch (error) {
        console.error('Error generating response:', error);
        hideTypingIndicator(typingIndicator);
        
        // Create error message
        const errorMessageText = "I'm sorry, something went wrong. Please try again.";
        const errorMessage = createMessageElement(errorMessageText, "monah");
        chatMessages.appendChild(errorMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Save error response to history
        const errorResponseData = { 
            role: 'assistant', 
            content: errorMessageText,
            timestamp: new Date().toISOString(),
            isError: true
        };
        conversationHistory.push(errorResponseData);
        saveConversationToLocalStorage();
        saveResponseToLocalStorage(errorMessageText, true);
    }
  }

  function saveConversationToLocalStorage() {
    localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversationHistory));
  }

  function saveResponseToLocalStorage(response, isError = false) {
    const responseHistory = JSON.parse(localStorage.getItem(RESPONSE_HISTORY_KEY) || '[]');
    responseHistory.push({
        response: response,
        timestamp: new Date().toISOString(),
        emotion: currentEmotionState,
        isError: isError
    });
    localStorage.setItem(RESPONSE_HISTORY_KEY, JSON.stringify(responseHistory));
  }

  async function saveAllDataToFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) return false;

    try {
      // Get existing data from Firebase to avoid duplicates
      const existingConvo = await firebase.firestore()
        .collection('conversations')
        .doc(user.uid)
        .get();
      
      const existingMessages = existingConvo.exists ? existingConvo.data().messages || [] : [];
      
      // Filter out messages that already exist in Firebase
      const newMessages = conversationHistory.filter(newMsg => {
        return !existingMessages.some(existingMsg => 
          existingMsg.content === newMsg.content && 
          existingMsg.role === newMsg.role &&
          existingMsg.timestamp === (newMsg.timestamp || '')
        );
      });

      if (newMessages.length > 0) {
        await firebase.firestore()
          .collection('conversations')
          .doc(user.uid)
          .set({ 
            messages: [...existingMessages, ...newMessages] 
          }, { merge: true });
      }

      // Save emotion history
      const localEmotionHistory = JSON.parse(localStorage.getItem(EMOTION_HISTORY_KEY) || '[]');
      if (localEmotionHistory.length > 0) {
        await firebase.firestore()
          .collection('emotion_history')
          .doc(user.uid)
          .set({ 
            emotions: localEmotionHistory 
          }, { merge: true });
      }

      // Save response history
      const localResponseHistory = JSON.parse(localStorage.getItem(RESPONSE_HISTORY_KEY) || '[]');
      if (localResponseHistory.length > 0) {
        await firebase.firestore()
          .collection('response_history')
          .doc(user.uid)
          .set({ 
            responses: localResponseHistory 
          }, { merge: true });
      }

      // Save current mood
      await firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .set({ 
          currentMood: currentEmotionState 
        }, { merge: true });

      return true;
    } catch (error) {
      console.error('Error saving data to Firebase:', error);
      return false;
    }
  }

  async function deleteUserDataFromFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) return false;

    try {
      // Delete all user data collections
      await Promise.all([
        firebase.firestore().collection('conversations').doc(user.uid).delete(),
        firebase.firestore().collection('emotion_history').doc(user.uid).delete(),
        firebase.firestore().collection('response_history').doc(user.uid).delete()
      ]);

      // Reset current mood
      await firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .update({ 
          currentMood: 'neutral' 
        });

      return true;
    } catch (error) {
      console.error('Error deleting data from Firebase:', error);
      return false;
    }
  }

  async function signOut() {
    try {
      // Show confirmation dialog
      const confirmSignOut = confirm('Are you sure you want to sign out?');
      if (!confirmSignOut) return;

      // Ask if user wants to save data to Firebase
      let saveData = false;
      if (conversationHistory.length > 0 || localStorage.getItem(EMOTION_HISTORY_KEY)) {
        saveData = confirm('Would you like to save your data to the cloud before signing out?');
        
        if (saveData) {
          const saveSuccess = await saveAllDataToFirebase();
          if (!saveSuccess) {
            alert('Failed to save data to the cloud. Please try again.');
            return;
          }
          alert('Your data has been successfully saved to the cloud.');
        }
      }

      // Ask if user wants to delete data from Firebase
      const deleteData = confirm('Would you like to delete all your data from the cloud?');
      if (deleteData) {
        const deleteSuccess = await deleteUserDataFromFirebase();
        if (!deleteSuccess) {
          alert('Failed to delete data from the cloud. Please try again.');
          return;
        }
        alert('Your cloud data has been successfully deleted.');
      }

      // Clear local conversation but keep streak data
      const streakData = {
        streak: localStorage.getItem(STREAK_STORAGE_KEY),
        lastVisit: localStorage.getItem(LAST_VISIT_KEY)
      };
      
      localStorage.clear();
      
      // Restore streak data
      if (streakData.streak) {
        localStorage.setItem(STREAK_STORAGE_KEY, streakData.streak);
      }
      if (streakData.lastVisit) {
        localStorage.setItem(LAST_VISIT_KEY, streakData.lastVisit);
      }

      // Sign out from Firebase
      await firebase.auth().signOut();
      window.location.href = "../auth/login.html";
    } catch (error) {
      console.error("Sign out error:", error);
      alert("An error occurred while signing out. Please try again.");
    }
  }

  // Helper functions
  function moveCursorToEnd(element) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
  }

  function analyzeMessageForEmotion(text, context = {}) {
    const analyzer = new SentimentAnalyzer();
    return analyzer.analyze(text, context).dominantEmotion;
  }

  function createMessageElement(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender}-message`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    const textP = document.createElement("p");
    textP.textContent = text;

    const timeDiv = document.createElement("div");
    timeDiv.className = "message-time";
    timeDiv.textContent = getCurrentTime();

    contentDiv.appendChild(textP);
    contentDiv.appendChild(timeDiv);
    messageDiv.appendChild(contentDiv);

    messageDiv.style.animation = "messageIn 0.3s ease-out";

    return messageDiv;
  }

  function showTypingIndicator() {
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "chat-message monah-message typing-indicator";
    typingIndicator.innerHTML = `
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingIndicator;
  }

  function hideTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
      indicator.remove();
    }
  }

  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async function generateResponse(message, emotion) {
    const systemPrompt = `
      You are Monah, created by Christopher Okumu Wasonga from Daystar University as a heartfelt way of giving back to the community—with the hope of bringing comfort, support, and a sense of companionship to anyone who needs it., an empathetic emotional support companion designed to assist users with their mental health. 
      Your responses should be supportive, creative, and lifelike, always prioritizing the user's emotional well-being.
      Tailor your tone to the user's detected emotion (${emotion}) and maintain a warm, understanding demeanor.
      Avoid clinical or overly formal language; instead, use conversational and comforting phrases.
      If the user expresses negative emotions, offer gentle encouragement, validation, or suggest simple coping strategies.
      Keep responses concise (1-2 sentences) unless more detail is needed for empathy or context.
    `;

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-10), // Limit context to last 10 messages
            { role: 'user', content: message }
          ],
          max_tokens: 100,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices[0].message.content.trim();
      
      // Save the response
      saveResponseToLocalStorage(responseText);
      
      return responseText;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  function setCurrentEmotion(emotion) {
    currentEmotionState = emotion;
    updateBackgroundOverlay(emotion);
    updateChatContainerColor(emotion);
    createFloatingEmotion(emotion);
    updateEmotionIndicator(emotion);
    localStorage.setItem(CURRENT_MOOD_KEY, emotion);
  }

  function updateBackgroundOverlay(emotion) {
    const emotions = ['happy', 'sad', 'angry', 'anxious', 'neutral'];
    emotions.forEach(e => chatAppContainer.classList.remove(e));
    chatAppContainer.classList.add(emotion);
  }

  function updateChatContainerColor(emotion) {
    const chatMain = document.querySelector('.chat-main');
    const colorMap = {
      happiness: 'rgba(255, 245, 214, 0.95)',
      sadness: 'rgba(214, 234, 255, 0.95)',
      anger: 'rgba(255, 214, 214, 0.95)',
      anxious: 'rgba(255, 214, 255, 0.95)',
      neutral: 'rgba(255, 255, 255, 0.95)'
    };
    chatMain.style.backgroundColor = colorMap[emotion] || colorMap.neutral;
  }

  function createFloatingEmotion(emotion) {
    emotionFloaties.innerHTML = '';
    const effectsConfig = {
      happy: { count: 8, size: [20, 50], speed: [10, 20], opacity: 0.2 },
      sad: { count: 5, size: [30, 40], speed: [15, 25], opacity: 0.15 },
      angry: { count: 12, size: [15, 30], speed: [5, 15], opacity: 0.25 },
      anxious: { count: 10, size: [10, 25], speed: [20, 30], opacity: 0.3 },
      neutral: { count: 6, size: [25, 40], speed: [12, 18], opacity: 0.1 }
    };

    const config = effectsConfig[emotion] || effectsConfig.neutral;

    for (let i = 0; i < config.count; i++) {
      const floatie = document.createElement("div");
      floatie.className = "floatie";
      floatie.innerHTML = `
        <lottie-player
          src="../assets/animations/${emotion}-face.json"
          background="transparent"
          speed="${0.3 + Math.random() * 0.7}"
          style="width: ${config.size[0] + Math.random() * (config.size[1] - config.size[0])}px; 
                 height: ${config.size[0] + Math.random() * (config.size[1] - config.size[0])}px"
          autoplay
        ></lottie-player>
      `;
      floatie.style.left = `${Math.random() * 100}%`;
      floatie.style.top = `${Math.random() * 100}%`;
      floatie.style.opacity = config.opacity;
      floatie.style.animation = `float ${config.speed[0] + Math.random() * (config.speed[1] - config.speed[0])}s linear infinite`;
      floatie.style.animationDelay = `${Math.random() * 5}s`;
      emotionFloaties.appendChild(floatie);
    }
  }

  function updateEmotionIndicator(emotion) {
    currentEmotionIndicator.innerHTML = `
      <lottie-player
        src="../assets/animations/${emotion}-face.json"
        background="transparent"
        speed="1"
        autoplay
      ></lottie-player>
    `;
  }

  function toggleModal(modal, show = true) {
    if (currentModal) {
      currentModal.classList.remove("active");
    }
    if (show && modal) {
      modal.classList.add("active");
      currentModal = modal;
    } else {
      currentModal = null;
    }
  }

  function handleFeedbackOption(option) {
    const optionType = option.classList.contains("talk") ? "talk" :
                      option.classList.contains("exercise") ? "exercise" : "dismiss";

    let response;
    switch(optionType) {
      case "talk":
        response = "I'm here to listen. Please tell me more about what's on your mind.";
        break;
      case "exercise":
        response = "Let's try a quick exercise. Take a deep breath in for 4 seconds, hold for 4, and exhale for 6. Ready to try?";
        break;
      case "dismiss":
        response = "I understand. Remember I'm here if you change your mind and want to talk.";
        break;
    }

    const monahMessage = createMessageElement(response, "monah");
    chatMessages.appendChild(monahMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    const responseData = { 
      role: 'assistant', 
      content: response,
      timestamp: new Date().toISOString()
    };
    
    conversationHistory.push(responseData);
    saveConversationToLocalStorage();
    saveResponseToLocalStorage(response);

    toggleModal(emotionFeedbackModal, false);
  }
});