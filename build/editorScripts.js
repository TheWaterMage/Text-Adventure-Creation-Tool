const objectList = [];
const roomList = [];

function createObjectButton() {
    const newObject = {
        id: objectList.length,
        type: "object",
        character: 0,
        variableList: [],
        description: "",
        text: "object " + objectList.length
    };
    objectList.push(newObject);
    const objectListContainer = document.getElementById('objectList');
    objectListContainer.innerHTML = ''; // Clear existing list
    renderObjects(-1, "object");
}

function createRoom() {
    const newObject = {
        id: roomList.length,
        type: "room",
        variableList: [],
        connectedRooms: [[false, -1], [false, -1], [false, -1], [false, -1], [false, -1], [false, -1]],
        description: "",
        text: "new room " + roomList.length
    };
    roomList.push(newObject);
    const objectListContainer = document.getElementById('objectList');
    objectListContainer.innerHTML = ''; // Clear existing list
    renderObjects(-1, "room");
}

function uploadFile() {
    alert("upload file");
}

function demo() {
    localStorage.setItem("Rooms", JSON.stringify(roomList));
    localStorage.setItem("Objs", JSON.stringify(objectList));
    window.open('demo.html', '_blank');
}

function save() {
    const firestoreSafeRooms = roomList.map(room => ({
        ...room,
        connectedRooms: room.connectedRooms.map(([locked, roomId]) => ({
            locked,
            roomId
        })),
        variableList: room.variableList.map(item =>
            Array.isArray(item) ? { value: item[0], count: item[1] } : item
        )
    }));

    const firestoreSafeObjects = objectList.map(obj => ({
        ...obj,
        variableList: obj.variableList.map(item =>
            Array.isArray(item) ? { name: item[0], value: item[1] } : item
        )
    }));

    const gameData = {
        rooms: firestoreSafeRooms,
        objects: firestoreSafeObjects,
    };

    saveGame(gameData).catch(error => {
        console.error("Save failed:", error);
        alert("Error saving to Firebase");
    });
}

async function initializeEditor() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('gameId');

        if (!gameId) return;

        await new Promise(resolve => setTimeout(resolve, 500));

        let gameData = await window.loadGame(gameId);

        if (!gameData && gameId) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            gameData = await window.loadGame(gameId);
        }

        if (gameData) {
            objectList.splice(0, objectList.length);
            roomList.splice(0, roomList.length);

            objectList.push(...gameData.objects);
            roomList.push(...gameData.rooms);

            renderObjects(-1, "room");

            if (roomList.length > 0) {
                renderVariables(roomList[0], document.getElementById("variableList"));
            }
        }
    } catch (error) {
        console.error("Initialize error:", error);
        alert("Load failed - check console");
    }
}

window.addEventListener('DOMContentLoaded', initializeEditor);

function exportGame() {
    alert("export");
}

function addVariable() {
    const currentObject = objectList[document.getElementsByClassName("selected")[0].id];
    const variableName = `Variable ${currentObject.variableList.length}`;
    currentObject.variableList.push(["new variable", 0, currentObject.variableList.length]);
    const variableContainer = document.getElementById("variableList");
    renderVariables(currentObject, variableContainer);
}

