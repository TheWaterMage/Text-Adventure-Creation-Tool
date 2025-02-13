import { collection, getDocs, addDoc, getDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, auth } from './firebase.js';

async function loadGames(){
    const user = auth.currentUser;

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
                resolve();
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
            const gameId = doc.id;

            const gameSlot = document.createElement('div');
            gameSlot.classList.add('Game', 'readable');

            const gameNameElement = document.createElement('h3');
            gameNameElement.id = `gameName${gameId}`;
            gameNameElement.textContent = gameData.gameName;
            gameNameElement.classList.add('editable-game-name');
            gameNameElement.addEventListener('click', () => editGameName(gameId));

            const gameButtons = document.createElement('div');
            gameButtons.classList.add('game-buttons');
            gameButtons.innerHTML = `
                <button class="readable">Export</button>
                <button class="readable"><a href="editor.html">Edit</a></button>
                <button class="readable">Play</button>
            `;

            const gameNameContainer = document.createElement('div');
            gameNameContainer.classList.add('game-name');
            gameNameContainer.appendChild(gameNameElement);

            gameSlot.appendChild(gameNameContainer);
            gameSlot.appendChild(gameButtons);
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
            // will eventually be able to add default game data
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

    const gameNameElement = document.createElement('h3');
    gameNameElement.id = `gameName${gameId}`;
    gameNameElement.textContent = gameName;
    gameNameElement.classList.add('editable-game-name');
    gameNameElement.addEventListener('click', () => editGameName(gameId));

    const gameButtons = document.createElement('div');
    gameButtons.classList.add('game-buttons');
    gameButtons.innerHTML = `
        <button class="readable">Export</button>
        <button class="readable"><a href="editor.html">Edit</a></button>
        <button class="readable">Play</button>
    `;

    const gameNameContainer = document.createElement('div');
    gameNameContainer.classList.add('game-name');
    gameNameContainer.appendChild(gameNameElement);

    gameSlot.appendChild(gameNameContainer);
    gameSlot.appendChild(gameButtons);
    gameContainer.appendChild(gameSlot);
}

export async function updateGameName(gameId, newGameName) {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not logged in");
        return;
    }

    try {
        // Reference to the game document
        const gameRef = doc(db, "Users", user.uid, "Games", gameId);

        const gameDoc = await getDoc(gameRef);
        if (!gameDoc.exists()) {
            console.error("Game not found");
            return;
        }

        // Update the game name
        await updateDoc(gameRef, {
            gameName: newGameName
        });

        console.log(`Game name updated to: ${newGameName}`);
    } catch (error) {
        console.error("Error updating game name:", error);
    }
}

loadGames().then(() => {
    console.log("Games loaded or user not logged in - DOMContentLoaded");
});

export default loadGames;


