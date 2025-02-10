import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, auth } from './firebase.js';

async function loadGames(){
    const user = auth.currentUser; // This might be null initially

    // Listen for auth state changes
    return new Promise((resolve) => {  // Return a promise for better handling
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                console.log("User logged in:", user.uid);
                // Now fetch the games since the user is confirmed logged in
                fetchAndDisplayGames(user.uid).then(() => resolve()); 
            } else {
                console.error("User not logged in");
                // Handle the case where the user is not logged in
                // Maybe redirect to login page or display a message
                resolve(); // Resolve even if user is not logged in
            }
            unsubscribe(); // Stop listening once state is determined
        });
    });

    

}

async function fetchAndDisplayGames(userId) {
    try {
        const gamesRef = collection(db, "Users", userId, "Games");
        const querySnapshot = await getDocs(gamesRef);
        const gameContainer = document.getElementById('gameContainer');

        querySnapshot.forEach((doc) => {
            const gameData = doc.data();
            const gameId = doc.id;  // Use the document ID as gameId

            const gameSlot = document.createElement('div');
            gameSlot.classList.add('Game', 'readable');
            gameSlot.innerHTML = `
                <div class="game-name">
                    <h3 id="gameName${gameId}" onclick="editGameName('${gameId}')">${gameData.gameName}</h3> </div>
                <div class="game-buttons">
                    <button class="readable">Export</button>
                    <button class="readable"><a href="editor.html">Edit</a></button>
                    <button class="readable">Play</button>
                </div>
            `;
            gameContainer.appendChild(gameSlot);
        });
    } catch (error) {
        console.error("Error loading games:", error);
    }
}

export async function createGame() {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not logged in");
        // Redirect to login or show a message
        return;
    }


    try {
        const gamesRef = collection(db, "Users", user.uid, "Games");
        const newGame = {
            gameName: "New Game",
            // Add other game data as needed
        };
        const docRef = await addDoc(gamesRef, newGame);
        console.log("New game created with ID:", docRef.id);

        // After successfully adding to Firebase, add it to the UI:
        displayNewGame(docRef.id, "New Game");  // Pass the new game's data


    } catch (error) {
        console.error("Error creating game:", error);
    }
}

function displayNewGame(gameId, gameName) {
    const gameContainer = document.getElementById('gameContainer');
    const gameSlot = document.createElement('div');
    gameSlot.classList.add('Game', 'readable');
    gameSlot.innerHTML = `
        <div class="game-name">
            <h3 id="gameName${gameId}" class="editable-game-name">${gameName}</h3>  
            </div> <div class="game-buttons"> <button class="readable">Export</button> 
            <button class="readable"><a href="editor.html">Edit</a></button> 
            <button class="readable">Play</button> </div>
    `;
    gameContainer.appendChild(gameSlot);
}

export function editGameName(gameId) {
    console.log("Editing game:", gameId);

    const gameNameElement = document.getElementById(`gameName${gameId}`);
    const currentName = gameNameElement.textContent.trim();
    gameNameElement.outerHTML = `
        <input type="text" id="gameName${gameId}" value="${currentName}" onblur="saveGameName(${gameId})"/>
    `;
    document.getElementById(`gameName${gameId}`).focus();
}

function saveGameName(gameId) {
    const inputField = document.getElementById(`gameName${gameId}`);
    const updatedName = inputField.value.trim() || `Game ${gameId}`;
    inputField.outerHTML = `<h3 id="gameName${gameId}" onclick="editGameName(${gameId})">${updatedName}</h3>`;
}

loadGames().then(() => {
    console.log("Games loaded or user not logged in - DOMContentLoaded");
});

export default loadGames;


