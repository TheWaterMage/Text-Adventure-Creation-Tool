import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, auth } from './firebase.js';

async function loadGames() {
    const user = auth.currentUser;

    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                console.log("User logged in:", user.uid);
                fetchAndDisplayGames(user.uid).then(() => resolve());
            } else {
                console.error("User not logged in");
                resolve();
            }
            unsubscribe();
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
            gameSlot.innerHTML = `
                <div class="game-name">
                    <h3 id="gameName${gameId}" class="readable">${gameData.gameName}</h3>
                </div>
                <div class="game-buttons">
                    <button class="readable">Export</button>
                    <button class="readable"><a href="editor.html?gameId=${gameId}">Edit</a></button>
                    <button class="readable">Play</button>
                </div>
            `;
            gameContainer.appendChild(gameSlot);
        });
    } catch (error) {
        console.error("Error loading games:", error);
    }
}

export function createGame() {
    // Instead of creating in Firestore, just redirect to editor
    window.location.href = 'editor.html';
}

export function editGameName(gameId) {
    const gameNameElement = document.getElementById(`gameName${gameId}`);
    const currentName = gameNameElement.textContent.trim();
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.id = `gameName${gameId}`;
    
    input.addEventListener('blur', () => {
        const updatedName = input.value.trim() || `Game ${gameId}`;
        const h3 = document.createElement('h3');
        h3.id = `gameName${gameId}`;
        h3.className = 'readable';
        h3.textContent = updatedName;
        input.replaceWith(h3);
    });

    gameNameElement.replaceWith(input);
    input.focus();
}

loadGames().then(() => {
    console.log("Games loaded or user not logged in");
});

export default loadGames;