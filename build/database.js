import { getDocs, getDoc, setDoc, doc, collection } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, auth } from './firebase.js';

export async function saveGame(gameData) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to save!");
        return;
    }

    try {
        const gameId = new URLSearchParams(window.location.search).get('gameId') || Date.now().toString();
        const gameRef = doc(db, "Users", user.uid, "Games", gameId);

        await setDoc(gameRef, {
            rooms: gameData.rooms,
            objects: gameData.objects,
        }, { merge: true });

        if (!window.location.search.includes('gameId')) {
            history.replaceState(null, '', `?gameId=${gameId}`);
        }
        alert("Saved to Firebase successfully!");
    } catch (error) {
        console.error("Firebase save error:", error);
        alert("Save failed!");
    }
}

// load game
window.loadGame = async (gameId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error("User not logged in");
            return null;
        }

        const gameRef = doc(db, "Users", user.uid, "Games", gameId);
        const docSnap = await getDoc(gameRef);

        if (!docSnap.exists()) return null;

        const firebaseData = docSnap.data();
        console.log("Raw Firebase data:", firebaseData); // Debug log

        // Transform room data
        const rooms = firebaseData.rooms.map(room => ({
            ...room,
            id: room.id || roomList.length,
            connectedRooms: room.connectedRooms.map(conn => 
                Array.isArray(conn) ? conn : 
                [conn?.locked || false, conn?.roomId || -1]
            ),
            variableList: room.variableList.map(item => 
                Array.isArray(item) ? item : item || 0
            )
        }));

        // Transform object data
        const objects = firebaseData.objects.map(obj => ({
            ...obj,
            id: obj.id || objectList.length,
            variableList: obj.variableList.map(item => 
                Array.isArray(item) ? item : [item?.name || "", item?.value || 0]
            )
        }));

        console.log("Transformed data:", { rooms, objects }); // Debug log
        return { rooms, objects };

    } catch (error) {
        console.error("Load error:", error);
        throw error;
    }
};
window.saveGame = saveGame; //dont touch
