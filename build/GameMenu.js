import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, auth } from './firebase.js';
import { saveGame } from './database.js';
import JSZip from 'https://cdn.skypack.dev/jszip';
import FileSaver from 'https://cdn.skypack.dev/file-saver';

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
                    <button class="export-button readable" data-game-id="${gameId}">Export</button>
                    <button class="readable"><a href="editor.html?gameId=${gameId}">Edit</a></button>
                    <button class="readable"">Play</button>
                    <button class="delete-button readable" data-game-id="${gameId}">Delete</button> 
                </div>
            `;
            gameContainer.appendChild(gameSlot);

            gameSlot.querySelector('.game-name h3').addEventListener('click', () => {
                editGameName(gameId);
            });

            //grab the export button and add an event listener to it.
            const exportButton = gameSlot.querySelector('.export-button');
            if(exportButton){
                exportButton.addEventListener('click', handleExportGame);
            }
            
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

async function handleExportGame(event) {
    const gameId = event.target.dataset.gameId;
    const user = auth.currentUser;

    if (!user) {
        console.error("User must be logged in to export a game.");
        alert("You must be logged in to export a game.");
        return;
    }
    
    try {
        const gameData = await fetchGameData(user.uid, gameId);
        if (gameData) {
            downloadGame(gameData, gameId);
        } else {
            console.error("No game data found for export.");
            alert("No game data found for export.");
        }
    } catch (error) {
        console.error("Error exporting game:", error);
        alert("Error exporting game.");
    }
}

// Function to fetch game data from Firestore
async function fetchGameData(userId, gameId) {
    const gameRef = doc(db, "Users", userId, "Games", gameId);
    const gameDoc = await getDoc(gameRef);
    if (gameDoc.exists()) {
        return gameDoc.data();
    } else {
        return null;
    }
}

function downloadGame(gameData, gameId){
    const zip = new JSZip();

    // Adding game data to a JSON file
    zip.file("gameData.json", JSON.stringify(gameData, null, 2));

    // Adding demo.html, demo.js and other necessary files
    const demoHTML = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <h1>Text Adventure</h1>
        <ul id="history"></ul>
        <input id="txtBox" type="text">
        <button onclick="submitAction()">Submit</button>
        <script src="demo.js"></script>
    </body>
    </html>`;

    const styleCSS = `body {
        font-family: monospace;
        background-color: #333;
        color: #eee;
    }
    
    h1, h2, h3, h4 {
        font-family: monospace;
        color: #eee;
    }
    
    ul {
        list-style-type: none;
        padding: 0;
    }
    
    li.container {
        margin-bottom: 10px;
    }
    
    li.container li {
        margin-left: 20px;
    }
    
    li.container li:first-child {
        color: lightgreen;
    }
    
    li.container li:nth-child(2) {
        color: lightblue;
    }`;
    zip.file("index.html", demoHTML);
    zip.file("style.css", styleCSS);
    zip.file("demo.js", getDemoJS(gameData));

    // Generating the zip file
    zip.generateAsync({ type: "blob" }).then(function (content) {
        // Downloading the zip file using FileSaver
        FileSaver.saveAs(content, `${gameId}.zip`);
    });
}

