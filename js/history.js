document.addEventListener("DOMContentLoaded", function() {
    // DOM Elements
    const filterBtn = document.getElementById("filter-btn");
    const filterModal = document.getElementById("filter-modal");
    const closeModal = document.querySelector(".close-modal");
    const applyFiltersBtn = document.querySelector(".apply-filters-btn");
    const timeBtns = document.querySelectorAll(".time-btn");
    const currentMoodEl = document.getElementById("current-mood");
    const streakCountEl = document.getElementById("streak-count");
    const wordCloudEl = document.getElementById("word-cloud");
    const dailyInsightsEl = document.getElementById("daily-insights");
    
    // Current state
    let currentPeriod = "week";
    let selectedEmotions = ["happy", "sad", "angry", "anxious", "neutral"];
    let conversationHistory = [];
    let emotionHistory = [];
    
    // Initialize
    init();
    
    async function init() {
        // Load user data
        await loadUserData();
        
        // Load conversation history
        await loadConversationHistory();
        
        // Process emotion history
        processEmotionHistory();
        
        // Set up event listeners
        setupEventListeners();
        
        // Render initial data
        renderData();
    }
    
    async function loadUserData() {
        // Load streak count
        const streak = localStorage.getItem("streak") || 1;
        streakCountEl.textContent = `${streak} ${streak === 1 ? "day" : "days"}`;
        
        // Load current mood from localStorage or analyze last message
        const mood = localStorage.getItem("currentMood") || 
                     (conversationHistory.length > 0 ? 
                      analyzeMessageForEmotion(conversationHistory[conversationHistory.length - 1].content) : 
                      "neutral");
        currentMoodEl.textContent = capitalizeFirstLetter(mood);
    }
    
    async function loadConversationHistory() {
        // Try to load from localStorage first
        const localConvo = localStorage.getItem("chat_conversation");
        if (localConvo) {
            conversationHistory = JSON.parse(localConvo);
            return;
        }
        
        // If no local storage, try Firebase
        const user = firebase.auth().currentUser;
        if (user) {
            try {
                const convoDoc = await firebase.firestore()
                    .collection('conversations')
                    .doc(user.uid)
                    .get();
                
                if (convoDoc.exists) {
                    conversationHistory = convoDoc.data().messages || [];
                    localStorage.setItem("chat_conversation", JSON.stringify(conversationHistory));
                }
            } catch (error) {
                console.error('Error loading conversation from Firebase:', error);
            }
        }
    }
    
    function processEmotionHistory() {
        // Extract emotions from conversation history with timestamps
        emotionHistory = conversationHistory
            .filter(msg => msg.role === 'user')
            .map(msg => ({
                content: msg.content,
                emotion: analyzeMessageForEmotion(msg.content),
                timestamp: msg.timestamp || new Date().toISOString() // Fallback to current time if no timestamp
            }));
        
        // Store emotion history in localStorage for quick access
        localStorage.setItem("emotion_history", JSON.stringify(emotionHistory));
    }
    
    function analyzeMessageForEmotion(text) {
        // Simplified emotion analysis - in a real app you'd use a proper sentiment analysis library
        const lowerText = text.toLowerCase();
        if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('good')) return 'happy';
        if (lowerText.includes('sad') || lowerText.includes('upset') || lowerText.includes('depress')) return 'sad';
        if (lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('frustrat')) return 'angry';
        if (lowerText.includes('anxious') || lowerText.includes('worr') || lowerText.includes('stress')) return 'anxious';
        return 'neutral';
    }
    
    function setupEventListeners() {
        // Filter modal
        filterBtn.addEventListener("click", () => toggleModal(true));
        closeModal.addEventListener("click", () => toggleModal(false));
        applyFiltersBtn.addEventListener("click", applyFilters);
        
        // Time period buttons
        timeBtns.forEach(btn => {
            btn.addEventListener("click", function() {
                timeBtns.forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                currentPeriod = this.dataset.period;
                renderData();
            });
        });
    }
    
    function toggleModal(show) {
        filterModal.style.display = show ? "flex" : "none";
    }
    
    function applyFilters() {
        // Get selected time period
        const timePeriod = document.querySelector('input[name="time-period"]:checked').value;
        currentPeriod = timePeriod;
        
        // Get selected emotions
        selectedEmotions = Array.from(document.querySelectorAll('input[name="emotion"]:checked'))
            .map(el => el.value);
        
        // Update active time button
        timeBtns.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.period === currentPeriod);
        });
        
        // Re-render data
        renderData();
        
        // Close modal
        toggleModal(false);
    }
    
    function renderData() {
        // Filter data based on selected period
        const filteredData = filterDataByPeriod(emotionHistory, currentPeriod);
        
        // Render charts
        renderMoodTrendChart(filteredData);
        renderEmotionDistributionChart(filteredData);
        
        // Render word cloud
        renderWordCloud(filteredData);
        
        // Render daily insights
        renderDailyInsights(filteredData);
    }
    
    function filterDataByPeriod(data, period) {
        const now = new Date();
        let cutoffDate = new Date();
        
        switch(period) {
            case "week":
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case "month":
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
            case "year":
                cutoffDate.setFullYear(now.getFullYear() - 1);
                break;
            case "all":
            default:
                return data; // Return all data
        }
        
        return data.filter(item => {
            const itemDate = new Date(item.timestamp);
            return itemDate >= cutoffDate;
        });
    }
    
    function renderMoodTrendChart(data) {
        // Group data by day and calculate average emotion scores
        const groupedData = groupDataByDay(data);
        
        // Prepare chart data
        const categories = Object.keys(groupedData);
        const series = [
            {
                name: "Happiness",
                data: categories.map(date => groupedData[date].happy || 0)
            },
            {
                name: "Sadness",
                data: categories.map(date => groupedData[date].sad || 0)
            },
            {
                name: "Anger",
                data: categories.map(date => groupedData[date].angry || 0)
            },
            {
                name: "Anxiety",
                data: categories.map(date => groupedData[date].anxious || 0)
            }
        ];
        
        const options = {
            series: series,
            chart: {
                type: 'area',
                height: '350px',
                toolbar: { show: false },
                zoom: { enabled: false }
            },
            colors: ['#4CAF50', '#2196F3', '#F44336', '#FF9800'],
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2 },
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
            xaxis: {
                categories: categories,
                labels: { style: { colors: '#777', fontSize: '12px' } }
            },
            yaxis: {
                labels: { style: { colors: '#777', fontSize: '12px' } }
            },
            tooltip: { enabled: true, style: { fontSize: '12px' } },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '14px',
                markers: { width: 12, height: 12, radius: 12 }
            }
        };
        
        // Destroy previous chart if it exists
        const chartEl = document.getElementById("mood-trend-chart");
        chartEl.innerHTML = '';
        
        // Create new chart
        const chart = new ApexCharts(chartEl, options);
        chart.render();
    }
    
    function groupDataByDay(data) {
        const grouped = {};
        
        data.forEach(item => {
            const date = new Date(item.timestamp);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            
            if (!grouped[dateStr]) {
                grouped[dateStr] = { happy: 0, sad: 0, angry: 0, anxious: 0, neutral: 0, count: 0 };
            }
            
            // Score each emotion (simplified - in real app you'd use sentiment scores)
            if (item.emotion === 'happy') grouped[dateStr].happy += 1;
            else if (item.emotion === 'sad') grouped[dateStr].sad += 1;
            else if (item.emotion === 'angry') grouped[dateStr].angry += 1;
            else if (item.emotion === 'anxious') grouped[dateStr].anxious += 1;
            else grouped[dateStr].neutral += 1;
            
            grouped[dateStr].count += 1;
        });
        
        // Convert counts to percentages
        Object.keys(grouped).forEach(date => {
            const total = grouped[date].count;
            grouped[date].happy = Math.round((grouped[date].happy / total) * 100);
            grouped[date].sad = Math.round((grouped[date].sad / total) * 100);
            grouped[date].angry = Math.round((grouped[date].angry / total) * 100);
            grouped[date].anxious = Math.round((grouped[date].anxious / total) * 100);
            grouped[date].neutral = Math.round((grouped[date].neutral / total) * 100);
        });
        
        return grouped;
    }
    
    function renderEmotionDistributionChart(data) {
        // Count each emotion
        const emotionCounts = {
            Happy: data.filter(item => item.emotion === 'happy').length,
            Sad: data.filter(item => item.emotion === 'sad').length,
            Angry: data.filter(item => item.emotion === 'angry').length,
            Anxious: data.filter(item => item.emotion === 'anxious').length,
            Neutral: data.filter(item => item.emotion === 'neutral').length
        };
        
        const emotions = Object.keys(emotionCounts);
        const counts = Object.values(emotionCounts);
        const colors = ['#4CAF50', '#2196F3', '#F44336', '#FF9800', '#9E9E9E'];
        
        const ctx = document.getElementById('emotion-distribution-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (window.emotionChart) {
            window.emotionChart.destroy();
        }
        
        window.emotionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: emotions,
                datasets: [{
                    data: counts,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 12 }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }
    
    function renderWordCloud(data) {
        // Extract words and count frequencies (simplified example)
        const words = {};
        data.forEach(item => {
            const text = item.content.toLowerCase();
            text.split(/\s+/).forEach(word => {
                // Remove punctuation and short words
                const cleanWord = word.replace(/[^a-z']/g, '');
                if (cleanWord.length > 3) {
                    words[cleanWord] = (words[cleanWord] || 0) + 1;
                }
            });
        });
        
        // Convert to array and sort by frequency
        const wordArray = Object.keys(words).map(word => ({
            text: word,
            size: words[word],
            color: getColorForWord(word)
        })).sort((a, b) => b.size - a.size).slice(0, 20); // Top 20 words
        
        // Clear existing words
        wordCloudEl.innerHTML = '';
        
        // Add new words
        wordArray.forEach(word => {
            const wordEl = document.createElement('div');
            wordEl.className = 'word-cloud-item';
            wordEl.textContent = word.text;
            wordEl.style.fontSize = `${10 + (word.size * 2)}px`;
            wordEl.style.color = word.color;
            wordEl.style.opacity = `${0.7 + (word.size / wordArray[0].size)}`;
            wordCloudEl.appendChild(wordEl);
        });
    }
    
    function getColorForWord(word) {
        // Simple mapping of words to colors based on emotion
        if (word.match(/(happy|joy|good|great)/)) return '#4CAF50';
        if (word.match(/(sad|depress|hurt|lonely)/)) return '#2196F3';
        if (word.match(/(angry|mad|frustrat|annoy)/)) return '#F44336';
        if (word.match(/(anxious|worr|stress|nervous)/)) return '#FF9800';
        return '#9E9E9E';
    }
    
    function renderDailyInsights(data) {
        // Group data by day
        const dailyData = {};
        data.forEach(item => {
            const date = new Date(item.timestamp);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
            
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = {
                    date: date,
                    messages: [],
                    emotions: []
                };
            }
            
            dailyData[dateKey].messages.push(item.content);
            dailyData[dateKey].emotions.push(item.emotion);
        });
    
        // Generate insights for each day
        const insights = Object.keys(dailyData).map(dateKey => {
            const dayData = dailyData[dateKey];
            const emotionCounts = countEmotions(dayData.emotions);
            const dominantEmotion = getDominantEmotion(emotionCounts);
            
            return {
                date: formatDate(dayData.date),
                text: generateInsightText(dayData.messages, emotionCounts, dominantEmotion),
                dominantEmotion: dominantEmotion
            };
        }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (newest first)
    
        // Clear existing insights
        dailyInsightsEl.innerHTML = '';
    
        // Add new insights (limit to 5 most recent)
        insights.slice(0, 5).forEach(insight => {
            const insightEl = document.createElement('div');
            insightEl.className = 'insight-card';
            insightEl.innerHTML = `
                <div class="insight-date">${insight.date}</div>
                <p class="insight-text">${insight.text}</p>
            `;
            dailyInsightsEl.appendChild(insightEl);
        });
    }
    
    // Helper functions for generating insights
    function countEmotions(emotions) {
        return {
            happy: emotions.filter(e => e === 'happy').length,
            sad: emotions.filter(e => e === 'sad').length,
            angry: emotions.filter(e => e === 'angry').length,
            anxious: emotions.filter(e => e === 'anxious').length,
            neutral: emotions.filter(e => e === 'neutral').length
        };
    }
    
    function getDominantEmotion(emotionCounts) {
        let dominant = 'neutral';
        let maxCount = 0;
        
        for (const [emotion, count] of Object.entries(emotionCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominant = emotion;
            }
        }
        
        return dominant;
    }
    
    function formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    function generateInsightText(messages, emotionCounts, dominantEmotion) {
        const totalMessages = messages.length;
        const dominantCount = emotionCounts[dominantEmotion];
        const dominantPercentage = Math.round((dominantCount / totalMessages) * 100);
        
        // Extract keywords from messages
        const keywords = extractKeywords(messages);
        
        // Generate insight based on dominant emotion and keywords
        switch(dominantEmotion) {
            case 'happy':
                return generateHappyInsight(dominantPercentage, keywords);
            case 'sad':
                return generateSadInsight(dominantPercentage, keywords);
            case 'angry':
                return generateAngryInsight(dominantPercentage, keywords);
            case 'anxious':
                return generateAnxiousInsight(dominantPercentage, keywords);
            default:
                return generateNeutralInsight(dominantPercentage, keywords);
        }
    }
    
    function extractKeywords(messages) {
        const wordCounts = {};
        const stopWords = new Set(['the', 'and', 'you', 'your', 'that', 'this', 'with', 'for', 'was', 'were']);
        
        messages.forEach(message => {
            const words = message.toLowerCase().split(/\s+/);
            words.forEach(word => {
                const cleanWord = word.replace(/[^a-z']/g, '');
                if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
                    wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
                }
            });
        });
        
        // Get top 3 keywords
        return Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([word]) => word);
    }
    
    // Emotion-specific insight generators
    function generateHappyInsight(percentage, keywords) {
        const phrases = [
            `You were feeling happy ${percentage}% of the time`,
            `Your positive mood was reflected in your messages`,
            `You seemed particularly cheerful when talking about ${keywords.join(', ')}`,
            `Your happiness shone through in your conversations`,
            `It was a good day with positive vibes`
        ];
        return phrases[Math.floor(Math.random() * phrases.length)];
    }
    
    function generateSadInsight(percentage, keywords) {
        const phrases = [
            `You expressed sadness ${percentage}% of the time`,
            `Your messages indicated you were feeling down`,
            `Topics like ${keywords.join(', ')} seemed to affect your mood`,
            `You might have been going through a tough time`,
            `It was a challenging day emotionally`
        ];
        return phrases[Math.floor(Math.random() * phrases.length)];
    }
    
    function generateAngryInsight(percentage, keywords) {
        const phrases = [
            `You showed frustration ${percentage}% of the time`,
            `Your messages contained signs of anger`,
            `Issues related to ${keywords.join(', ')} seemed to bother you`,
            `You expressed irritation in your conversations`,
            `It was a tense day with some angry moments`
        ];
        return phrases[Math.floor(Math.random() * phrases.length)];
    }
    
    function generateAnxiousInsight(percentage, keywords) {
        const phrases = [
            `You showed anxiety ${percentage}% of the time`,
            `Your messages indicated you were feeling worried`,
            `Concerns about ${keywords.join(', ')} came up frequently`,
            `You seemed stressed in your conversations`,
            `It was an uneasy day with anxious thoughts`
        ];
        return phrases[Math.floor(Math.random() * phrases.length)];
    }
    
    function generateNeutralInsight(percentage, keywords) {
        const phrases = [
            `Your emotions were mostly neutral (${percentage}%)`,
            `You seemed balanced in your conversations`,
            `Topics like ${keywords.join(', ')} were on your mind`,
            `It was a calm day without strong emotional swings`,
            `Your mood was steady throughout the day`
        ];
        return phrases[Math.floor(Math.random() * phrases.length)];
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});