import { getDocs, getDoc, setDoc, doc, collection } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
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

    // Get gameId from URL if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const urlGameId = urlParams.get('gameId');

    // Use existing gameId from URL or generate a new one
    if (!gameId) {
        if (urlGameId) {
            gameId = urlGameId;
        } else {
            gameId = await getNextGameId(user.uid);
        }
    }

    const userGamesRef = collection(db, "Users", user.uid, "Games");
    const gameRef = doc(userGamesRef, gameId);

    try {
        // Sanitize the 'connectedRooms' and 'variableList' field to ensure it only stores room IDs as integers
        gameData.rooms = gameData.rooms.map(room => {
            // Extract room IDs
            const sanitizedConnectedRooms = room.connectedRooms.map(conn => {
                return typeof conn === 'number' ? conn : parseInt(conn, 10);
            });
            
            const sanitizeInsertObjects = room.variableList.map(conn => {
                return typeof conn === 'number' ? conn : parseInt(conn, 10);
            });

            return {
                ...room,
                connectedRooms: sanitizedConnectedRooms,
                variableList: sanitizeInsertObjects
            };
        });
        
        // Store object data
        gameData.objects = gameData.objects.map(object => {
            const sanitizeInsertObjectsCount = object.variableList.map(conn => {
                return typeof conn === 'number' ? conn : parseInt(conn, 10);
            });
            
            return {
                ...object,
                variableList: sanitizeInsertObjectsCount
            };
        });

        console.log("Sanitized gameData:", JSON.stringify(gameData, null, 2));

        const docSnapshot = await getDoc(gameRef);

        if (docSnapshot.exists() && urlGameId) {
            // Update existing game
            console.log("Updating existing game...");
            await setDoc(gameRef, {
                gameName: gameData.gameName || docSnapshot.data().gameName || `Game ${gameId}`,
                rooms: gameData.rooms || docSnapshot.data().rooms || [],
                objects: gameData.objects || docSnapshot.data().objects || []
            }, { merge: true });
            console.log("Game updated successfully!");
        } else {
            // Create new game
            console.log("Creating new game...");
            await setDoc(gameRef, {
                gameName: gameData.gameName || `Game ${gameId}`,
                rooms: gameData.rooms || [],
                objects: gameData.objects || []
            });
            console.log("New game created successfully!");
        }

        alert("Game saved!");
        
        // If this was a new game, redirect to the same page with the new gameId
        if (!urlGameId) {
            window.history.replaceState(null, '', `?gameId=${gameId}`);
        }
    } catch (error) {
        console.error("Error saving the game:", error);
        alert("Error saving the game");
    }
}

// Function to load an existing game
export async function loadGame(gameId) {
    console.log("Loading game with ID:", gameId);
    
    const user = auth.currentUser;
    if (!user) {
        console.error("User must be logged in to load the game.");
        return;
    }

    try {
        const gameRef = doc(db, "Users", user.uid, "Games", gameId);
        const gameDoc = await getDoc(gameRef);

        if (gameDoc.exists()) {
            const gameData = gameDoc.data();
            console.log("Loaded game data:", gameData);

            // Clear existing data
            window.objectList.length = 0;
            window.roomList.length = 0;
            
            // Load rooms
            if (gameData.rooms && Array.isArray(gameData.rooms)) {
                gameData.rooms.forEach(room => {
                    window.roomList.push({
                        id: room.id,
                        type: "room",
                        variableList: Array.isArray(room.variableList) ? room.variableList : [],
                        connectedRooms: Array.isArray(room.connectedRooms) ? room.connectedRooms : 
                                      [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]],
                        description: room.description || "",
                        text: room.text || `room ${room.id}`
                    });
                });
            }
            
            // Load objects
            if (gameData.objects && Array.isArray(gameData.objects)) {
                gameData.objects.forEach(obj => {
                    window.objectList.push({
                        id: obj.id,
                        type: "object",
                        character: obj.character || false,
                        variableList: Array.isArray(obj.variableList) ? obj.variableList : [],
                        description: obj.description || "",
                        text: obj.text || `object ${obj.id}`
                    });
                });
            }

            // Render the loaded data
            if (typeof window.renderObjects === 'function') {
                window.renderObjects(-1, "room");
            }
            
            console.log("Game loaded successfully!");
            return true;
        } else {
            console.error("No game found with ID:", gameId);
            return false;
        }
    } catch (error) {
        console.error("Error loading game:", error);
        throw error;
    }
}

// Helper function to get the next available game ID
async function getNextGameId(userId) {
    const userGamesRef = collection(db, "Users", userId, "Games");

    try {
        const snapshot = await getDocs(userGamesRef);
        const gameIds = snapshot.docs.map(doc => doc.id);
        const highestGameId = Math.max(...gameIds.map(id => parseInt(id.replace('game', '')) || 0), 0);
        return `game${highestGameId + 1}`;
    } catch (error) {
        console.error("Error fetching game IDs: ", error);
        return "game1";
    }
}

window.saveGame = saveGame;