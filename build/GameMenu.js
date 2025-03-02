import { collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
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
        gameContainer.innerHTML = '';

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
                    <button class="delete-button readable" data-game-id="${gameId}">Delete</button> 
                </div>
            `;
            gameContainer.appendChild(gameSlot);

            gameSlot.querySelector('.game-name h3').addEventListener('click', () => {
                editGameName(gameId);
            });
            
        });

        const deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', handleDeleteGame);
        });

    } catch (error) {
        console.error("Error loading games:", error);
    }
}

async function deleteGame(userId, gameId) {
    try {
        const gameRef = doc(db, "Users", userId, "Games", gameId);
        await deleteDoc(gameRef);
        console.log(`Game ${gameId} deleted successfully.`);
        alert("Game deleted");
        return true;
    } catch (error) {
        console.error("Error deleting game:", error);
        alert("Error deleting game");
        return false;
    }
}

// Event handler for delete button clicks
async function handleDeleteGame(event) {
    const gameId = event.target.dataset.gameId;
    const user = auth.currentUser;

    if (!user) {
        console.error("User must be logged in to delete a game.");
        alert("You must be logged in to delete a game.");
        return;
    }

    if (confirm(`Are you sure you want to delete game ${gameId}?`)) {
      const success = await deleteGame(user.uid, gameId);
      if(success) {
        await fetchAndDisplayGames(user.uid); // Refresh game list
      }
    }
}

export function editGameName(gameId) {
    const gameNameElement = document.getElementById(`gameName${gameId}`);
    if (!gameNameElement) return;

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = gameNameElement.textContent.trim();
    inputField.id = `inputGameName${gameId}`;

    inputField.addEventListener('keydown', async function (event) {
        if (event.key === 'Enter') {
            await saveGameName(gameId, inputField.value.trim());
        }
    });

    inputField.addEventListener('blur', async function () {
        await saveGameName(gameId, inputField.value.trim());
    });

    gameNameElement.replaceWith(inputField);
    inputField.focus();
}


export async function saveGameName(gameId, newGameName) {
    const user = auth.currentUser;
    if (!user) {
        console.error("User must be logged in to rename games.");
        return;
    }

    const updatedName = newGameName || `Game ${gameId}`;
    try {
        const gameRef = doc(db, "Users", user.uid, "Games", gameId);
        await updateDoc(gameRef, { gameName: updatedName });

        // Replace input field with updated <h3>
        const gameNameElement = document.createElement('h3');
        gameNameElement.id = `gameName${gameId}`;
        gameNameElement.textContent = updatedName;
        gameNameElement.classList.add('readable');
        gameNameElement.addEventListener('click', () => editGameName(gameId));

        const inputField = document.getElementById(`inputGameName${gameId}`);
        if (inputField) {
            inputField.replaceWith(gameNameElement);
        }

    } catch (error) {
        console.error("Error updating game name:", error);
    }
}


export function createGame() {
    // Instead of creating in Firestore, just redirect to editor
    window.location.href = 'editor.html';
}

loadGames().then(() => {
    console.log("Games loaded or user not logged in");
});

export default loadGames;