function getDemoJS(gameData) {
    return `
const roomList = ${JSON.stringify(gameData.rooms)};
const objectList = ${JSON.stringify(gameData.objects)};
const choices = ['left', 'right', 'foreward', 'back', 'up', 'down', 'take', 'look at', 'drop', 'bag', 'use'];
const inv = [];
var options = [];
const history = document.getElementById('history');
const textbox = document.getElementById('txtBox');
var pos = 0;
let ttsEnabled = false; // TTS toggle state

window.onload = RoomDescriptions;

function submitAction() {
    const responseBox = document.createElement('li');
    const input = document.createElement('li');
    const response = document.createElement('li');
    let moved = false;

    response.style.whiteSpace = "pre-wrap";
    responseBox.className = "container";

    input.textContent = '> ' + textbox.value;
    responseBox.appendChild(input);

    let command = textbox.value.split(' ')[0].toLowerCase();
    let validCommand = choices.some(str => command.includes(str));
    if (validCommand) {
        // Movement commands
        if (options.some(str => command == str) && (command == choices[0] || command == choices[1] || command == choices[2] || command == choices[3] || command == choices[4] || command == choices[5])) {
            switch (command) {
                case 'foreward':
                    if(roomList[pos].connectedRooms[0][0] == false){
                        response.textContent = "You move " + command;
                        pos = roomList[pos].connectedRooms[0][1];
                        moved = true;
                    }
                    else{
                        response.textContent = "That path is blocked";
                    }
                    break;
                case 'back':
                    if(roomList[pos].connectedRooms[1][0] == false){
                        response.textContent = "You move " + command;
                        pos = roomList[pos].connectedRooms[1][1];
                        moved = true;
                    }
                    else{
                        response.textContent = "That path is blocked";
                    }
                    break;
                case 'left':
                    if(roomList[pos].connectedRooms[2][0] == false){
                        response.textContent = "You move " + command;
                        pos = roomList[pos].connectedRooms[2][1];
                        moved = true;
                    }
                    else{
                        response.textContent = "That path is blocked";
                    }
                    break;
                case 'right':
                    if(roomList[pos].connectedRooms[3][0] == false){
                        response.textContent = "You move " + command;
                        pos = roomList[pos].connectedRooms[3][1];
                        moved = true;
                    }
                    else{
                        response.textContent = "That path is blocked";
                    }
                    break;
                case 'up':
                    if(roomList[pos].connectedRooms[4][0] == false){
                        response.textContent = "You move " + command;
                        pos = roomList[pos].connectedRooms[4][1];
                        moved = true;
                    }
                    else{
                        response.textContent = "That path is blocked";
                    }
                    break;
                case 'down':
                    if(roomList[pos].connectedRooms[5][0] == false){
                        response.textContent = "You move " + command;
                        pos = roomList[pos].connectedRooms[5][1];
                        moved = true;
                    }
                    else{
                        response.textContent = "That path is blocked";
                    }
                    break;
            }
            responseBox.appendChild(response);
        }
        // Picking up an item
        else if (options.some(str => command == str) && (command == choices[6])) {
            let modifier = textbox.value.slice(textbox.value.toLowerCase().indexOf(command) + command.length).trim().toLowerCase();
            if (roomList[pos].variableList.some(i => objectList[i].text.toLowerCase() == modifier)) {
                if(objectList[roomList[pos].variableList.find(i => objectList[i].text.toLowerCase() == modifier)].character == 0){
                    response.textContent = 'You pick up the ' + modifier;
                    inv.push(objectList.findIndex(obj => obj.text.toLowerCase() == modifier));
                    roomList[pos].variableList.splice(roomList[pos].variableList.findIndex(obj => objectList[obj].text.toLowerCase() == modifier), 1);
                    if(objectList[inv[inv.length-1]].variableList[1][1]){
                        options.push('use');
                    }
                }
                else{
                    response.textContent = 'You cannot pick that up\n';
                }
            } else {
                response.textContent = 'That\'s not in this room';
            }
            responseBox.appendChild(response);
        }
        // Looking at an item
        else if (options.some(str => command == str) && (command == choices[7])) {
            let modifier = textbox.value.slice(textbox.value.toLowerCase().indexOf(command) + command.length).trim().toLowerCase();
            if (roomList[pos].variableList.some(i => objectList[i].text.toLowerCase() == modifier)) {
                response.textContent = 'You look at the ' + modifier + "\\n";
                response.textContent += objectList[objectList.findIndex(obj => obj.text.toLowerCase() == modifier)].description;
            } else {
                response.textContent = 'That\'s not in this room.';
            }
            responseBox.appendChild(response);
        }
        // Dropping an item in inventory
        else if ((command == choices[8])) {
            let modifier = textbox.value.slice(textbox.value.toLowerCase().indexOf(command) + command.length).trim().toLowerCase();
            if (inv.some(i => objectList[i].text.toLowerCase() == modifier)) {
                response.textContent = 'You drop the ' + modifier;
                inv.splice(inv.findIndex(obj => objectList[obj].text.toLowerCase() == modifier), 1);
                roomList[pos].variableList.push(objectList.findIndex(obj => obj.text.toLowerCase() == modifier));
            } else {
                response.textContent = 'You don\'t have that.';
            }
            responseBox.appendChild(response);
        }
        else if (command == choices[9]) {
            if (inv.length == 0) {
                response.textContent = 'You don\'t have anything';
            } else {
                for (let i = 0; i < inv.length; i++) {
                    response.textContent += 'You have a ' + objectList[inv[i]].text.toLowerCase() + "\\n";
                }
            }
            responseBox.appendChild(response);
        }
        else if(command == choices[10]){
            let regex = /\\b\\w+\\b/g;
            let words = textbox.value.match(regex);
            let filter = ["use", "on"];
            let filtered = words.filter(word => !filter.includes(word.toLowerCase())).map(word => word.toLowerCase());
            if(filtered.length == 2){
                if(inv.some(i => objectList[i].text.toLowerCase() == filtered[0])){
                    let item = inv.findIndex(index => objectList[index].text.toLowerCase() == filtered[0]);
                    if(objectList[item].variableList[1][1]){
                        switch (filtered[1]) {
                            case 'foreward':
                                    if(roomList[pos].connectedRooms[0][0] == true){
                                        response.textContent = "That path is unlocked";
                                        roomList[pos].connectedRooms[0][0] = false;
                                        moved = true;
                                    }
                                    else{
                                        response.textContent = "That path is not blocked";
                                    }
                                break;
                            case 'back':
                                if(roomList[pos].connectedRooms[1][0] == true){
                                    response.textContent = "That path is unlocked";
                                    roomList[pos].connectedRooms[1][0] = false;
                                    moved = true;
                                }
                                else{
                                    response.textContent = "That path is not blocked";
                                }
                                break;
                            case 'left':
                                if(roomList[pos].connectedRooms[2][0] == true){
                                    response.textContent = "That path is unlocked";
                                    roomList[pos].connectedRooms[2][0] = false;
                                    moved = true;
                                }
                                else{
                                    response.textContent = "That path is not blocked";
                                }
                                break;
                            case 'right':
                                if(roomList[pos].connectedRooms[3][0] == true){
                                    response.textContent = "That path is unlocked";
                                    roomList[pos].connectedRooms[3][0] = false;
                                    moved = true;
                                }
                                else{
                                    response.textContent = "That path is not blocked";
                                }
                                break;
                            case 'up':
                                if(roomList[pos].connectedRooms[4][0] == true){
                                    response.textContent = "That path is unlocked";
                                    roomList[pos].connectedRooms[4][0] = false;
                                    moved = true;
                                }
                                else{
                                    response.textContent = "That path is not blocked";
                                }
                                break;
                            case 'down':
                                if(roomList[pos].connectedRooms[5][0] == true){
                                    response.textContent = "That path is unlocked";
                                    roomList[pos].connectedRooms[5][0] = false;
                                    moved = true;
                                }
                                else{
                                    response.textContent = "That path is not blocked";
                                }
                                break;
                        }}
                    else{
                        response.textContent = "That item is not a key";
                    }
                    responseBox.appendChild(response);
                }
                else if(roomList[pos].variableList.some(i => objectList[i].text.toLowerCase() == filtered[0])){
                    console.log("That's in the room");
                }
            }
        }
        else {
            console.log(command);
            response.textContent = "You can't do that.";
            responseBox.appendChild(response);
        }
    }
    else if (textbox.value.includes('?')) {
        response.textContent += "Foreward: Move to the room in front.\\n";
        response.textContent += "Back: Move to the room behind you.\\n";
        response.textContent += "Left: Move to the room to the left.\\n";
        response.textContent += "Right: Move to the room to the Right.\\n";
        response.textContent += "Up: Move to the room above.\\n";
        response.textContent += "Down: Move to the room below.\\n";
        response.textContent += "take [Item Name]: pick up an item in the same room.\\n";
        response.textContent += "Look at: Take a closer look at an item in the same room.\\n";
        response.textContent += "Drop [Item Name]: drop an item in your inventory.\\n";
        response.textContent += "Bag: look at items you hold.\\n";
        response.textContent += "Use [Item Name]: use item if it is in your bag or in the room\\n";
        response.textContent += "Use [Item Name] on [Direction]: use item if it is in your bag or in the room\\n";
        responseBox.appendChild(response);
    }
    else {
        response.textContent = "Sorry I don't understand type '?' for a list of commands";
        responseBox.appendChild(response);
    }

    history.appendChild(responseBox);

    if (moved) {
        RoomDescriptions();
    }

    history.scrollTop = history.scrollHeight;
    textbox.value = "";
    
    // Ensure applyHoverTTS is defined or loaded from elsewhere
    // applyHoverTTS("#history"); // Apply hover functionality to new content
}

function RoomDescriptions() {
    options = [];
    const room = roomList[pos];
    const desc = room.description;
    const responseBox = document.createElement('li');
    const descEle = document.createElement('li');
    const mvmnt = document.createElement('li');
    const lockedPaths = document.createElement('li');
    lockedPaths.style.whiteSpace = "pre-wrap";

    responseBox.className = "container";

    if (desc.trim().length === 0) {
        descEle.textContent = "You are in a room";
    } else {
        descEle.textContent = desc;
    }
    responseBox.appendChild(descEle);

    // adds possible paths to room description
    mvmnt.textContent += "You can move";
    if (room.connectedRooms[0][1] > -1 && room.connectedRooms[0][0] == false) {
        mvmnt.textContent += " foreward";
        options.push("foreward");
    }
    if (room.connectedRooms[1][1] > -1 && room.connectedRooms[1][0] == false) {
        mvmnt.textContent += " back";
        options.push("back");
    }
    if (room.connectedRooms[2][1] > -1 && room.connectedRooms[2][0] == false) {
        mvmnt.textContent += " left";
        options.push("left");
    }
    if (room.connectedRooms[3][1] > -1 && room.connectedRooms[3][0] == false) {
        mvmnt.textContent += " right";
        options.push("right");
    }
    if (room.connectedRooms[4][1] > -1 && room.connectedRooms[4][0] == false) {
        mvmnt.textContent += " up";
        options.push("up");
    }
    if (room.connectedRooms[5][1] > -1 && room.connectedRooms[5][0] == false) {
        mvmnt.textContent += " down";
        options.push("down");
    }
    responseBox.appendChild(mvmnt);

    // adds lock paths to description of room
    if (room.connectedRooms[0][1] > -1 && room.connectedRooms[0][0] == true) {
        lockedPaths.textContent += "The path forewards is locked\\n";
        options.push("foreward");
    }
    if (room.connectedRooms[1][1] > -1 && room.connectedRooms[1][0] == true) {
        lockedPaths.textContent += "The path back is locked\\n";
        options.push("back");
    }
    if (room.connectedRooms[2][1] > -1 && room.connectedRooms[2][0] == true) {
        lockedPaths.textContent += "The path to the left is locked\\n";
        options.push("left");
    }
    if (room.connectedRooms[3][1] > -1 && room.connectedRooms[3][0] == true) {
        lockedPaths.textContent += "The path to the right us locked\\n";
        options.push("right");
    }
    if (room.connectedRooms[4][1] > -1 && room.connectedRooms[4][0] == true) {
        lockedPaths.textContent += "The path up is locked\\n";
        options.push("up");
    }
    if (room.connectedRooms[5][1] > -1 && room.connectedRooms[5][0] == true) {
        lockedPaths.textContent += "The path down is locked\\n";
        options.push("down");
    }
    responseBox.appendChild(lockedPaths);

    // lists off objects in the room
    if (roomList[pos].variableList.length > 0) {
        const item = document.createElement('li');
        item.textContent = "You can see";
        roomList[pos].variableList.forEach(obj => {
            item.textContent += " a " + objectList[obj].text;
            responseBox.appendChild(item);
        });
        options.push('take');
        options.push('look at');
    } else {
        const item = document.createElement('li');
        item.textContent = "You don't see anything else.";
        responseBox.appendChild(item);
    }

    if(inv.some(i => objectList[i].variableList[1][1])){
        options.push('use');
    }

    console.log(options);
    history.appendChild(responseBox);
}
`;
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