function renderVariables(currentObject, variableContainer) {
    variableContainer.innerHTML = ''; // Clear existing list
    if(currentObject.type == "object"){
        let li = document.createElement('li');
        let p = document.createElement('p');
        p.textContent = "Object Type"
        li.appendChild(p);

        // Creating a list of object types to choose from which also include character types
        const objtType = document.createElement('select');
        let option = document.createElement('option');
        option.value = 0;
        option.textContent = "Item";
        objtType.appendChild(option);
        option = document.createElement('option');
        option.value = 1;
        option.textContent = "Interactive Piece";
        objtType.appendChild(option);
        option = document.createElement('option');
        option.value = 2;
        option.textContent = "Merchant";
        objtType.appendChild(option);
        option = document.createElement('option');
        option.value = 3;
        option.textContent = "Enemy";
        objtType.appendChild(option);

        objtType.value = currentObject.character;

        objtType.onchange = function(){
            if(currentObject.character != objtType.value){
                currentObject.variableList = [];
                currentObject.character = objtType.value;
                renderVariables(currentObject,variableContainer);
            }
        };

        li.appendChild(objtType);
        variableContainer.appendChild(li);

        // object type specific information such as cost and if it is a key
        if(currentObject.character == 0){
            li = document.createElement('li');
            p = document.createElement('p');
            p.textContent = "Value";
            li.appendChild(p);
            let text = document.createElement("input");
            text.type = "text";
            if(currentObject.variableList.length==0){
                currentObject.variableList.push(["Value", 0])
            }
            text.value = currentObject.variableList[0][1];
            text.onchange = function(){
                currentObject.variableList[0][1] = text.value;
            }
            li.appendChild(text);
            variableContainer.appendChild(li);
            li = document.createElement('li');
            p = document.createElement('p');
            p.textContent = "Is a Key";
            li.appendChild(p);
            let key = document.createElement("input");
            key.type = "checkbox";
            if(currentObject.variableList.length==1){
                currentObject.variableList.push(["key",false]);
            }
            key.checked = currentObject.variableList[1][1];
            key.onchange = function(){
                currentObject.variableList[1][1] = key.checked;
            }
            li.appendChild(key);
            variableContainer.appendChild(li);
        }
        if(currentObject.character == 2){
            li = document.createElement('li');
            p = document.createElement('p');
            p.textContent = "Inventory";
            li.appendChild(p);
            const bttn2 = document.createElement("button");
            bttn2.className = "addVariableButton";
            bttn2.textContent = "Insert Object";
            bttn2.addEventListener("click", addInventory);
            li.appendChild(bttn2);
            variableContainer.appendChild(li);
        }

        if(currentObject.character!=0 && currentObject.character!=2){
            currentObject.variableList.forEach(object => { /*creates list items taking the text and id from the array and assigning them*/
                const li = document.createElement('li');

                const p = document.createElement('p');
                p.textContent = object[0];
                p.ondblclick = function(){ /*allows name to be edited and causes focus on name when double clicked*/
                    p.contentEditable = "true";
                    p.focus(); 
                };
                p.onblur = function(){ /*item becomes uneditable and changes name in array*/
                    currentObject.variableList[object[2]][0] = p.textContent;
                    renderVariables(currentObject, variableContainer);
                    p.contentEditable = "false";           
                };

                li.appendChild(p);

                const input = document.createElement('input');
                input.type = "text";
                input.value = object[1];

                input.onblur = function(){ /* Saves input into array */
                    object.id = input.value;
                    renderVariables(currentObject, variableContainer);   
                }

                li.appendChild(input);

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = "Delete";
                deleteBtn.onclick = function(){
                    currentObject.variableList.splice(object[2],1);
                    for(let i = 0; i < currentObject.variableList.length; i++){
                        currentObject.variableList[i][2] = i;
                    }
                    renderVariables(currentObject, variableContainer);
                }

                li.appendChild(deleteBtn);

                variableContainer.appendChild(li);
            });
            const bttn = document.createElement("button");
            bttn.className = "addVariableButton";
            bttn.textContent = "Add Variable";
            bttn.addEventListener("click", addVariable);
            variableContainer.appendChild(bttn);
        }
        else{
            if(currentObject.character==0){
                for(let i = 2; i < currentObject.variableList.length; i++){ /*creates list items taking the text and id from the array and assigning them*/
                    const li = document.createElement('li');

                    const p = document.createElement('p');
                    p.textContent = currentObject.variableList[i][0];
                    p.ondblclick = function(){ /*allows name to be edited and causes focus on name when double clicked*/
                        p.contentEditable = "true";
                        p.focus(); 
                    };
                    p.onblur = function(){ /*item becomes uneditable and changes name in array*/
                        currentObject.variableList[currentObject.variableList[i][2]][0] = p.textContent;
                        renderVariables(currentObject, variableContainer);
                        p.contentEditable = "false";           
                    };

                    li.appendChild(p);

                    const input = document.createElement('input');
                    input.type = "text";
                    input.value = currentObject.variableList[i][1];

                    input.onblur = function(){ /* Saves input into array */
                        currentObject.variableList[i].id = input.value;
                        renderVariables(currentObject, variableContainer);   
                    }

                    li.appendChild(input);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = "Delete";
                    deleteBtn.onclick = function(){
                        currentObject.variableList.splice(currentObject.variableList[i][2],1);
                        for(let i = 0; i < currentObject.variableList.length; i++){
                            currentObject.variableList[i][2] = i;
                        }
                        renderVariables(currentObject, variableContainer);
                    }

                    li.appendChild(deleteBtn);

                    variableContainer.appendChild(li);
                };
            }
            else if(currentObject.character==2){
                for(let i = 0; i < currentObject.variableList.length; i++){ /*creates list items taking the text and id from the array and assigning them*/
                    const li = document.createElement('li');

                    const select = document.createElement('select');
                    let option = document.createElement('option');
                    option.value = 0;
                    option.textContent = 'Nothing';
                    select.appendChild(option);

                    for(let j=1;j<=objectList.length;j++){
                        if(j-1 != currentObject.id && objectList[j-1].character==0){
                            let option = document.createElement('option');
                            option.value = j;
                            option.textContent = objectList[j-1].text;
                            select.appendChild(option);
                        }
                    }
                    if(currentObject.variableList[i][0] == -1){
                        select.value = 0;
                    }
                    else{
                        select.value = currentObject.variableList[i][0]+1;
                    }

                    select.onchange = function(){
                        currentObject.variableList[i][0] = select.value-1;
                        renderVariables(currentObject, variableContainer);
                    }

                    li.appendChild(select);

                    const count = document.createElement('input');
                    count.type = 'number';
                    count.min = 1;
                    count.value = currentObject.variableList[i][1];
                    count.onchange = function(){
                        if(count.value >= count.min){
                            currentObject.variableList[i][1] = count.value;
                            renderVariables(currentObject, variableContainer);
                        }
                        else{
                            count.value = 1;
                            currentObject.variableList[i][1] = count.value;
                            renderVariables(currentObject, variableContainer);
                        }
                    }
                    li.appendChild(count);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = "Delete";
                    deleteBtn.onclick = function(){
                        currentObject.variableList.splice(i,1);
                        renderVariables(currentObject, variableContainer);
                    }

                    li.appendChild(deleteBtn);

                    variableContainer.appendChild(li);
                };
            }
        }
    }
    if(currentObject.type == "room"){
        const li = document.createElement('li'); /* Button to add object*/
        const bttn2 = document.createElement("button");
        bttn2.className = "addVariableButton";
        bttn2.textContent = "Insert Object";
        bttn2.addEventListener("click", objtAttch);
        li.appendChild(bttn2);
        variableContainer.appendChild(li);
        // goes through the six directions
        for(let i = 0; i < 6; i++){
            const li = document.createElement('li');
            const p = document.createElement('p');
            switch(i){
                case 0:
                    p.textContent = "foreward: ";
                    break;
                case 1:
                    p.textContent = "backward: ";
                    break;
                case 2:
                    p.textContent = "left: ";
                    break;
                case 3:
                    p.textContent = "right: ";
                    break;
                case 4:
                    p.textContent = "up: ";
                    break;
                case 5:
                    p.textContent = "down: ";
                    break;
            }
            li.appendChild(p);

            const select = document.createElement('select');
            let option = document.createElement('option');
            option.value = 0;
            option.textContent = 'No Connection';
            select.appendChild(option);

            for(let j=1;j<=roomList.length;j++){
                if(j-1 != currentObject.id){
                    let option = document.createElement('option');
                    option.value = j;
                    option.textContent = roomList[j-1].text;
                    select.appendChild(option);
                }
            }
            if(currentObject.connectedRooms[i][1]==-1){
                select.value = 0;
            }
            else{
                select.value = currentObject.connectedRooms[i][1]+1;
            }

            select.onblur = function(){
                currentObject.connectedRooms[i][1] = select.value-1;
                if(i%2){
                    roomList[select.value-1].connectedRooms[i-1][1] = currentObject.id;
                }
                else{
                    roomList[select.value-1].connectedRooms[i+1][1] = currentObject.id;
                }
                renderVariables(currentObject, variableContainer);
            }

            li.appendChild(select);

            const label = document.createElement('p');
            label.textContent = "Locked: ";

            li.appendChild(label);

            const lock = document.createElement('input');
            lock.type = "checkbox";
            lock.checked = currentObject.connectedRooms[i][0];
            lock.onclick = function(){
                currentObject.connectedRooms[i][0] = lock.checked;
            };

            li.appendChild(lock);

            variableContainer.appendChild(li);
        };
        for(let i = 0; i < currentObject.variableList.length; i++){ /*creates list items taking the text and id from the array and assigning them*/
            const li = document.createElement('li');

            const p = document.createElement('p');
            p.textContent = "Contains: ";

            li.appendChild(p);

            const select = document.createElement('select');
            let option = document.createElement('option');
                option.value = 0;
                option.textContent = "Select Option";
                select.appendChild(option);

            for(let j=1;j<=objectList.length;j++){
                let option = document.createElement('option');
                option.value = j;
                option.textContent = objectList[j-1].text;
                select.appendChild(option);
            }

            if(currentObject.variableList[i] != -1){
                select.value = currentObject.variableList[i]+1;
            }
            else{
                select.value = 0;
            }

            select.onblur = function(){ /* Saves input into array */
                currentObject.variableList[i] = select.value-1;
                renderVariables(currentObject, variableContainer);   
            }
            li.appendChild(select);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = function(){
                currentObject.variableList.splice(i,1);
                for(let j = 0; j < currentObject.variableList.length; j++){
                    currentObject.variableList[j] = j;
                }
                renderVariables(currentObject, variableContainer);
            }

            li.appendChild(deleteBtn);

            variableContainer.appendChild(li);
        };
    }
}

