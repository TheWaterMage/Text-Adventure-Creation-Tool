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
    zip.file("demo.js", getDemoJS(gameData));
    zip.file("demo.css", getDemoCSS(gameData));
    zip.file("demo.html", getDemohtml(gameData));
	zip.file("style.css", getStyle(gameData));

    // Generating the zip file
    zip.generateAsync({ type: "blob" }).then(function (content) {
        // Downloading the zip file using FileSaver
        FileSaver.saveAs(content, `${gameData.gameName}.zip`);
    });
}

function getDemoJS(gameData) {
    return `
const roomList = JSON.parse(localStorage.getItem('Rooms'));
const objectList = JSON.parse(localStorage.getItem('Objs'));
const choices = ['left', 'right', 'foreward', 'back', 'up', 'down', 'take', 'look at', 'drop', 'bag', 'use', 'desc', 'interact'];
const inv = [];
var options = [];
const history = document.getElementById('history');
const textbox = document.getElementById('txtBox');
var pos = 0;
var state = "roaming";
var shop = -1;
let ttsEnabled = false; // TTS toggle state

window.onload = RoomDescriptions();

function speak(text) {
    if (ttsEnabled) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
        // Move up the list
        // Implement your logic here
    } else if (event.key === 'ArrowDown') {
        // Move down the list
        // Implement your logic here
    } else if (event.key === 'Enter') {
        // Activate the selected link or choice/option
        // Implement your logic here
    } else if (event.key === 'Escape') {
        // Cancel the TTS
        speechSynthesis.cancel();
    }
});

document.getElementById('ttsToggle').addEventListener('click', function() {
    ttsEnabled = !ttsEnabled;
    this.textContent = ttsEnabled ? 'Text To Speech Enabled' : 'Text To Speech Disabled';
    if (ttsEnabled) {
        readAllText();
    }
});

function readAllText() {
    const elements = document.querySelectorAll("#history li");
    let combinedText = "";
    elements.forEach(element => {
        combinedText += element.innerText.trim() || element.textContent.trim();
        combinedText += " "; // Add a space between elements
    });
    speak(combinedText);
}

function submitAction() {
	const responseBox = document.createElement('li');
	const input = document.createElement('li');
	const response = document.createElement('li');
	let moved = false;

	response.style.whiteSpace = "pre-wrap";
	responseBox.className = "container";

	input.textContent = '> ' + textbox.value;
	responseBox.appendChild(input);

	if (state == "roaming") {
		let command = textbox.value.split(' ')[0].toLowerCase();
		let validCommand = choices.some(str => command.includes(str));
		if (validCommand) {
			// Movement commands
			if (options.some(str => command == str) && (command == choices[0] || command == choices[1] || command == choices[2] || command == choices[3] || command == choices[4] || command == choices[5])) {
				switch (command) {
					case 'foreward':
						if (roomList[pos].connectedRooms[0][0] == false) {
							response.textContent = "You move " + command;
							pos = roomList[pos].connectedRooms[0][1];
							moved = true;
						} else {
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
				speak(response.textContent); // Ensure TTS is called only once here
			}
			// Picking up an item
			else if (options.some(str => command == str) && (command == choices[6])) {
				let modifier = textbox.value.slice(textbox.value.toLowerCase().indexOf(command) + command.length).trim().toLowerCase();
				if (roomList[pos].variableList.some(i => objectList[i].text.toLowerCase() == modifier)) {
					if (objectList[roomList[pos].variableList.find(i => objectList[i].text.toLowerCase() == modifier)].character == 0) {
						response.textContent = 'You pick up the ' + modifier;
						itemIndex = objectList.findIndex(obj => obj.text.toLowerCase() == modifier);
						invSlot = inv.findIndex(i => i[0] == itemIndex);
						if(invSlot > -1){
							inv[invSlot][1] += 1;

						}
						else{
							inv.push([itemIndex, 1]);
						}
						roomList[pos].variableList.splice(roomList[pos].variableList.findIndex(obj => objectList[obj].text.toLowerCase() == modifier), 1);
						if(objectList[inv[inv.length-1][0]].variableList[1][1]){
							options.push('use');
						}
					} else {
						response.textContent = 'You cannot pick that up\n';
					}
				} else {
					response.textContent = 'That\'s not in this room';
				}
				responseBox.appendChild(response);
				speak(response.textContent); // Ensure TTS is called only once here
			}
			// Looking at an item
			else if (options.some(str => command == str) && (command == choices[7])) {
				let modifier = textbox.value.slice(textbox.value.toLowerCase().indexOf(command) + command.length).trim().toLowerCase();
				if (roomList[pos].variableList.some(i => objectList[i].text.toLowerCase() == modifier)) {
					response.textContent = 'You look at the ' + modifier + "\n";
					response.textContent += objectList[objectList.findIndex(obj => obj.text.toLowerCase() == modifier)].description;
				} else {
					response.textContent = 'That\'s not in this room.';
				}
				responseBox.appendChild(response);
				speak(response.textContent); // Ensure TTS is called only once here
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
				speak(response.textContent); // Ensure TTS is called only once here
			}
			else if (command == choices[9]) {
				if (inv.length == 0) {
					response.textContent = 'You don\'t have anything';
				} else {
					for (let i = 0; i < inv.length; i++) {
						if(inv[i][1] == 1){
							response.textContent += 'You have a ' + objectList[inv[i][0]].text.toLowerCase() + '\n';
						}
						else{
							response.textContent += 'You have ' + inv[i][1] + " " + objectList[inv[i][0]].text.toLowerCase() + '\n';
						}
					}
				}
				responseBox.appendChild(response);
				speak(response.textContent); // Ensure TTS is called only once here
			}
			else if(command == choices[10]){
				let string = textbox.value.replace(/^use\s*/,'');
				if(string.includes(' on ')){
					let filtered = string.split(' on ').map(substr => substr.trim());
					if(inv.some(i => objectList[i[0]].text.toLowerCase() == filtered[0])){
						let item = inv.findIndex(index => objectList[index[0]].text.toLowerCase() == filtered[0]);
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
						speak(response.textContent); // Ensure TTS is called only once here
					}
					else if(roomList[pos].variableList.some(i => objectList[i].text.toLowerCase() == filtered[0])){
						console.log("That's in the room");
					}
				}
				else{
					// use item on self by default
				}
			}
			else if(command == choices[11]){
				RoomDescriptions();
			}
			else if(command == choices[12]){
				let modifier = textbox.value.slice(textbox.value.toLowerCase().indexOf(command) + command.length).trim().toLowerCase();
				if(roomList[pos].variableList.some(i => objectList[i].text.toLowerCase() == modifier)){
					let index = roomList[pos].variableList.find(i => objectList[i].text.toLowerCase() == modifier);
					if(objectList[index].character == 2){
						response.textContent = 'What would you want to do?\n';
						response.textContent += '1.) Buy\n';
						response.textContent += '2.) Sell\n';
						response.textContent += '3.) Exit\n';
						state = "menu";
						shop = index;
						// Add TTS for interaction menu
						speak(response.textContent);
					}
				}
				else {
					response.textContent = "You can't do that.";
				}
				responseBox.appendChild(response);
				speak(response.textContent); // Ensure TTS is called only once here
			}
			else{
				response.textContent = "You can't do that\n";
				responseBox.appendChild(response);
				speak(response.textContent); // Ensure TTS is called only once here
			}
		}
		else if (textbox.value.includes('?')) {
			response.textContent += "Foreward: Move to the room in front.\n";
			response.textContent += "Back: Move to the room behind you.\n";
			response.textContent += "Left: Move to the room to the left.\n";
			response.textContent += "Right: Move to the room to the Right.\n";
			response.textContent += "Up: Move to the room above.\n";
			response.textContent += "Down: Move to the room below.\n";
			response.textContent += "take [Item Name]: pick up an item in the same room.\n";
			response.textContent += "Look at: Take a closer look at an item in the same room.\n";
			response.textContent += "Drop [Item Name]: drop an item in your inventory.\n";
			response.textContent += "Bag: look at items you hold.\n";
			response.textContent += "Use [Item Name]: use item if it is in your bag or in the room\n";
			response.textContent += "Use [Item Name] on [Direction]: use item if it is in your bag or in the room\n";
			response.textContent += "Interact [character]: Start talking with a character\n";
			response.textContent += "Desc: Give a description of the room\n";
			responseBox.appendChild(response);
			speak(response.textContent); // Ensure TTS is called only once here
		}
		else {
			response.textContent = "Sorry I don't understand type '?' for a list of commands";
			responseBox.appendChild(response);
			speak(response.textContent); // Ensure TTS is called only once here
		}

		history.appendChild(responseBox);

		if (moved) {
			RoomDescriptions();
		}
	}
	else if(state == "menu"){
		if(parseInt(textbox.value) == 3){
			state = "roaming";
			RoomDescriptions();
		}
		else if(parseInt(textbox.value) == 2){
			if(inv.length > 0){
				response.textContent = "Inventory to sell\n";
				for(let i = 0; i < inv.length; i++){
					response.textContent += i+1 + ".) " + inv[i][1] + " " + objectList[inv[i][0]].text + " for " + objectList[inv[i][0]].variableList[0][1] + "\n";
				}
				response.textContent += (inv.length+1) + ".) Exit\n";
				state = "selling";
			}
			else{
				response.textContent = "You have nothing to sell\n\n";
				response.textContent += 'What would you want to do?\n';
				response.textContent += '1.) Buy\n';
				response.textContent += '2.) Sell\n';
				response.textContent += '3.) Exit\n';
				state = "menu";
				speak(response.textContent); // Add TTS for sell options
			}
		}
		else if(parseInt(textbox.value) == 1){
			for(let i = 1; i <= objectList[shop].variableList.length; i++){
				response.textContent += i + ".) " + objectList[shop].variableList[i-1][1] + " " + objectList[objectList[shop].variableList[i-1][0]].text + " for " + objectList[objectList[shop].variableList[i-1][0]].variableList[0][1] + " each\n";
			}
			response.textContent += objectList[shop].variableList.length + 1 + ".) exit\n";
			state = "buying";
			speak(response.textContent); // Add TTS for buy options
		}
		else{
			response.textContent = "That's not an option enter a number from 1 to 3";
			speak(response.textContent); // Add TTS for invalid input
		}
		responseBox.appendChild(response);
		history.appendChild(responseBox);
	}
	else if(state == "buying"){
		if(parseInt(textbox.value) <= objectList[shop].variableList.length+1 && parseInt(textbox.value) >= 1){
			if(parseInt(textbox.value) == objectList[shop].variableList.length+1){
				state = "roaming";
				RoomDescriptions();
			}
			else{
				if(inv.length > 0){
					itemIndex = inv.findIndex(i => i[0] == objectList[shop].variableList[parseInt(textbox.value)-1][0]);
					if(itemIndex > -1){
						objectList[shop].variableList[parseInt(textbox.value)-1][1] -= 1;
						inv[itemIndex][1]+=1;
					}
					else{
						objectList[shop].variableList[parseInt(textbox.value)-1][1] -= 1;
						inv.push([objectList[shop].variableList[parseInt(textbox.value)-1][0], 1]);
					}
				}
				else{
					objectList[shop].variableList[parseInt(textbox.value)-1][1] -= 1;
					inv.push([objectList[shop].variableList[parseInt(textbox.value)-1][0], 1]);
				}
				if(objectList[shop].variableList[parseInt(textbox.value)-1][1] == 0){
					objectList[shop].variableList.splice(parseInt(textbox.value)-1, 1);
				}
				for(let i = 1; i <= objectList[shop].variableList.length; i++){
					response.textContent += i + ".) " + objectList[shop].variableList[i-1][1] + " " + objectList[objectList[shop].variableList[i-1][0]].text + " for " + objectList[objectList[shop].variableList[i-1][0]].variableList[0][1] + " each\n";
				}
				response.textContent += objectList[shop].variableList.length + 1 + ".) exit\n";
				speak(response.textContent); // Add TTS for updated buy options
			}
		}
		else{
			response.textContent = "That's not an option enter a number from 1 to " + (objectList[shop].variableList.length+1);
			speak(response.textContent); // Add TTS for invalid input
		}
		responseBox.appendChild(response);
		history.appendChild(responseBox);
	}
	else if(state == "selling"){
		if(parseInt(textbox.value) <= inv.length+1 && parseInt(textbox.value) >= 1){
			if(parseInt(textbox.value) == inv.length+1){
				state = "roaming";
				RoomDescriptions();
			}
			else{
				inv[parseInt(textbox.value)-1][1] -= 1;
				shopIndex = objectList[shop].variableList.findIndex(i => i[0] == inv[parseInt(textbox.value)-1][0]);
				if(shopIndex > -1){
					objectList[shop].variableList[shopIndex][1] += 1;
				}
				else{
					objectList[shop].variableList.push([inv[parseInt(textbox.value)-1][0], 1]);
				}
				if(inv[parseInt(textbox.value)-1][1] <= 0){
					inv.splice(parseInt(textbox.value)-1, 1);
				}
				response.textContent = "Inventory to sell\n";
				for(let i = 0; i < inv.length; i++){
					response.textContent += i+1 + ".) " + inv[i][1] + " " + objectList[inv[i][0]].text + " for " + objectList[inv[i][0]].variableList[0][1] + "\n";
				}
				response.textContent += (inv.length+1) + ".) Exit\n";
				state = "selling";
				speak(response.textContent); // Add TTS for updated sell options
			}
		}
		else{
			response.textContent = "That's not an option enter a number from 1 to " + (inv.length+1);
			speak(response.textContent); // Add TTS for invalid input
		}
		responseBox.appendChild(response);
		history.appendChild(responseBox);
	}
    history.scrollTop = history.scrollHeight;
    textbox.value = "";

    /****FIX THIS****/
    // Speaks the response but there is a bug to where it speaks last instead of it speaking first
    //speak(response.textContent);
    /****FIX THIS****/
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
	if((room.connectedRooms.some(room => room[1] > -1 && room[0] == false))){
		mvmnt.textContent += "You can move ";
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
	}
	// adds lock paths to description of room
	if(room.connectedRooms[0][0] || room.connectedRooms[1][0] || room.connectedRooms[2][0] || room.connectedRooms[3][0] || room.connectedRooms[4][0] || room.connectedRooms[5][0]){
		if (room.connectedRooms[0][1] > -1 && room.connectedRooms[0][0] == true) {
			lockedPaths.textContent += "The path forewards is locked\n";
			options.push("foreward");
		}
		if (room.connectedRooms[1][1] > -1 && room.connectedRooms[1][0] == true) {
			lockedPaths.textContent += "The path back is locked\n";
			options.push("back");
		}
		if (room.connectedRooms[2][1] > -1 && room.connectedRooms[2][0] == true) {
			lockedPaths.textContent += "The path to the left is locked\n";
			options.push("left");
		}
		if (room.connectedRooms[3][1] > -1 && room.connectedRooms[3][0] == true) {
			lockedPaths.textContent += "The path to the right us locked\n";
			options.push("right");
		}
		if (room.connectedRooms[4][1] > -1 && room.connectedRooms[4][0] == true) {
			lockedPaths.textContent += "The path up is locked\n";
			options.push("up");
		}
		if (room.connectedRooms[5][1] > -1 && room.connectedRooms[5][0] == true) {
			lockedPaths.textContent += "The path down is locked\n";
			options.push("down");
		}
		responseBox.appendChild(lockedPaths);
	}
	// lists off objects in the room
	if (roomList[pos].variableList.some(obj => objectList[obj].character == 0)) {
		const item = document.createElement('li');
		item.textContent = "You can see";
		roomList[pos].variableList.forEach(obj => {
			if(objectList[obj].character == 0){
				item.textContent += " a " + objectList[obj].text;
				responseBox.appendChild(item);
			}
		});
		options.push('take');
		options.push('look at');
	} else {
		const item = document.createElement('li');
		item.textContent = "You don't see anything else.";
		responseBox.appendChild(item);
	}

	if(roomList[pos].variableList.some(obj => objectList[obj].character == 2)){
		const characters = document.createElement('li');
		characters.textContent = "You can talk to ";
		roomList[pos].variableList.forEach(obj => {
			if(objectList[obj].character == 2){
				characters.textContent += " " + objectList[obj].text;
				responseBox.appendChild(characters);
			}
		});
		options.push('interact');
		// Add TTS for characters
		speak(characters.textContent);
	}

	if(inv.some(i => objectList[i[0]].variableList[1][1])){
		options.push('use');
	}

	options.push('desc');
	history.appendChild(responseBox);

    // Speak the room description
    let combinedText = descEle.textContent + " " + mvmnt.textContent + " " + lockedPaths.textContent + " ";
    responseBox.querySelectorAll('li').forEach(item => {
        combinedText += item.textContent + " ";
    });
    speak(combinedText);
}
`;
}

