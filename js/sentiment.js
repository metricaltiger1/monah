// Enhanced VADER Sentiment Analysis Implementation focused on 4 core emotions
class SentimentAnalyzer {
    constructor() {
        // Lexicon with sentiment scores (-4 to +4)
        this.lexicon = {
            // Positive words
            'good': 1.9, 'great': 3.1, 'excellent': 3.3, 'perfect': 3.5,
            'happy': 2.7, 'joy': 3.0, 'joyful': 3.1, 'delight': 2.8,
            'love': 3.0, 'loved': 3.0, 'loves': 3.0, 'lovely': 2.7,
            'like': 1.7, 'liked': 1.7, 'likes': 1.7,
            'wonderful': 3.0, 'amazing': 3.3, 'fantastic': 3.4,
            'super': 2.5, 'superb': 3.2, 'terrific': 3.2,
            'awesome': 3.0, 'fabulous': 3.1, 'marvelous': 3.1,
            
            // Negative words
            'bad': -1.9, 'terrible': -3.1, 'awful': -3.3, 'horrible': -3.4,
            'sad': -2.2, 'sadness': -2.3, 'unhappy': -2.4, 'depressed': -2.7,
            'hate': -3.0, 'hated': -3.0, 'hates': -3.0, 'hatred': -3.2,
            'dislike': -1.7, 'disliked': -1.7, 'dislikes': -1.7,
            'angry': -2.5, 'anger': -2.6, 'furious': -3.2, 'rage': -3.3,
            'anxious': -2.3, 'anxiety': -2.4, 'nervous': -2.1, 'worried': -2.0,
            'pain': -2.5, 'hurt': -2.4, 'suffering': -3.0,
            
            // Modifiers
            'very': 0.5, 'extremely': 0.8, 'really': 0.3, 'so': 0.3,
            'too': 0.3, 'somewhat': 0.2, 'slightly': 0.1,
            'not': -0.5, 'never': -0.7, 'no': -0.4,
            
            // Punctuation
            '!': 0.5, '!!': 0.8, '!!!': 1.0,
            '?': -0.1, '??': -0.3, '???': -0.5,
            '.': 0, '..': 0, '...': -0.3
        };
        
        // Emotion configuration - only 4 core emotions
        this.emotionConfig = {
            happiness: {
                keywords: [
                    'happy', 'joy', 'excited', 'great', 'awesome', 'love', 'good', 
                    'amazing', 'wonderful', 'fantastic', 'blessed', 'content',
                    'cheerful', 'grateful', 'elated', 'optimistic', 'jovial'
                ],
                emojis: ['😊', '😄', '😃', '😁', '😆', '😂', '😍', '🥰', '😎', '😋'],
                sentimentThreshold: 0.3,
                weight: 1
            },
            sadness: {
                keywords: [
                    'sad', 'depressed', 'unhappy', 'miserable', 'heartbroken', 'lonely',
                    'cry', 'crying', 'tears', 'upset', 'grief', 'despair', 'hopeless'
                ],
                emojis: ['😢', '😭', '😔', '😞', '😟', '😕', '🙁', '☹️', '🥺'],
                sentimentThreshold: -0.2,
                weight: 1
            },
            anger: {
                keywords: [
                    'angry', 'mad', 'furious', 'annoyed', 'pissed', 'rage', 'hate',
                    'angrier', 'frustrated', 'irritated', 'enraged', 'infuriated'
                ],
                emojis: ['😠', '😡', '🤬', '👿', '😤', '💢', '😾'],
                sentimentThreshold: -0.5,
                weight: 1.2
            },
            anxiety: {
                keywords: [
                    'anxious', 'nervous', 'scared', 'worried', 'fear', 'panic',
                    'stressed', 'afraid', 'tense', 'overwhelmed', 'uneasy'
                ],
                emojis: ['😨', '😰', '😥', '😓', '😖', '😣', '😩', '😫', '😱'],
                sentimentThreshold: -0.3,
                weight: 1
            }
        };

        this.negations = ['not', 'never', 'no', 'none', 'nobody', 'nothing'];
        this.boosters = {
            'very': 0.5, 'extremely': 0.8, 'really': 0.3, 'so': 0.3,
            'too': 0.3, 'totally': 0.4, 'absolutely': 0.6
        };
    }

