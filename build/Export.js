import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, auth } from './firebase.js';
import JSZip from 'https://cdn.skypack.dev/jszip';
import FileSaver from 'https://cdn.skypack.dev/file-saver';


export async function handleExportGame(event) {
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

function getDemohtml(gamedata){
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="demo.css">
    <script src="demo.js" defer></script>
    <title>Text Adventure Creator</title>
</head>
<body>
    <header class="topNavigation">
        <h1>Text Adventure Creator</h1>
        <p class="help">?</p>
        <a href="login.html" class="login">Login</a>
        <button id="ttsToggle">Text To Speech Disabled</button>
    </header>
    <main class="gameBox">
        <h1 id="prjtName">demo</h1>
        <section id="history" class="history"></section>
        <div class="playerInput">
            <input class="txtBox" id="txtBox" type="text" placeholder="Type here..." onkeydown="if(event.key === 'Enter'){submitAction()}">
            <input class="submit" type="button" value="Submit" onclick="submitAction()">
        </div>
    </main>
</body>
</html>

`;
}

function getStyle(gamedata){
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
    flex: 1;
    background-color: white;
    color: #1a1a1a;
    padding: 20px;
    overflow-y: auto;
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
    background-color: white;
    color: #1a1a1a;
    padding: 20px;
    border-right: 1px solid #ccc;
    overflow-y: auto;
}

.objectViewer h1 {
    font-size: 1.2em;
    margin-bottom: 15px;
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
    justify-content: space-between;
    padding: 10px 20px;
    background-color: #30475e; /* Navy/steel accent */
    color: white;
    z-index: 10;
}

.topNavigation h1 {
    height: 100%;
    align-items: center;
    justify-content: center;
    margin-right: 30%;
    font-size: 1.5em;
    font-weight: 700;
}

.topNavigation .login {
    display: flex;
    float: right;
    height: 75%;
    width: 10%;
    align-items: center;
    justify-content: center;
    background-color: grey;
    border-radius: 5px;
    color: white;
    padding: 8px 15px;
    font-size: 1em;
    font-weight: 700;
    background-color: #f9a826; /* Bright orange */
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: background-color 0.3s;
}

.topNavigation .login:hover {
    background-color: #aaaaaa;
    background-color: #e08e1f; /* Slightly darker orange */
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
    list-style: none;
    padding: 0;
    margin: 0;
}

.objectList li {
    display: flex;
    width: 100%;
    align-items: left;
    justify-content: left;
    padding: 10px;
    margin-bottom: 10px;
    background-color: #f0f4f8;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.objectList li.selected {
    background-color: rgb(184, 184, 184);
    background-color: #30ae69; /* Green for selected */
    color: white;
}

.objectList li:hover {
    display: flex;
    background-color: rgb(184, 184, 184);
    width: 100%;
    background-color: #e8e8e8;
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
    justify-content: space-around;
    margin-bottom: 20px;
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
    padding: 10px 20px;
    font-size: 1em;
    font-weight: 700;
    color: #1a1a1a;
    background-color: #f0f4f8;
    cursor: pointer;
    transition: background-color 0.3s;
}

.objectDetails li:hover {
    background-color: blanchedalmond;
    background-color: #e8e8e8;
}

.objectDetails li.tabbed {
    background-color: blanchedalmond;
    background-color: #30ae69; /* Green for active tab */
    color: white;
}

/* Variable list styling */
.variableList {
    display: flex;
    flex-direction: column;
    justify-content: left;
    padding: 20px;
    margin: 0%;
    overflow: scroll;
    list-style: none;
    padding: 0;
    margin: 0;
}

.variableList li {
    display: flex;
    align-items: center;
    justify-content: left;
    width: 100%;
    padding: 0%;
    margin: 0%;
    padding: 10px;
    margin-bottom: 10px;
    background-color: #f0f4f8;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.variableList li:hover {
    background-color: #e8e8e8;
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
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
    height: 60px; /* Adjusted height for better appearance */
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: #30475e; /* Navy/steel accent */
    color: white;
    z-index: 10;
}

.editorButtons li {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px; /* Adjusted height for button size */
    width: auto;
    padding: 0 15px; /* Adjusted padding for better spacing */
    font-size: 1rem; /* Adjusted font size */
    font-weight: bold;
    background-color: #f9a826; /* Bright orange */
    border: 2px solid #e08e1f; /* Slightly darker orange border */
    border-radius: 8px; /* Rounded corners */
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

.editorButtons li.right {
    float: right;
    display: flex;
    padding: 1%;
    height: 100%;
    bottom: 0;
}

.editorButtons li:hover {
    background-color: #e08e1f; /* Slightly darker orange on hover */
    transform: translateY(-2px); /* Lift effect on hover */
}

.editorButtons li:active {
    transform: translateY(0); /* Reset lift effect on click */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Reduced shadow on click */
}

/* TTS button styling */
.tts-button {
    position: absolute;
    top: 10px; /* Distance from the top */
    right: 20px; /* Distance from the right */
    background-color: #f9a826; /* Bright orange */
    color: white;
    border: 2px solid #e08e1f; /* Slightly darker orange border */
    border-radius: 8px; /* Rounded corners */
    padding: 10px 20px;
    font-size: 1em;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
    z-index: 100; /* Ensure it's above other elements */
}

.tts-button:hover {
    background-color: #e08e1f; /* Slightly darker orange on hover */
}

/* Layout Sections */
.layout {
    display: flex;
    flex: 1;
    margin-top: 60px; /* Space for the header */
}

/* TTS Toggle Button */
.tts-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #f9a826; /* Bright orange */
    color: white;
    border: none; /* Ensure no border is present */
    border-radius: 8px; /* Rounded corners */
    padding: 0 15px; /* Match button size */
    font-size: 1rem; /* Match font size */
    cursor: pointer;
    font-weight: bold;
    height: 40px; /* Match button height */
    box-shadow: none; /* Remove any shadow to eliminate the orange box */
    transition: background-color 0.3s; /* Smooth hover effect */
}

.tts-toggle:hover {
    background-color: #e08e1f; /* Slightly darker orange on hover */
    transform: none; /* Remove lift effect */
}

.tts-toggle:active {
    background-color: #d17a1a; /* Slightly darker orange on click */
    transform: none; /* No lift effect */
    box-shadow: none; /* Ensure no shadow appears on click */
}

.navButtons {
    display: flex;
    align-items: center;
    gap: 10px; /* Space between login and TTS button */
}

`;    
}

function getDemoJS(gameData) {
    return `
const roomList = ${JSON.stringify(gameData.rooms)};
const objectList = ${JSON.stringify(gameData.objects)};
const choices = ['left', 'right', 'foreward', 'back', 'up', 'down', 'take', 'look at', 'drop', 'bag', 'use', 'desc', 'interact'];
const inv = [];
var options = [];
const history = document.getElementById('history');
const textbox = document.getElementById('txtBox');
var pos = 0;
var state = "roaming";
var shop = -1;
let ttsEnabled = false; // TTS toggle state

window.onload = function(){
	history.appendChild(RoomDescriptions());
}

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
    const elements = document.querySelectorAll("#history li.HistLine");
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

    input.classList.add("HistLine");
	response.classList.add("HistLine");

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
							response.textContent = "You move " + command + "\\n\\n";
							pos = roomList[pos].connectedRooms[0][1];
							moved = true;
						} else {
							response.textContent = "That path is blocked";
						}
						break;
					case 'back':
						if(roomList[pos].connectedRooms[1][0] == false){
							response.textContent = "You move " + command + "\\n\\n";
							pos = roomList[pos].connectedRooms[1][1];
							moved = true;
						}
						else{
							response.textContent = "That path is blocked";
						}
						break;
					case 'left':
						if(roomList[pos].connectedRooms[2][0] == false){
							response.textContent = "You move " + command + "\\n\\n";
							pos = roomList[pos].connectedRooms[2][1];
							moved = true;
						}
						else{
							response.textContent = "That path is blocked";
						}
						break;
					case 'right':
						if(roomList[pos].connectedRooms[3][0] == false){
							response.textContent = "You move " + command + "\\n\\n";
							pos = roomList[pos].connectedRooms[3][1];
							moved = true;
						}
						else{
							response.textContent = "That path is blocked";
						}
						break;
					case 'up':
						if(roomList[pos].connectedRooms[4][0] == false){
							response.textContent = "You move " + command + "\\n\\n";
							pos = roomList[pos].connectedRooms[4][1];
							moved = true;
						}
						else{
							response.textContent = "That path is blocked";
						}
						break;
					case 'down':
						if(roomList[pos].connectedRooms[5][0] == false){
							response.textContent = "You move " + command + "\\n\\n";
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
						response.textContent = 'You cannot pick that up\\n';
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
					response.textContent = 'You look at the ' + modifier + "\\n";
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
							response.textContent += 'You have a ' + objectList[inv[i][0]].text.toLowerCase() + '\\n';
						}
						else{
							response.textContent += 'You have ' + inv[i][1] + " " + objectList[inv[i][0]].text.toLowerCase() + '\\n';
						}
					}
				}
				responseBox.appendChild(response);
				speak(response.textContent); // Ensure TTS is called only once here
			}
			else if(command == choices[10]){
				let string = textbox.value.replace(/^use\\s*/,'');
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
				responseBox.appendChild(RoomDescriptions());
			}
			else if(command == choices[12]){
				let modifier = textbox.value.slice(textbox.value.toLowerCase().indexOf(command) + command.length).trim().toLowerCase();
				if(roomList[pos].variableList.some(i => objectList[i].text.toLowerCase() == modifier)){
					let index = roomList[pos].variableList.find(i => objectList[i].text.toLowerCase() == modifier);
					if(objectList[index].character == 2){
						response.textContent = 'What would you want to do?\\n';
						response.textContent += '1.) Buy\\n';
						response.textContent += '2.) Sell\\n';
						response.textContent += '3.) Exit\\n';
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
				response.textContent = "You can't do that\\n";
				responseBox.appendChild(response);
				speak(response.textContent); // Ensure TTS is called only once here
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
			response.textContent += "Interact [character]: Start talking with a character\\n";
			response.textContent += "Desc: Give a description of the room\\n";
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
			responseBox.appendChild(RoomDescriptions());
		}
	}
	else if(state == "menu"){
		if(parseInt(textbox.value) == 3){
			state = "roaming";
			responseBox.appendChild(RoomDescriptions());
		}
		else if(parseInt(textbox.value) == 2){
			if(inv.length > 0){
				response.textContent = "Inventory to sell\\n";
				for(let i = 0; i < inv.length; i++){
					response.textContent += i+1 + ".) " + inv[i][1] + " " + objectList[inv[i][0]].text + " for " + objectList[inv[i][0]].variableList[0][1] + "\\n";
				}
				response.textContent += (inv.length+1) + ".) Exit\\n";
				state = "selling";
			}
			else{
				response.textContent = "You have nothing to sell\\n\\n";
				response.textContent += 'What would you want to do?\\n';
				response.textContent += '1.) Buy\\n';
				response.textContent += '2.) Sell\\n';
				response.textContent += '3.) Exit\\n';
				state = "menu";
				speak(response.textContent); // Add TTS for sell options
			}
		}
		else if(parseInt(textbox.value) == 1){
			for(let i = 1; i <= objectList[shop].variableList.length; i++){
				response.textContent += i + ".) " + objectList[shop].variableList[i-1][1] + " " + objectList[objectList[shop].variableList[i-1][0]].text + " for " + objectList[objectList[shop].variableList[i-1][0]].variableList[0][1] + " each\\n";
			}
			response.textContent += objectList[shop].variableList.length + 1 + ".) exit\\n";
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
				responseBox.appendChild(RoomDescriptions());
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
					response.textContent += i + ".) " + objectList[shop].variableList[i-1][1] + " " + objectList[objectList[shop].variableList[i-1][0]].text + " for " + objectList[objectList[shop].variableList[i-1][0]].variableList[0][1] + " each\\n";
				}
				response.textContent += objectList[shop].variableList.length + 1 + ".) exit\\n";
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
				responseBox.appendChild(RoomDescriptions());
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
				response.textContent = "Inventory to sell\\n";
				for(let i = 0; i < inv.length; i++){
					response.textContent += i+1 + ".) " + inv[i][1] + " " + objectList[inv[i][0]].text + " for " + objectList[inv[i][0]].variableList[0][1] + "\\n";
				}
				response.textContent += (inv.length+1) + ".) Exit\\n";
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

    descEle.classList.add("HistLine");
	mvmnt.classList.add("HistLine");
	lockedPaths.classList.add("HistLine");

	//responseBox.className = "container";

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
	}
	// lists off objects in the room
	if (roomList[pos].variableList.some(obj => objectList[obj].character == 0)) {
		const item = document.createElement('li');
        item.classList.add("HistLine");
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
        item.classList.add("HistLine");
		item.textContent = "You don't see anything else.";
		responseBox.appendChild(item);
	}

	if(roomList[pos].variableList.some(obj => objectList[obj].character == 2)){
		const characters = document.createElement('li');
        characters.classList.add("HistLine");
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

    // Speak the room description
    let combinedText = descEle.textContent + " " + mvmnt.textContent + " " + lockedPaths.textContent + " ";
    responseBox.querySelectorAll('li').forEach(item => {
        combinedText += item.textContent + " ";
    });
    speak(combinedText);

	return responseBox;
}
`;
}


function getDemoCSS() {
    return `
html, body {
    display: flex;
    flex-direction: column;
    margin: 0;
    height: 100%;
    font-family: Arial, sans-serif;
    background-color: #f0f4f8; /* Light gray-blue background */
    color: #555; /* Body text color */
}

.topNavigation {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background-color: #30475e; /* Navy/steel accent */
    width: 100%;
    height: 60px;
    padding: 0 20px;
    color: white;
}

.topNavigation h1 {
    font-size: 1.5rem;
    font-weight: bold;
    color: white; /* Changed from bright orange to white */
    margin: 0;
}

.topNavigation .help {
    font-size: 1.2rem;
    margin: 0;
    cursor: pointer;
}

.login {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #30ae69; /* Green CTA button */
    color: white;
    padding: 8px 16px;
    border-radius: 5px;
    text-decoration: none;
    font-weight: bold;
}

.login:hover {
    background-color: #28a05c;
}

#ttsToggle {
    background-color: #f9a826; /* Bright orange CTA button */
    color: white;
    border: none;
    border-radius: 5px;
    padding: 8px 16px;
    cursor: pointer;
    font-weight: bold;
}

#ttsToggle:hover {
    background-color: #e08e1c;
}

.gameBox {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 60px; /* Offset for fixed header */
    width: 100%;
    height: calc(100% - 60px);
    background-color: #f0f4f8; /* Light gray-blue background */
    padding: 20px;
    box-sizing: border-box;
}

.gameBox h1 {
    font-size: 2rem;
    font-weight: bold;
    color: #1a1a1a; /* Title text color */
    margin-bottom: 20px;
}

.history {
    width: 100%;
    height: 70%;
    background-color: #ffffff; /* White background for history */
    border: 1px solid #ccc;
    border-radius: 5px;
    overflow-y: auto;
    padding: 10px;
    box-sizing: border-box;
}

.playerInput {
    display: flex;
    width: 100%;
    margin-top: 20px;
}

.txtBox {
    flex: 1;
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px 0 0 5px;
    box-sizing: border-box;
}

.submit {
    background-color: #30ae69; /* Green CTA button */
    color: white;
    border: none;
    border-radius: 0 5px 5px 0;
    padding: 10px 20px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: bold;
}

.submit:hover {
    background-color: #28a05c;
}
`;
}