function getDemoCSS() {
    return `
    html, body{
    display: flex; /*Sets everything to flex*/
    flex-direction: column; /*everything will align ontop of eachother*/
    margin: 0; /*no margin*/
    height: 100%; /*full height of window*/
}
.topNavigation{
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    flex-direction: row;
    align-items: center;
    justify-content: right;
    background-color: aliceblue;
    width: 100%;
    height: 5%;
    padding: 0;
    gap: 120px;
}
.topNavigation h1{
    height: 100%;
    width: 80%;
    display: flex;
    align-items: center;
    justify-content: left;
    overflow: visible;
    padding-left: 2%;
    
}
.topNavigation p{
    height: 100%;
    width: 10%;
    margin: 0%;
    padding: 0%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    
}
.login{
    display: flex;
    float: right;
    height: 75%;
    width: 10%;
    margin-right: 2%;
    align-items: center;
    justify-content: center;
    background-color: grey;
    border-radius: 5px;
    color: white;
}
.login:hover{
    background-color: #aaaaaa;
}

.gameBox{
    display: flex;
    position: fixed;
    flex-direction: column;
    align-items: center;
    top: 5%;
    width: 100%;
    height: 95%;
    background-color: lightslategrey;
}

.gameBox p{
    width: 95%;
    height: 80%;
    background-color: rgb(100, 136, 153);
    margin: 0;
    padding: 0;
    overflow: scroll;
}

.container{
    margin: 0;
    padding: 5px;
    overflow: scroll;
}

.txtBox{
    width: 80%;
    height: 100%;
    margin: 0;
    padding: 0;
}

.submit{
    width: 20%;
    height: 100%;
    margin: 0;
    padding: 0;
}

.playerInput{
    display: flex;
    width: 95%;
    height: 10%;
    margin: 0;
    padding: 0;
    align-items: center;
    justify-content: center;
}
/* Fix the TTS Toggle Button 
#ttsToggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 4px 8px;
    font-size: 12px;
    background-color: gray;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    border: none;
    width: fit-content;
    height: auto;
    text-align: center;
    display: inline-block;
    white-space: nowrap;
}
#ttsToggle:hover {
    background-color: #555;
}


/* Highlight selected element 
.selected {
    background-color: yellow !important;
    color: black !important;
}
*/
}
`;
}

function getDemohtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="demo.css">
    <script src="demo.js" defer></script>
    <title>demoPage</title>
</head>
<body>
    <div class="topNavigation">
        <h1>Text Adventure Creator</h1>
        <p>?</p>
        <a href="login.html" class="login">Login</a>
        <button id="ttsToggle">Text To Speech Disabled</button>
    </div>
    <div class="gameBox">
        <h1 id="prjtName">demo</h1>
        <p id="history"></p>
        <div class="playerInput">
            <input class="txtBox" id="txtBox" type="text" placeholder="Type here..." onkeydown="if(event.key === 'Enter'){submitAction()}">
            <input class="submit" type="button" value="Submit" onclick="submitAction()">
        </div>
    </div>
</body>
</html>
    
}
`;
}

function getStyle(gameData){
	return `
	/* General layout and body styling */
html, body {
    display: flex; /* Sets everything to flex */
    flex-direction: column; /* Everything will align on top of each other */
    margin: 0; /* No margin */
    height: 100%; /* Full height of window */
}

/* Main content area */
.mainContent {
    background-color: white; /* Change color as needed */
    width: 80%; /* Takes up 4/5 of the width */
    height: 90%; /* Fills the full height of the viewport */
    position: absolute; /* Positioning to fill the viewport */
    top: 5%; /* Spacing to allow for top */
    right: 0; /* Aligns to the left side */
    display: flex;
    flex-direction: column;
    justify-content: left;
    align-items: center;
    color: white;
    font-size: 24px;
}

