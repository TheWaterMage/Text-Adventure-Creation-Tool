const roomList = JSON.parse(localStorage.getItem('Rooms'));
const objectList = JSON.parse(localStorage.getItem('Objs'));
const choices = ['left', 'right', 'foreward', 'back', 'up', 'down', 'take', 'look', 'drop', 'bag', 'use', 'desc', 'interact'];
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
    })
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
							response.textContent = "You move " + command + "\n\n";
							pos = roomList[pos].connectedRooms[0][1];
							moved = true;
						} else {
							response.textContent = "That path is blocked";
						}
						break;
					case 'back':
						if(roomList[pos].connectedRooms[1][0] == false){
							response.textContent = "You move " + command + "\n\n";
							pos = roomList[pos].connectedRooms[1][1];
							moved = true;
						}
						else{
							response.textContent = "That path is blocked";
						}
						break;
					case 'left':
						if(roomList[pos].connectedRooms[2][0] == false){
							response.textContent = "You move " + command + "\n\n";
							pos = roomList[pos].connectedRooms[2][1];
							moved = true;
						}
						else{
							response.textContent = "That path is blocked";
						}
						break;
					case 'right':
						if(roomList[pos].connectedRooms[3][0] == false){
							response.textContent = "You move " + command + "\n\n";
							pos = roomList[pos].connectedRooms[3][1];
							moved = true;
						}
						else{
							response.textContent = "That path is blocked";
						}
						break;
					case 'up':
						if(roomList[pos].connectedRooms[4][0] == false){
							response.textContent = "You move " + command + "\n\n";
							pos = roomList[pos].connectedRooms[4][1];
							moved = true;
						}
						else{
							response.textContent = "That path is blocked";
						}
						break;
					case 'down':
						if(roomList[pos].connectedRooms[5][0] == false){
							response.textContent = "You move " + command + "\n\n";
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
				if (roomList[pos].variableList.some(i => objectList[i].text.toLowerCase() == modifier) || inv.some(i => objectList[i[0]].text.toLowerCase() == modifier)) {
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
				if (inv.some(i => objectList[i[0]].text.toLowerCase() == modifier)) {
					response.textContent = 'You drop the ' + modifier;
					index = inv.findIndex(obj => objectList[obj[0]].text.toLowerCase() == modifier);
					if(inv[index][1] > 1){
						inv[index][1] -= 1;
					}
					else{
						inv.splice(index, 1);
					}
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
						if(objectList[inv[item][0]].variableList[1][1]){
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
				desc = RoomDescriptions();
				responseBox.appendChild(desc);
				speak(desc.textContent)
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
			response.textContent += "look: Take a closer look at an item in the same room.\n";
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
	if (roomList[pos].variableList.some(obj => objectList[obj].character == 0 || objectList[obj].character == 1)) {
		const item = document.createElement('li');
		item.classList.add("HistLine");
		item.textContent = "You can see";
		roomList[pos].variableList.forEach(obj => {
			if(objectList[obj].character == 0 || objectList[obj].character == 1){
				item.textContent += " a " + objectList[obj].text;
				responseBox.appendChild(item);
			}
		});
		options.push('take');
		options.push('look');
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
		options.push('look');
	}

	options.push('desc');

	return responseBox;
}

