// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACpMEvl1rCROR72TPFUJL38E5iqNGI-zI",
    authDomain: "monah-ai.firebaseapp.com",
    projectId: "monah-ai",
    storageBucket: "monah-ai.appspot.com",
    messagingSenderId: "37108718640",
    appId: "1:37108718640:web:2059c9a93e0715d3c7a1f5",
    measurementId: "G-VX80RLE2DQ"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} else {
    console.log("Firebase already initialized");
}

// Initialize Firestore with persistence settings
const db = firebase.firestore();
db.enablePersistence()
  .catch((err) => {
      console.error("Firestore persistence failed: ", err);
  });
console.log("Firestore initialized");

// Cache configuration
const CACHE_EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds
const USER_CACHE_KEY = 'firebase_user_data_cache';

// Function to cache user data with timestamp
function cacheUserData(userData) {
    if (!window.localStorage) return;
    
    const cacheData = {
        data: userData,
        timestamp: new Date().getTime()
    };
    
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
    console.log('User data cached successfully');
}

// Function to get cached user data if not expired
function getCachedUserData() {
    if (!window.localStorage) return null;
    
    const cachedData = localStorage.getItem(USER_CACHE_KEY);
    if (!cachedData) return null;
    
    try {
        const parsedData = JSON.parse(cachedData);
        const now = new Date().getTime();
        
        // Check if cache is expired
        if (now - parsedData.timestamp > CACHE_EXPIRATION_TIME) {
            localStorage.removeItem(USER_CACHE_KEY);
            console.log('Cache expired, removed old data');
            return null;
        }
        
        console.log('Returning cached user data');
        return parsedData.data;
    } catch (e) {
        console.error('Error parsing cached data:', e);
        return null;
    }
}

// Enhanced auth state handler with Firestore check and caching
firebase.auth().onAuthStateChanged(async (user) => {
    const currentPath = window.location.pathname;
    
    if (user) {
        console.log(`User authenticated: ${user.uid}`);
        
        // Check cache first
        const cachedUserData = getCachedUserData();
        if (cachedUserData && cachedUserData.uid === user.uid) {
            console.log('Using cached user data');
            window.userData = cachedUserData;
        } else {
            // Verify Firestore connection by reading user data
            try {
                const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    console.log('Firestore connection verified - user document exists');
                    const userData = {
                        uid: user.uid,
                        ...userDoc.data()
                    };
                    cacheUserData(userData);
                    window.userData = userData;
                } else {
                    console.warn('User document does not exist in Firestore');
                    window.userData = { uid: user.uid };
                }
            } catch (error) {
                console.error('Firestore verification failed:', error);
                // Fallback to basic user data if Firestore fails
                window.userData = { uid: user.uid };
            }
        }

        if (currentPath.includes('auth')) {
            console.log('Redirecting to app...');
            window.location.href = '../app/chat.html';
        }
    } else {
        console.log('No authenticated user');
        // Clear cache on logout
        if (window.localStorage) {
            localStorage.removeItem(USER_CACHE_KEY);
        }
        if (!currentPath.includes('auth')) {
            console.log('Redirecting to login...');
            window.location.href = '../auth/login.html';
        }
    }
});

