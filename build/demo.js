const roomList = JSON.parse(localStorage.getItem('Rooms'));
const objectList  = JSON.parse(localStorage.getItem('Objs'));
const choices = ['left', 'right', 'foreward', 'back', 'up', 'down', 'take', 'look at', 'drop', 'bag'];
const inv = [];
var options = [];
const history = document.getElementById('history');
const textbox = document.getElementById('txtBox');
var pos = 0;

window.onload = RoomDescriptions()

function submitAction(){
    const responseBox = document.createElement('li');
    const input = document.createElement('li');
    const response = document.createElement('li');
    let moved = false;

    response.style.whiteSpace = "pre-wrap";

    responseBox.className = "container";

    input.textContent = '> ' + textbox.value;
    responseBox.appendChild(input);

    let command = choices.find(str => textbox.value.toLowerCase().includes(str));

    if(command){
        // Movement commands
        if(options.some(str => command == str) && (command == choices[0] || command == choices[1] || command == choices[2] || command == choices[3]  || command == choices[4] || command == choices[5])){
            response.textContent = "You move " + command;
            responseBox.appendChild(response);
            switch(command){
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
        // picking up an item
        else if(options.some(str => command == str) && (command == choices[6])){
            let modifier = textbox.value.slice(textbox.value.toLowerCase().indexOf(command)+command.length).trim().toLowerCase(); // getting what came after command in a lower case string
            if(roomList[pos].variableList.some(i => objectList[i].text.toLowerCase() == modifier)){ // checking that there exist an object with the same name in the same room
                response.textContent = 'you pick up the ' + modifier; // adding text to response
                inv.push(objectList.findIndex(obj => obj.text.toLowerCase() == modifier)); // adding to inventory
                roomList[pos].variableList.splice(roomList[pos].variableList.findIndex(obj => objectList[obj].text.toLowerCase() == modifier), 1); // removing from room
            }
            else{
                response.textContent = 'That\'s not in this room'; // if the object is not in the room relaying to player
            }
                responseBox.appendChild(response);
        }
        // looking at an item
        else if(options.some(str => command == str) && (command == choices[7])){
            let modifier = textbox.value.slice(textbox.value.toLowerCase().indexOf(command)+command.length).trim().toLowerCase(); // getting what came after command in a lower case string
            if(roomList[pos].variableList.some(i => objectList[i].text.toLowerCase() == modifier)){ // checking that room has an item
                response.textContent = 'you look at the ' + modifier + "\n"; // adding general text
                response.textContent += objectList[objectList.findIndex(obj => obj.text.toLowerCase() == modifier)].description; // gives item description
                
            }
            else{
                response.textContent = 'That\'s not in this room.'; // letting player know that the room does not have the given object
            }
            responseBox.appendChild(response);
        }
        // Dropping an item in inventory
        else if((command == choices[8])){
            let modifier = textbox.value.slice(textbox.value.toLowerCase().indexOf(command)+command.length).trim().toLowerCase(); // getting what came after command in a lower case string
            if(inv.some(i => objectList[i].text.toLowerCase() == modifier)){ // checking if player has item
                response.textContent = 'you drop the ' + modifier; // adding text to response
                inv.splice(inv.findIndex(obj => objectList[obj].text.toLowerCase() == modifier), 1); // removing item from player inventory
                roomList[pos].variableList.push(objectList.findIndex(obj => obj.text.toLowerCase() == modifier)); // adding to room object list
            }
            else{
                response.textContent = 'You don\'t have that.'; // relaying to player that they don't have an item
            }
                responseBox.appendChild(response);
        }
        else if(command == choices[9]){
            if(inv.length == 0){ // if inventory is empty relaying that information
                response.textContent = 'You don\'t have anything';
            }
            else{ // lising off every item in inventory
                for(let i = 0; i < inv.length; i++){
                    response.textContent += 'You have a ' + objectList[inv[i]].text.toLowerCase() + '\n';
                }
            }
            responseBox.appendChild(response);
        }
        else{
            response.textContent = "You can't do that.";
            responseBox.appendChild(response);
        }
    }
    else if(textbox.value.includes('?')){
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
    else{
        response.textContent = "Sorry I don't understand type '?' for a list of commands";
        responseBox.appendChild(response);
    }

    history.appendChild(responseBox);

    if(moved){
        RoomDescriptions();
    }

    history.scrollTop = history.scrollHeight;
    textbox.value = "";
}

function RoomDescriptions(){
    options = [];
    const room = roomList[pos];
    const desc = room.description;
    const responseBox = document.createElement('li');
    const descEle = document.createElement('li');
    const mvmnt = document.createElement('li');

    responseBox.className = "container";

    if(desc.trim().length === 0){
        descEle.textContent = "You are in a room";
    }
    else{
        descEle.textContent = desc;
    }
    responseBox.appendChild(descEle);


    mvmnt.textContent += "You can move";
    if(room.connectedRooms[0] > -1){
        mvmnt.textContent += " foreward";
        options.push("foreward");
    }
    if(room.connectedRooms[1] > -1){
        mvmnt.textContent += " back";
        options.push("back");
    }
    if(room.connectedRooms[2] > -1){
        mvmnt.textContent += " left";
        options.push("left");
    }
    if(room.connectedRooms[3] > -1){
        mvmnt.textContent += " right";
        options.push("right");
    }
    if(room.connectedRooms[4] > -1){
        mvmnt.textContent += " up";
        options.push("up");
    }
    if(room.connectedRooms[5] > -1){
        mvmnt.textContent += " down";
        options.push("down");
    }

    responseBox.appendChild(mvmnt);

    if(roomList[pos].variableList.length > 0){
        const item = document.createElement('li');
        item.textContent = "You can see";
        roomList[pos].variableList.forEach(obj => {
            item.textContent += " a " + objectList[obj].text;
            responseBox.appendChild(item);
        });
        options.push('take');
        options.push('look at');
    }
    else{
        const item = document.createElement('li');
        item.textContent = "You don't see anything else.";
        responseBox.appendChild(item);
    }

    history.appendChild(responseBox);
}