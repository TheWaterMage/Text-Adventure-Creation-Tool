// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyC51n2a0JGTYZLI1HCWDuliqRVs4AT7Y0s",
authDomain: "text-adventure-creation-tool.firebaseapp.com",
projectId: "text-adventure-creation-tool",
storageBucket: "text-adventure-creation-tool.appspot.com",
messagingSenderId: "338131192543",
appId: "1:338131192543:web:71271a27ecba2c997d776a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to sign up a user
async function signup(email, password, username) {
    try {
        alert('Signing you up...'); // Alert for signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Optionally, save additional user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email
        });

        console.log('User signed up:', user);
        alert('Signup successful!'); // Alert for successful signup
        window.location.href = 'index.html'; // Redirect to index.html
    } catch (error) {
        console.error('Error signing up:', error);
        alert(`Signup failed: ${error.message}`); // Alert for signup failure
    }
}

// Function to log in a user
async function login(username, password) {
    try {
        alert('Logging you in...'); // Alert for login
        const userCredential = await signInWithEmailAndPassword(auth, username, password);
        const user = userCredential.user;
        console.log('User logged in:', user);
        alert('Login successful!'); // Alert for successful login
        window.location.href = 'index.html'; // Redirect to index.html
    } catch (error) {
        console.error('Error logging in:', error);
        alert(`Login failed: ${error.message}`); // Alert for login failure
    }
}

// Attach event listeners to the signup and login forms
document.addEventListener('DOMContentLoaded', () => {
    // Signup form submission
    const signupForm = document.querySelector('#signupForm form');
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = signupForm.email.value;
        const username = signupForm.username.value;
        const password = signupForm.password.value;
        signup(email, password, username);
    });

    // Login form submission
    const loginForm = document.querySelector('#loginForm form');
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;
        login(username, password);
    });
});