// Enhanced signup function with Firestore validation and caching
async function firebaseSignUp(email, password, username) {
    try {
        console.log('Starting signup process...');
        
        // 1. Create auth user
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        console.log('Auth user created:', userCredential.user.uid);
        
        // 2. Prepare Firestore data
        const userData = {
            username: username,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        };
        
        // 3. Write to Firestore with timeout
        const db = firebase.firestore();
        const userDocRef = db.collection('users').doc(userCredential.user.uid);
        
        await Promise.race([
            userDocRef.set(userData),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Firestore write timed out')), 5000)
            )
        ]);
        
        console.log('User document successfully written to Firestore');
        
        // 4. Verify the write
        const docSnapshot = await userDocRef.get();
        if (!docSnapshot.exists) {
            throw new Error('Firestore write verification failed - document does not exist');
        }
        
        // Cache the user data
        const completeUserData = {
            uid: userCredential.user.uid,
            ...userData
        };
        cacheUserData(completeUserData);
        
        return { 
            success: true, 
            user: userCredential.user,
            username: username
        };
        
    } catch (error) {
        console.error('Full signup error:', error);
        
        // If auth succeeded but Firestore failed, delete the auth user
        if (error.code !== 'auth/' && firebase.auth().currentUser) {
            console.warn('Cleaning up auth user due to Firestore failure');
            await firebase.auth().currentUser.delete();
        }
        
        let errorMessage = "Signup failed. Please try again.";
        switch(error.code) {
            case 'auth/email-already-in-use':
                errorMessage = "This email is already registered.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Please enter a valid email address.";
                break;
            case 'auth/weak-password':
                errorMessage = "Password must be at least 6 characters.";
                break;
            default:
                if (error.message.includes('timed out')) {
                    errorMessage = "Database operation timed out. Please check your connection.";
                } else {
                    errorMessage = error.message || errorMessage;
                }
        }
        
        return { success: false, error: errorMessage };
    }
}

// Enhanced login function with caching
async function firebaseLogin(email, password) {
    try {
        console.log('Starting login process...');
        
        // 1. Authenticate user
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('User authenticated:', user.uid);
        
        // 2. Get user data from Firestore
        const db = firebase.firestore();
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            console.warn('User document missing in Firestore');
            return { 
                success: false, 
                error: "Your account data is incomplete. Please contact support." 
            };
        }
        
        // 3. Update last login in Firestore
        await db.collection('users').doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Last login timestamp updated');
        
        // 4. Cache the user data
        const userData = {
            uid: user.uid,
            ...userDoc.data()
        };
        cacheUserData(userData);
        
        return { 
            success: true, 
            user: user,
            username: userDoc.data().username 
        };
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage;
        switch(error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = "Invalid email or password";
                break;
            case 'auth/invalid-email':
                errorMessage = "Please enter a valid email address";
                break;
            case 'auth/too-many-requests':
                errorMessage = "Account temporarily locked. Try again later or reset your password";
                break;
            default:
                errorMessage = "Login failed. Please try again";
        }
        
        return { success: false, error: errorMessage };
    }
}

// Password reset function
async function firebaseSendPasswordReset(email) {
    try {
        console.log('Starting password reset for:', email);
        
        // 1. Check if email exists in Firestore
        const db = firebase.firestore();
        const querySnapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();
        
        if (querySnapshot.empty) {
            console.log('No user found with email:', email);
            return { 
                success: false, 
                error: "No account found with this email" 
            };
        }
        
        // 2. Send reset email
        await firebase.auth().sendPasswordResetEmail(email);
        console.log('Password reset email sent to:', email);
        
        return { 
            success: true, 
            message: `If an account exists for ${email}, you'll receive a password reset link`
        };
        
    } catch (error) {
        console.error('Password reset error:', error);
        
        let errorMessage;
        switch(error.code) {
            case 'auth/invalid-email':
                errorMessage = "Please enter a valid email address";
                break;
            case 'auth/user-not-found':
                errorMessage = "No account found with this email";
                break;
            default:
                errorMessage = "Failed to send reset email. Please try again";
        }
        
        return { success: false, error: errorMessage };
    }
}

// Sign out function with cache clearing
async function firebaseSignOut() {
    try {
        console.log('Starting sign out process...');
        await firebase.auth().signOut();
        console.log('Sign out successful');
        
        // Clear any local data and cache
        if (window.localStorage) {
            localStorage.clear();
        }
        
        // Redirect to login page
        window.location.href = '../auth/login.html';
        
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { 
            success: false, 
            error: "An error occurred while signing out. Please try again."
        };
    }
}

// Function to get current user data (checks cache first)
async function getCurrentUserData() {
    const user = firebase.auth().currentUser;
    if (!user) return null;
    
    // Check cache first
    const cachedData = getCachedUserData();
    if (cachedData && cachedData.uid === user.uid) {
        return cachedData;
    }
    
    // Fallback to Firestore
    try {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = {
                uid: user.uid,
                ...userDoc.data()
            };
            cacheUserData(userData);
            return userData;
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

