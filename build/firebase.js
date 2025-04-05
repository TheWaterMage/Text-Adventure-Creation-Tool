// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
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

// Export auth and db to make them available in other modules
export { auth, db };

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

// Function to log out a user
export async function logout(auth) {
    try {
        await auth.signOut();
        console.log('User logged out');
        alert('You have logged out successfully!');
        window.location.href = 'index.html'; // Redirect to login page after logout
    } catch (error) {
        console.error('Error logging out:', error);
        alert(`Logout failed: ${error.message}`); // Alert for logout failure
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if elements exist before adding listeners
    const signupForm = document.querySelector('#signupForm form');
    const loginForm = document.querySelector('#loginForm form');

    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = signupForm.querySelector('#email').value;
            const username = signupForm.querySelector('#username').value;
            const password = signupForm.querySelector('#password').value;
            signup(email, password, username);
        });
    }

    if (loginForm) {
        // Remove this handler if using login.html's version
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = loginForm.querySelector('#loginEmail').value;
            const password = loginForm.querySelector('#loginPassword').value;
            login(email, password);
        });
    }
});