/* Object viewer section */
.objectViewer {
    background-color: grey; /* Change color as needed */
    width: 20%; /* Takes up 1/5 of the width */
    height: 90%; /* Fills 90% of the viewport */
    position: absolute; /* Positioning to fill the viewport */
    display: flex;
    top: 5%; /* Spacing to allow for top */
    flex-direction: column;
    justify-content: left;
    align-items: column;
    color: white;
    font-size: 24px;
}

/* Top navigation bar */
.topNavigation {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    flex-direction: row;
    align-items: center;
    background-color: aliceblue;
    width: 100%;
    height: 5%;
    padding: 0;
    gap: 120px;
}

.topNavigation h1 {
    height: 100%;
    align-items: center;
    justify-content: center;
    margin-right: 30%;
}

/* Login button styling */
.login {
    display: flex;
    float: right;
    height: 75%;
    width: 10%;
    align-items: center;
    justify-content: center;
    background-color: grey;
    border-radius: 5px;
    color: white;
}

.login:hover {
    background-color: #aaaaaa;
}

/* Object list styling */
.objectList {
    display: flex;
    flex-direction: column;
    color: black;
    overflow: scroll;
}

.objectList li {
    display: flex;
    width: 100%;
    align-items: left;
    justify-content: left;
}

.objectList li.selected {
    background-color: rgb(184, 184, 184);
}