function renderObjects(caller, type) {
    const objectListContainer = document.getElementById("objectList");
    objectListContainer.innerHTML = ''; // Clear existing list

    objectList.forEach(object => { /*creates list items taking the text and id from the array and assigning them*/
        const li = document.createElement('li');
        li.textContent = object.text;
        li.id = object.id;
        li.classList.add("object");
        li.ondblclick = function(){ /*allows name to be edited and causes focus on name when double clicked*/
            li.contentEditable = "true";
            li.focus();
        };
        li.onblur = function(){ /*item becomes uneditable and changes name in array*/
            objectList[li.id].text = li.textContent;
            li.contentEditable = "false";           
        };
        // changes selection to clicked item
        li.onclick = function() {
            if (document.getElementsByClassName("selected")[0]) {
                document.getElementsByClassName("selected")[0].classList.remove("selected");
            }
            li.classList.add("selected");

            if (document.getElementById("var").classList.contains("tabbed")) {
                renderVariables(objectList[li.id], document.getElementById("variableList"));
            } 
            else {
                renderDetails(objectList[li.id], document.getElementById("variableList"));
            }
        };
        // Deletes object
        li.onauxclick = function(){
            objectList.splice(li.id,1);
            for(let i = 0; i < objectList.length; i++){
                objectList[i].id = i;
            }
            renderObjects(li.id, "object");
        }

        if((li.id == caller && type == "object") || (type == "object" && li.id == objectList.length-1)){
            li.classList.add("selected");
            if(document.getElementById("var").classList.contains("tabbed")){
                renderVariables(objectList[li.id], document.getElementById("variableList"));
            }
            else{
                renderDetails(objectList[li.id], document.getElementById("variableList"));
            }
        }

        objectListContainer.appendChild(li);
    });

    roomList.forEach(object => {
        const li = document.createElement('li');
        li.textContent = object.text;
        li.id = object.id;
        li.classList.add("room");
        li.ondblclick = function(){ /*allows name to be edited and causes focus on name when double clicked*/
            li.contentEditable = "true";
            li.focus(); 
        };
        li.onblur = function(){ /*item becomes uneditable and changes name in array*/
            roomList[li.id].text = li.textContent;
            li.contentEditable = "false";           
        };
        li.onclick = function() {
            if (document.getElementsByClassName("selected")[0]) {
                document.getElementsByClassName("selected")[0].classList.remove("selected");
            }
            li.classList.add("selected");

            if (document.getElementById("var").classList.contains("tabbed")) {
                renderVariables(roomList[li.id], document.getElementById("variableList"));
            } else {
                renderDetails(roomList[li.id], document.getElementById("variableList"));
            }
        };
        li.onauxclick = function(){
            roomList.splice(li.id,1);
            for(let i = 0; i < roomList.length; i++){
                roomList[i].id = i;
            }
            renderObjects(li.id, "room");
        };
        if(li.id == caller && type == "room"|| type == "room" && li.id == roomList.length-1){
            li.classList.add("selected");
            if(document.getElementById("var").classList.contains("tabbed")){
                renderVariables(roomList[li.id], document.getElementById("variableList"));
            }
            else{
                renderDetails(roomList[li.id], document.getElementById("variableList"));
            }
        };

        objectListContainer.appendChild(li);
    });
}

