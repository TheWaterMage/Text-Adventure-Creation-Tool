const roomList = JSON.parse(localStorage.getItem('Rooms'));
const objectList  = JSON.parse(localStorage.getItem('Objs'));
const choices = ['left', 'right', 'foreward', 'back', 'up', 'down', 'pickup', 'look at', 'drop'];
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
            response.textContent = 'you pick up the item';
            responseBox.appendChild(response);
        }
        // looking at an item
        else if(options.some(str => command == str) && (command == choices[7])){
            response.textContent = 'you look at the item';
            responseBox.appendChild(response);
        }
        else{
            response.textContent = "You can't do that.";
            responseBox.appendChild(response);
            console.log(options);
            console.log(command);
        }
    }
    else if(textbox.value.includes('?')){
        response.style.whiteSpace = "pre-wrap";
        response.textContent += "Foreward: Move to the room in front.\n";
        response.textContent += "Back: Move to the room behind you.\n";
        response.textContent += "Left: Move to the room to the left.\n";
        response.textContent += "Right: Move to the room to the Right.\n";
        response.textContent += "Up: Move to the room above.\n";
        response.textContent += "Down: Move to the room below.\n";
        response.textContent += "Pickup [Item Name]: pick up an item in the same room.\n";
        response.textContent += "Look at: Take a closer look at an item in the same room.";
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
        options.push('pickup');
        options.push('look at');
    }
    else{
        const item = document.createElement('li');
        item.textContent = "You don't see anything else.";
        responseBox.appendChild(item);
    }

    history.appendChild(responseBox);
}