const roomList = JSON.parse(localStorage.getItem('Rooms'));
const objectList = JSON.parse(localStorage.getItem('Objs'));
const choices = ['left', 'right', 'foreward', 'back', 'up', 'down', 'take', 'look at', 'drop', 'bag'];
const inv = [];
var options = [];
const history = document.getElementById('history');
const textbox = document.getElementById('txtBox');
var pos = 0;
let ttsEnabled = false; // TTS toggle state

window.onload = RoomDescriptions();

// Toggle TTS functionality
function toggleTTS() {
    ttsEnabled = !ttsEnabled;
    const msg = new SpeechSynthesisUtterance();
    msg.text = ttsEnabled ? "TTS enabled" : "TTS disabled";
    speechSynthesis.speak(msg);
}

// Add hover TTS to an element
function addHoverTTS(element) {
    element.addEventListener("mouseenter", () => {
        if (ttsEnabled) {
            const msg = new SpeechSynthesisUtterance(element.textContent.trim());
            speechSynthesis.cancel(); // Stop any ongoing speech
            speechSynthesis.speak(msg);
        }
    });
}

// Clear and reapply hover TTS to all elements in a container
function applyHoverTTS(containerSelector) {
    const elements = document.querySelectorAll(containerSelector + " li");
    elements.forEach(element => {
        element.removeEventListener("mouseenter", () => {}); // Clear previous listeners
        addHoverTTS(element);
    });
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

    let command = choices.find(str => textbox.value.toLowerCase().includes(str));

    if (command) {
        // Movement commands
        if (options.some(str => command == str) && (command == choices[0] || command == choices[1] || command == choices[2] || command == choices[3] || command == choices[4] || command == choices[5])) {
            response.textContent = "You move " + command;
            responseBox.appendChild(response);
            switch (command) {
                case 'foreward':
                    pos = roomList[pos].connectedRooms[0];
                    break;
                case 'back':
                    pos = roomList[pos].connectedRooms[1];
                    break;
                case 'left':
                    pos = roomList[pos].connectedRooms[2];
                    break;
                case 'right':
                    pos = roomList[pos].connectedRooms[3];
                    break;
                case 'up':
                    pos = roomList[pos].connectedRooms[4];
                    break;
                case 'down':
                    pos = roomList[pos].connectedRooms[5];
                    break;
            }
            moved = true;
        }
        // Picking up an item
        else if (options.some(str => command == str) && (command == choices[6])) {
            let modifier = textbox.value.slice(textbox.value.toLowerCase().indexOf(command) + command.length).trim().toLowerCase();
            if (roomList[pos].variableList.some(i => objectList[i].text.toLowerCase() == modifier)) {
                response.textContent = 'You pick up the ' + modifier;
                inv.push(objectList.findIndex(obj => obj.text.toLowerCase() == modifier));
                roomList[pos].variableList.splice(roomList[pos].variableList.findIndex(obj => objectList[obj].text.toLowerCase() == modifier), 1);
            } else {
                response.textContent = 'That\'s not in this room';
            }
            responseBox.appendChild(response);
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
                    response.textContent += 'You have a ' + objectList[inv[i]].text.toLowerCase() + '\n';
                }
            }
            responseBox.appendChild(response);
        }
        else {
            response.textContent = "You can't do that.";
            responseBox.appendChild(response);
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
        response.textContent += "Bag: look at items you hold.";
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

    applyHoverTTS("#history"); // Apply hover functionality to new content
}

function RoomDescriptions() {
    options = [];
    const room = roomList[pos];
    const desc = room.description;
    const responseBox = document.createElement('li');
    const descEle = document.createElement('li');
    const mvmnt = document.createElement('li');

    responseBox.className = "container";

    if (desc.trim().length === 0) {
        descEle.textContent = "You are in a room";
    } else {
        descEle.textContent = desc;
    }
    responseBox.appendChild(descEle);

    mvmnt.textContent += "You can move";
    if (room.connectedRooms[0] > -1) {
        mvmnt.textContent += " foreward";
        options.push("foreward");
    }
    if (room.connectedRooms[1] > -1) {
        mvmnt.textContent += " back";
        options.push("back");
    }
    if (room.connectedRooms[2] > -1) {
        mvmnt.textContent += " left";
        options.push("left");
    }
    if (room.connectedRooms[3] > -1) {
        mvmnt.textContent += " right";
        options.push("right");
    }
    if (room.connectedRooms[4] > -1) {
        mvmnt.textContent += " up";
        options.push("up");
    }
    if (room.connectedRooms[5] > -1) {
        mvmnt.textContent += " down";
        options.push("down");
    }

    responseBox.appendChild(mvmnt);

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

    history.appendChild(responseBox);
    applyHoverTTS("#history"); // Ensure hover functionality is applied to room descriptions
}