function renderDetails(currentObject, variableContainer){
    variableContainer.innerHTML = ''; /*Deletes existing html list*/
    const li = document.createElement("li");
    const nameLabel = document.createElement("p");
    nameLabel.textContent = "Name: ";
    li.appendChild(nameLabel);
    const name = document.createElement("input");
    name.type = "text";
    name.value = currentObject.text;
    name.onblur = function(){ /* Saves input*/
        currentObject.text = name.value;
        renderDetails(currentObject, variableContainer);
        if(currentObject.type == "room"){
            renderObjects(currentObject.id, "room")
        }
        else{
            renderObjects(currentObject.id, "object")
        }
    }
    li.appendChild(name);
    const descLabel = document.createElement("p");
    descLabel.textContent = "Description: ";
    const desc = document.createElement("input");
    desc.type = "text";
    desc.value = currentObject.description;

    desc.onblur = function(){ /* Saves input*/
        currentObject.description = desc.value;
        renderDetails(currentObject, variableContainer);   
    }

    variableContainer.appendChild(li);
    variableContainer.appendChild(descLabel);
    variableContainer.appendChild(desc);
}
function variables(){
    document.getElementById("dtl").classList.remove("tabbed");
    document.getElementById("var").classList.add("tabbed");
    var currentObject;
    if(document.getElementsByClassName("selected")[0].classList.contains("object")){
        currentObject = objectList[document.getElementsByClassName("selected")[0].id];
    }
    else{
        currentObject = roomList[document.getElementsByClassName("selected")[0].id];
    }
    const variableContainer = document.getElementById("variableList");
    renderVariables(currentObject, variableContainer);
}
function details(){
    document.getElementById("var").classList.remove("tabbed");
    document.getElementById("dtl").classList.add("tabbed");
    var currentObject;
    if(document.getElementsByClassName("selected")[0].classList.contains("object")){
        currentObject = objectList[document.getElementsByClassName("selected")[0].id];
    }
    else{
        currentObject = roomList[document.getElementsByClassName("selected")[0].id];
    }
    const variableContainer = document.getElementById("variableList");
    renderDetails(currentObject, variableContainer);
}

