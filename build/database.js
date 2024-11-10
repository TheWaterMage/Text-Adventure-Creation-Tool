// Import specific Firestore and Auth functions from CDN
import { getDocs, getDoc, setDoc, doc, updateDoc, collection } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Import db and auth from firebase.js
import { db, auth } from './firebase.js';

// Function to save or update the game
export async function saveGame(gameData, gameId = null) { // Set default to "game1" for testing purposes
    console.log("saveGame function called");
    console.log("Data received:", gameData);

    const user = auth.currentUser;  // Use imported `auth`
    if (!user) {
        console.error("User must be logged in to save the game.");
        return;
    }

    // If no gameId is provided, generate a new one
    if (!gameId) {
        gameId = await getNextGameId(user.uid);
    }

    // Reference to the user's games collection in Firestore
    const userGamesRef = collection(db, "Users", user.uid, "Games");

    // Reference to the specific game document where data will be saved
    const gameRef = doc(userGamesRef, gameId);

    try {
        // Fetch the existing game data from Firestore
        const docSnapshot = await getDoc(gameRef);

        if (docSnapshot.exists()) {
            // Game data exists, so we'll merge the new data with the existing document
            console.log("Existing game found, merging data...");
            
            // Use the merge option to update specific fields in the document
            const updatedData = {
                gameName: gameData.gameName || docSnapshot.data().gameName, // Keep existing gameName if not provided
                rooms: gameData.rooms || docSnapshot.data().rooms, // Use new rooms if provided, otherwise keep existing
                objects: gameData.objects || docSnapshot.data().objects, // Same for objects
            };

            // Merge the updated data with the existing game document
            await setDoc(gameRef, updatedData, { merge: true });
            console.log("Game data merged successfully!");
        } else {
            // No existing game data, create a new document with gameData
            console.log("No existing game data, creating new game...");
            await setDoc(gameRef, {
                gameName: gameData.gameName || `Game ${gameId}`,
                rooms: gameData.rooms || [],
                objects: gameData.objects || []
            });
            console.log("New game created and saved successfully!");
        }
        alert("game saved");
    } catch (error) {
        console.error("Error saving the game: ", error);
        alert("error saving the game");
    }
}
window.saveGame = saveGame; //important. This allows saveGame to be called by save() in editorScripts.js

// Helper function to get the next available game ID by querying the existing games
async function getNextGameId(userId) {
    const userGamesRef = collection(db, "Users", userId, "Games");

    try {
        const snapshot = await getDocs(userGamesRef);
        const gameIds = snapshot.docs.map(doc => doc.id);

        // Find the highest existing game ID and increment it
        const highestGameId = Math.max(...gameIds.map(id => parseInt(id.replace('game', ''))), 0);
        return `game${highestGameId + 1}`;
    } catch (error) {
        console.error("Error fetching game IDs: ", error);
        return "game1"; // Default to 'game1' if there's an error or no games exist
    }
}