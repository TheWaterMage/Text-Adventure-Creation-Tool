// Import specific Firestore and Auth functions from CDN
import { getDocs, getDoc, setDoc, doc, updateDoc, collection } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Import db and auth from firebase.js
import { db, auth } from './firebase.js';

// Function to save or update the game
export async function saveGame(gameData, gameId = null) {
    console.log("saveGame function called");
    console.log("Original gameData received:", JSON.stringify(gameData, null, 2));

    const user = auth.currentUser;
    if (!user) {
        console.error("User must be logged in to save the game.");
        return;
    }

    if (!gameId) {
        gameId = await getNextGameId(user.uid);
    }

    const userGamesRef = collection(db, "Users", user.uid, "Games");
    const gameRef = doc(userGamesRef, gameId);

    try {
        // Sanitize the 'connectedRooms' and 'variableList' field to ensure it only stores room IDs as integers
        gameData.rooms = gameData.rooms.map(room => {
            // Extract room IDs
            const sanitizedConnectedRooms = room.connectedRooms.map(conn => {
                // Ensure the connection ID is an integer (if it isn't already)
                return typeof conn === 'number' ? conn : parseInt(conn[1], 10);
            });
            //Extract object IDs
            const sanitizeInsertObjects = room.variableList.map(conn => {
                // Ensure the connection ID is an integer (if it isn't already)
               return typeof conn === 'number' ? conn : parseInt(conn[1], 10);
            });

            return {
                ...room,
                connectedRooms: sanitizedConnectedRooms, // Store the room IDs
                variableList: sanitizeInsertObjects //store object id in rooms
            };
        });
        
        // Store object data
        gameData.objects = gameData.objects.map(object => {
            //Extract variable count
            const sanitizeInsertObjectsCount = object.variableList.map(conn => {
                // Ensure the connection ID is an integer (if it isn't already)
               return typeof conn === 'number' ? conn : parseInt(conn[1], 10);
            });
            
            return{
                ...object,
                variableList: sanitizeInsertObjectsCount // Keep variableList unchanged
            };
        });

        console.log("Sanitized gameData:", JSON.stringify(gameData, null, 2));

        const docSnapshot = await getDoc(gameRef);

        if (docSnapshot.exists()) {
            console.log("Existing game found, merging data...");
            const updatedData = {
                gameName: gameData.gameName || docSnapshot.data().gameName,
                rooms: gameData.rooms || docSnapshot.data().rooms || [],
                objects: gameData.objects || docSnapshot.data().objects || []
            };
            await setDoc(gameRef, updatedData, { merge: true });
            console.log("Game data merged successfully!");
        } else {
            console.log("No existing game data, creating new game...");
            await setDoc(gameRef, {
                gameName: gameData.gameName || `Game ${gameId}`,
                rooms: gameData.rooms || [],
                objects: gameData.objects || []
            });
            console.log("New game created and saved successfully!");
        }

        alert("Game saved!");
    } catch (error) {
        console.error("Error saving the game:", error);
        alert("Error saving the game");
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