.objectList li:hover {
    display: flex;
    background-color: rgb(184, 184, 184);
    width: 100%;
}

/* Object details section */
.objectDetails {
    top: 0%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: left;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 5%;
}

.objectDetails li {
    top: 0%;
    float: left;
    color: black;
    background-color: beige;
    border-radius: 5px 5px 0px 0px;
    border-style: solid;
    border-color: rgb(0, 0, 0);
    border-width: 1px;
    text-align: center;
    align-items: center;
    justify-content: center;
    display: flex;
    height: 100%;
    width: 15%;
}

.objectDetails li:hover {
    background-color: blanchedalmond;
}

.objectDetails li.tabbed {
    background-color: blanchedalmond;
}

/* Variable list styling */
.variableList {
    display: flex;
    flex-direction: column;
    justify-content: left;
    padding: 20px;
    margin: 0%;
    overflow: scroll;
}

.variableList li {
    display: flex;
    align-items: center;
    justify-content: left;
    width: 100%;
    padding: 0%;
    margin: 0%;
}

.variableList p {
    color: black;
}

.variableList ul {
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 0;
    margin: 0;
}

/* Detail window styling */
.detailWindow {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: lightslategrey;
}

.detailWindow li {
    display: flex;
    align-items: right;
    justify-content: left;
    gap: 10px;
    width: 50%;
    height: fit-content;
}

.detailWindow input {
    float: right;
}

.addVariableButton {
    width: 10%;
}

/* Editor buttons styling */
.editorButtons {
    position: fixed;
    bottom: 0;
    list-style-type: none;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin: 0;
    padding: 0;
    overflow: hidden;
    width: 100%;
    height: 5%;
}

.editorButtons li {
    float: left;
    text-align: center;
    align-items: center;
    justify-content: center;
    display: flex;
    height: 100%;
    width: 10%;
    padding: 1%;
    bottom: 0;
    border-radius: 0px 0px 5px 5px;
    border-style: solid;
    border-color: rgb(0, 0, 0);
    border-width: 1px;
    background-color: beige;
}

.editorButtons li.right {
    float: right;
    display: flex;
    padding: 1%;
    height: 100%;
    bottom: 0;
}

.editorButtons li:hover {
    background-color: blanchedalmond;
}

/* TTS button styling */
.tts-button {
    position: absolute;
    top: 10px; /* Distance from the top */
    right: 20px; /* Distance from the right */
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    font-size: 1em;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
    z-index: 100; /* Ensure it's above other elements */
}

.tts-button:hover {
    background-color: #0056b3;
}

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