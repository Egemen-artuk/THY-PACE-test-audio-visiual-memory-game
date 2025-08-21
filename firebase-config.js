// Firebase Configuration
// This file contains the Firebase configuration for the Audio Visual Memory Game
// The configuration uses environment variables that should be set in your deployment environment

// Firebase configuration object
const firebaseConfig = {
    // These values should be replaced with your actual Firebase project configuration
    // For GitHub Pages deployment, you can use repository secrets or environment variables
  apiKey: "AIzaSyCujzNZ7dG5DK9_BVQWiswzyP985kwYrvg",
  authDomain: "thy-audio-visual-game.firebaseapp.com",
  projectId: "thy-audio-visual-game",
  storageBucket: "thy-audio-visual-game.firebasestorage.app",
  messagingSenderId: "61731339069",
  appId: "1:61731339069:web:5050927371472f74c42354",
  measurementId: "G-GY0RC1V33W"
};

// Initialize Firebase
let app, db, analytics;

async function initializeFirebase() {
    try {
        // Import Firebase modules dynamically
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, connectFirestoreEmulator } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const { getAnalytics } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js');
        
        // Initialize Firebase
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        
        // Initialize Analytics (optional, only if in production)
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            try {
                analytics = getAnalytics(app);
            } catch (analyticsError) {
                console.log('Analytics not available:', analyticsError);
            }
        }
        
        console.log('Firebase initialized successfully');
        return { app, db, analytics };
    } catch (error) {
        console.error('Firebase initialization error:', error);
        throw error;
    }
}

// Export the initialization function and config
window.initializeFirebase = initializeFirebase;
window.firebaseConfig = firebaseConfig;