// Adds object to a room
function objtAttch(){
    const currentObject = roomList[document.getElementsByClassName("selected")[0].id];
    currentObject.variableList.push(-1);    
    const variableContainer = document.getElementById("variableList");
    renderVariables(currentObject, variableContainer);
}

function addInventory(){
    const currentObject = objectList[document.getElementsByClassName("selected")[0].id];
    currentObject.variableList.push([-1,1]);    // object id, and count
    const variableContainer = document.getElementById("variableList");
    renderVariables(currentObject, variableContainer);
}
// ===== COMBAT SYSTEM =====
class CombatSystem {
  constructor(player, enemy) {
    this.player = { health: 100, attack: 10 };
    this.enemy = enemy || { health: 50, attack: 5, name: "Goblin" };
    this.log = [];
  }

  start() {
    this.log.push(`Combat started against ${this.enemy.name}!`);
    return this.log;
  }

  playerAttack() {
    const damage = this.player.attack;
    this.enemy.health -= damage;
    this.log.push(`You hit ${this.enemy.name} for ${damage} damage!`);
    
    if (this.enemy.health <= 0) {
      this.log.push(`${this.enemy.name} defeated!`);
      return this.log;
    }
    return this.enemyTurn();
  }

  enemyTurn() {
    const damage = this.enemy.attack;
    this.player.health -= damage;
    this.log.push(`${this.enemy.name} attacks you for ${damage} damage!`);
    return this.log;
  }
}

// Example usage: 
// const combat = new CombatSystem(null, objectList[enemyId]);
// combat.start();
// combat.playerAttack();
