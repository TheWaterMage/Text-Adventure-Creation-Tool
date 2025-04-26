import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, auth } from './firebase.js';
import { saveGame } from './database.js';
import { handleExportGame } from './Export.js';

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
        gameContainer.innerHTML = ''; // Clear existing content

        querySnapshot.forEach((doc) => {
            const gameData = doc.data();
            const gameId = doc.id;

            // Ensure gameName and description have fallback values
            const gameName = gameData.gameName || `Game ${gameId}`;
            const gameDescription = gameData.description || "No description available.";

            const gameCard = document.createElement('div');
            gameCard.classList.add('game-card');

            gameCard.innerHTML = `
                <h3 id="gameName${gameId}" class="readable editable">${gameName}</h3>
                <p id="gameDescription${gameId}" class="readable editable">${gameDescription}</p>
                <div class="game-actions">
                    <button class="action-button readable export-button" data-game-id="${gameId}">Export</button>
                    <a href="editor.html?gameId=${gameId}" class="action-button readable">Edit</a>
                    <button class="action-button readable play-button" data-game-id="${gameId}">Play</button>
                    <button class="action-button readable delete-button" data-game-id="${gameId}">Delete</button>
                </div>
            `;

            gameContainer.appendChild(gameCard);

            // Add event listeners for editing game name and description
            const gameNameElement = gameCard.querySelector(`#gameName${gameId}`);
            const gameDescriptionElement = gameCard.querySelector(`#gameDescription${gameId}`);

            makeEditable(gameNameElement, gameId, "gameName");
            makeEditable(gameDescriptionElement, gameId, "description");

            // Add event listeners for buttons
            gameCard.querySelector('.export-button').addEventListener('click', handleExportGame);
            gameCard.querySelector('.delete-button').addEventListener('click', handleDeleteGame);
            gameCard.querySelector('.play-button').addEventListener('click', handlePlayGame);
        });
    } catch (error) {
        console.error("Error loading games:", error);
    }
}

function makeEditable(element, gameId, field) {
    element.addEventListener('dblclick', () => {
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = element.textContent.trim();
        inputField.classList.add('editable-input');

        inputField.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                await saveGameField(gameId, field, inputField.value.trim());
            }
        });

        inputField.addEventListener('blur', async () => {
            await saveGameField(gameId, field, inputField.value.trim());
        });

        element.replaceWith(inputField);
        inputField.focus();
    });
}

async function saveGameField(gameId, field, value) {
    const user = auth.currentUser;
    if (!user) {
        console.error("User must be logged in to save changes.");
        return;
    }

    try {
        const gameRef = doc(db, "Users", user.uid, "Games", gameId);
        await updateDoc(gameRef, { [field]: value });

        const updatedElement = document.createElement(field === "gameName" ? 'h3' : 'p');
        updatedElement.id = field === "gameName" ? `gameName${gameId}` : `gameDescription${gameId}`;
        updatedElement.textContent = value;
        updatedElement.classList.add('readable', 'editable');

        makeEditable(updatedElement, gameId, field);

        const inputField = document.querySelector(`.editable-input`);
        if (inputField) {
            inputField.replaceWith(updatedElement);
        }
    } catch (error) {
        console.error(`Error updating ${field}:`, error);
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

async function handlePlayGame(event) {
    const gameId = event.target.dataset.gameId;
    const user = auth.currentUser;

    if (!user) {
        console.error("User must be logged in to play a game.");
        alert("You must be logged in to play a game.");
        return;
    }

    try {
        const gameData = await fetchGameData(user.uid, gameId);
        if (gameData) {
            // Store game data in local storage for demo.html to access
            localStorage.setItem('Rooms', JSON.stringify(gameData.rooms));
            localStorage.setItem('Objs', JSON.stringify(gameData.objects));
            // Open demo.html in a new tab
            window.open('demo.html', '_blank');
        } else {
            console.error("No game data found for play.");
            alert("No game data found for play.");
        }
    } catch (error) {
        console.error("Error playing game:", error);
        alert("Error playing game.");
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

export function populateGames(games) {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = ''; // Clear existing content

    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.classList.add('game-card');

        gameCard.innerHTML = `
            <h3 class="readable">${game.title}</h3>
            <p class="readable">${game.description}</p>
            <div class="game-actions">
                <button class="action-button readable">Export</button>
                <button class="action-button readable">Edit</button>
                <button class="action-button readable">Play</button>
                <button class="action-button readable">Delete</button>
            </div>
        `;

        gameContainer.appendChild(gameCard);
    });
}

export default loadGames;