    analyze(text, context = {}) {
        // Preprocess and tokenize
        const words = this.preprocessText(text);
        const emojis = this.extractEmojis(text);
        
        // Sentiment analysis
        const sentimentResult = this.analyzeSentiment(words);
        
        // Emotion analysis - only detects 4 emotions, everything else is neutral
        const emotionResult = this.analyzeEmotion(words, emojis, sentimentResult.score, context);
        
        return {
            ...sentimentResult,
            ...emotionResult,
            words,
            emojis
        };
    }

    preprocessText(text) {
        return text.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=_`~()]/g, '')
            .split(/\s+/);
    }

    extractEmojis(text) {
        return [...text].filter(char => {
            const code = char.codePointAt(0);
            return code > 255; // Simple emoji detection
        });
    }

    analyzeSentiment(words) {
        let score = 0;
        let positive = 0;
        let negative = 0;
        let negation = false;
        let booster = 1;

        words.forEach(word => {
            // Handle negations
            if (this.negations.includes(word)) {
                negation = true;
                return;
            }

            // Handle boosters
            if (this.boosters[word]) {
                booster += this.boosters[word];
                return;
            }

            // Score words
            if (this.lexicon[word]) {
                let wordScore = this.lexicon[word];
                
                if (negation) {
                    wordScore = -wordScore * 0.5;
                    negation = false;
                }

                wordScore *= booster;
                booster = 1;

                score += wordScore;
                if (wordScore > 0) positive += wordScore;
                if (wordScore < 0) negative += Math.abs(wordScore);
            }
        });

        // Normalize score
        const normalized = this.normalizeScore(score, words.length);
        
        return {
            score: normalized,
            comparative: score / words.length,
            positive,
            negative
        };
    }

    analyzeEmotion(words, emojis, sentimentScore, context) {
        const emotionScores = {
            happiness: 0,
            sadness: 0,
            anger: 0,
            anxiety: 0
        };

        // Score keywords for the 4 emotions
        words.forEach(word => {
            for (const [emotion, config] of Object.entries(this.emotionConfig)) {
                if (config.keywords.includes(word)) {
                    emotionScores[emotion] += config.weight;
                }
            }
        });

        // Score emojis (higher weight)
        emojis.forEach(emoji => {
            for (const [emotion, config] of Object.entries(this.emotionConfig)) {
                if (config.emojis.includes(emoji)) {
                    emotionScores[emotion] += config.weight * 1.5;
                }
            }
        });

        // Apply sentiment adjustments
        for (const [emotion, config] of Object.entries(this.emotionConfig)) {
            if ((emotion === 'happiness' && sentimentScore > config.sentimentThreshold) ||
                (emotion !== 'happiness' && sentimentScore < config.sentimentThreshold)) {
                emotionScores[emotion] += config.weight * 0.5;
            }
        }

        // Determine dominant emotion - default to neutral if no strong emotion
        let dominantEmotion = 'neutral';
        let highestScore = 0;
        
        // Only consider emotions that meet a minimum threshold
        const emotionThreshold = 1.0;
        
        for (const [emotion, score] of Object.entries(emotionScores)) {
            if (score > highestScore && score >= emotionThreshold) {
                highestScore = score;
                dominantEmotion = emotion;
            }
        }

        // Special cases for very strong emotions
        if (emotionScores.anger > 3 && sentimentScore < -0.7) {
            dominantEmotion = 'anger';
        }
        if (emotionScores.happiness > 3 && sentimentScore > 0.7) {
            dominantEmotion = 'happiness';
        }

        return {
            emotionScores,
            dominantEmotion
        };
    }

    normalizeScore(score, wordCount) {
        if (wordCount === 0) return 0;
        const normalized = score / Math.sqrt(score * score + 15);
        return Math.max(-1, Math.min(1, normalized));
    }
}

// Export for Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SentimentAnalyzer;
} else {
    window.SentimentAnalyzer = SentimentAnalyzer;
}