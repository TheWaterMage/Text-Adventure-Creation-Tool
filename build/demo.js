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

function submitAction() {
    const responseBox = document.createElement('li');
    const input = document.createElement('li');
    const response = document.createElement('li');
    let moved = false;

    response.style.whiteSpace = "pre-wrap";
    responseBox.className = "container";

    input.textContent = '> ' + textbox.value;
    responseBox.appendChild(input);
    if(state == "roaming"){
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
            else if(command == choices[10]){
                let string = textbox.value.replace(/^use\s*/,'');
                if(string.includes(' on ')){
                    let filtered = string.split(' on ').map(substr => substr.trim());
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
                        if(objectList[index].variableList.length > 0){
                            response.textContent = modifier + ' is Selling\n';
                            for(let i = 1; i <= objectList[index].variableList.length; i++){
                                response.textContent += i + ".) " + objectList[index].variableList[i-1][1] + " " + objectList[objectList[index].variableList[i-1][0]].text + " for " + objectList[objectList[index].variableList[i-1][0]].variableList[0][1] + " each\n";
                            }
                            response.textContent += objectList[index].variableList.length + 1 + ".) exit\n";
                            state = "shopping";
                            shop = index;
                        }
                    }
                    else{
                        response.textContent = 'You cannot pick that up\n';
                    }
                }
                else{
                    response.textContent = 'That\'s not in this room';
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
            response.textContent += "Bag: look at items you hold.\n";
            response.textContent += "Use [Item Name]: use item if it is in your bag or in the room\n";
            response.textContent += "Use [Item Name] on [Direction]: use item if it is in your bag or in the room\n";
            response.textContent += "Interact [character]: Start talking with a character\n";
            response.textContent += "Desc: Give a description of the room\n";
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
    }
    else if(state == "shopping"){
        if(parseInt(textbox.value) <= objectList[shop].variableList.length+1 && parseInt(textbox.value) >= 1){
            if(parseInt(textbox.value) == objectList[shop].variableList.length+1){
                state = "roaming";
            }
            else{
                objectList[shop].variableList[parseInt(textbox.value)-1][1] -= 1;
                if(objectList[shop].variableList[parseInt(textbox.value)-1][1] == 0){
                    inv.push(objectList[shop].variableList[parseInt(textbox.value)-1][0]);
                    objectList[shop].variableList.splice(parseInt(textbox.value)-1, 1);
                }
                for(let i = 1; i <= objectList[shop].variableList.length; i++){
                    response.textContent += i + ".) " + objectList[shop].variableList[i-1][1] + " " + objectList[objectList[shop].variableList[i-1][0]].text + " for " + objectList[objectList[shop].variableList[i-1][0]].variableList[0][1] + " each\n";
                }
                response.textContent += objectList[shop].variableList.length + 1 + ".) exit\n";
            }
        }
        else{
            response.textContent = "That's not an option enter a number from 1 to " + (objectList[shop].variableList.length+1);
        }
        responseBox.appendChild(response);
        history.appendChild(responseBox);
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
        mvmnt.textContent += "You can move " + room.connectedRooms.some(room => room[0] == false);
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

    if(roomList[pos].variableList.some(obj => objectList[obj].character == 0)){
        const characters = document.createElement('li');
        characters.textContent = "You can talk to ";
        roomList[pos].variableList.forEach(obj => {
            if(objectList[obj].character == 2){
                characters.textContent += " " + objectList[obj].text;
                responseBox.appendChild(characters);
            }
        });
        options.push('interact');
    }

    if(inv.some(i => objectList[i].variableList[1][1])){
        options.push('use');
    }

    options.push('desc');
    history.appendChild(responseBox);
    
}
