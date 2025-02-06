const objectList = [];
const roomList = [];

function createObjectButton() {
    const newObject = {
        id: objectList.length,
        type: "object",
        character: false,
        variableList: [],
        description: "",
        text: "object " + objectList.length
    };
    objectList.push(newObject);
    const objectListContainer = document.getElementById('objectList');
    objectListContainer.innerHTML = ''; // Clear existing list
    renderObjects(-1, "object");

    // Announce the addition
    speak(`Object ${newObject.text} added.`);
}

function createRoom() {
    const newObject = {
        id: roomList.length,
        type: "room",
        variableList: [],
        connectedRooms: [["", -1], ["", -1], ["", -1], ["", -1], ["", -1], ["", -1]],
        description: "",
        text: "new room " + roomList.length
    };
    roomList.push(newObject);
    const objectListContainer = document.getElementById('objectList');
    objectListContainer.innerHTML = ''; // Clear existing list
    renderObjects(-1, "room");

    // Announce the addition
    speak(`Room ${newObject.text} added.`);
}

function uploadFile(){ /* uploading files */
    alert("upload file");
}
function demo(){ /* Demoing games */
    localStorage.setItem("Rooms", JSON.stringify(roomList));
    localStorage.setItem("Objs", JSON.stringify(objectList));
    window.open('demo.html', '_blank');
}
function save(){ /* saving the progress */
    // Data that will be passed to the saveGame funciton//
    const gameData = {
        rooms: roomList, // Assuming roomList contains the rooms data
        objects: objectList // Assuming objectList contains the objects data
    };

    // Call saveGame from database.js
    console.log("calling saveGame");
    saveGame(gameData);
}
function exportGame(){ /* exporting to file */
    alert("export");
}

function addVariable() {
    const currentObject = objectList[document.getElementsByClassName("selected")[0].id];
    const variableName = `Variable ${currentObject.variableList.length}`;
    currentObject.variableList.push(["new variable", 0, currentObject.variableList.length]);
    const variableContainer = document.getElementById("variableList");
    renderVariables(currentObject, variableContainer);

    // Announce the addition
    speak(`${variableName} added.`);
}


function renderVariables(currentObject, variableContainer){ /* renders variable list */
    variableContainer.innerHTML = ''; /*Deletes existing html list*/
    if(currentObject.type == "object"){
        const li = document.createElement('li');
        const p = document.createElement('p');
        p.textContent = "Object Type"
        li.appendChild(p);

        // Creating a list of object types to choose from
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
        option.textContent = "Enemy";
        objtType.appendChild(option);
        option = document.createElement('option');
        option.value = 3;
        option.textContent = "Merchant";
        objtType.appendChild(option);
        li.appendChild(objtType);
        variableContainer.appendChild(li);
        
        const bttn = document.createElement("button");
        bttn.className = "addVariableButton";
        bttn.textContent = "Add Variable";
        bttn.addEventListener("click", addVariable);
        variableContainer.appendChild(bttn);
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
    }
    if(currentObject.type == "room"){
        const li = document.createElement('li'); /* Button to add object*/
        const bttn2 = document.createElement("button");
        bttn2.className = "addVariableButton";
        bttn2.textContent = "Insert Object";
        bttn2.addEventListener("click", objtAttch);
        li.appendChild(bttn2);
        variableContainer.appendChild(li);
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
            if(currentObject.connectedRooms[i][1]!=-1){
                select.value = currentObject.connectedRooms[i]+1;
            }
            else{
                select.value = 0;
            }

            select.onblur = function(){
                currentObject.connectedRooms[i] = select.value-1;
                if(i%2){
                    roomList[select.value-1].connectedRooms[i-1] = currentObject.id;
                }
                else{
                    roomList[select.value-1].connectedRooms[i+1] = currentObject.id;
                }
                renderVariables(currentObject, variableContainer);
            }

            li.appendChild(select);

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
    objectListContainer = document.getElementById("objectList");
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

            // Announce selection
            speak(`Object ${object.text} selected.`);

            if (document.getElementById("var").className == "tabbed") {
                renderVariables(objectList[li.id], document.getElementById("variableList"));
            } else {
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
            if(document.getElementById("var").className == "tabbed"){
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

            // Announce selection
            speak(`Room ${object.text} selected.`);

            if (document.getElementById("var").className == "tabbed") {
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
            if(document.getElementById("var").className == "tabbed"){
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
    document.getElementById("var").className = "tabbed";
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
    document.getElementById("dtl").className = "tabbed";
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

function roomAttch(){
    const currentObject = roomList[document.getElementsByClassName("selected")[0].id];
    currentObject.connectedRooms.push(["new variable", 0, currentObject.connectedRooms.length]);
    const variableContainer = document.getElementById("variableList");
    renderVariables(currentObject, variableContainer);
}
function objtAttch(){
    const currentObject = roomList[document.getElementsByClassName("selected")[0].id];
    currentObject.variableList.push(-1);    
    const variableContainer = document.getElementById("variableList");
    renderVariables(currentObject, variableContainer);
}