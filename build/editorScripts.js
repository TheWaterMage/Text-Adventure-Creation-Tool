const objectList = [];
const roomList = [];

function createObjectButton(){
    const newObject = {
        id: objectList.length,
        type: "object",
        character: false,
        variableList: [],
        description: "",
        text: "new object " + objectList.length
    }; /* Creating blank object with id corresponding to next index*/
    objectList.push(newObject); /*adds to list*/
    const objectListContainer = document.getElementById('objectList');
    objectListContainer.innerHTML = ''; /*Deletes existing html list*/
    renderObjects("object");
}
function createRoom(){ /* will be used to add rooms */ 
    const newObject = {
        id: roomList.length,
        type: "room",
        variableList: [],
        connectedRooms: [],
        description: "",
        text: "new room " + roomList.length
    }; /* Creating blank object with id corresponding to next index*/
    roomList.push(newObject); /*adds to list*/
    const objectListContainer = document.getElementById('objectList');
    objectListContainer.innerHTML = ''; /*Deletes existing html list*/
    renderObjects("room");
}
function uploadFile(){ /* uploading files */
    alert("upload file");
}
function demo(){ /* Demoing games */
    alert("demo");
}
function save(){ /* saving the progress */
    alert("save");
}
function exportGame(){ /* exporting to file */
    alert("export");
}

function addVariable(){ /* adds a variable */
    const currentObject = objectList[document.getElementsByClassName("selected")[0].id]
    currentObject.variableList.push(["new variable", 0, currentObject.variableList.length]);
    const variableContainer = document.getElementById("variableList");
    renderVariables(currentObject, variableContainer);
}

function renderVariables(currentObject, variableContainer){ /* renders variable list */
    variableContainer.innerHTML = ''; /*Deletes existing html list*/
    if(currentObject.type == "object"){
        const li = document.createElement('li');
        const p = document.createElement('p');
        p.textContent = "Character Object"
        li.appendChild(p);
        const isCharacter = document.createElement('input');
        isCharacter.type = "checkbox";
        isCharacter.checked = currentObject.character;
        isCharacter.onclick = function(){
            currentObject.character = isCharacter.checked;
        }
        li.appendChild(isCharacter);
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
                currentObject.variableList[object[2]][1] = input.value;
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
        const li = document.createElement('li');
        const bttn1 = document.createElement("button");
        bttn1.className = "addVariableButton";
        bttn1.textContent = "Connect Room";
        bttn1.addEventListener("click", roomAttch);
        li.appendChild(bttn1);
        const bttn2 = document.createElement("button");
        bttn2.className = "addVariableButton";
        bttn2.textContent = "Insert Object";
        bttn2.addEventListener("click", objtAttch);
        li.appendChild(bttn2);
        variableContainer.appendChild(li);
        currentObject.variableList.forEach(object => { /*creates list items taking the text and id from the array and assigning them*/
            const li = document.createElement('li');

            const p = document.createElement('p');
            p.textContent = "Contains: ";

            li.appendChild(p);

            const select = document.createElement('select');

            for(let i=0;i<objectList.length;i++){
                let option = document.createElement('option');
                option.value = i;
                option.textContent = objectList[i].text;
                select.appendChild(option);
            }

            select.value = currentObject.variableList[object[2]][1];

            select.onblur = function(){ /* Saves input into array */
                currentObject.variableList[object[2]][1] = select.value;
                renderVariables(currentObject, variableContainer);   
            }

            li.appendChild(select);

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
        currentObject.connectedRooms.forEach(object => { /*creating list of connected rooms*/
            const li = document.createElement('li');

            const p = document.createElement('p');
            p.textContent = "Connected To: ";

            li.appendChild(p);

            const select = document.createElement('select');

            for(let i=0;i<roomList.length;i++){
                    let option = document.createElement('option');
                    option.value = i;
                    option.textContent = roomList[i].text;
                    select.appendChild(option);
            }

            select.value = currentObject.connectedRooms[object[2]][1];

            select.onblur = function(){ /* Saves input into array */
                currentObject.connectedRooms[object[2]][1] = select.value;
                renderVariables(currentObject, variableContainer);   
            }

            li.appendChild(select);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = function(){
                currentObject.connectedRooms.splice(object[2],1);
                for(let i = 0; i < currentObject.connectedRooms.length; i++){
                    currentObject.connectedRooms[i][2] = i;
                }
                renderVariables(currentObject, variableContainer);
            }

            li.appendChild(deleteBtn);

            variableContainer.appendChild(li);
        });
    }
}

function renderObjects(caller, type){
    objectListContainer = document.getElementById("objectList");
    objectListContainer.innerHTML = ''; /*Deletes existing html list*/
    objectList.forEach(object => { /*creates list items taking the text and id from the array and assigning them*/
        const li = document.createElement('li');
        li.textContent = object.text;
        li.id = object.id;
        li.classList.add("object");
        li.ondblclick = function(){ /*allows name to be edited and causes focus on name when double clicked*/
            li.contentEditable = "true";
            li.focus(); 
        };
        li.onclick = function(){
            document.getElementsByClassName("selected")[0].classList.remove("selected");
            li.classList.add("selected");
            if(document.getElementById("var").className == "tabbed"){
                renderVariables(objectList[li.id], document.getElementById("variableList"));
            }
            else{
                renderDetails(objectList[li.id], document.getElementById("variableList"));
            }
        }
        li.onblur = function(){ /*item becomes uneditable and changes name in array*/
            objectList[li.id].text = li.textContent;
            li.contentEditable = "false";           
        };
        li.onauxclick = function(){
            objectList.splice(li.id,1);
            for(let i = 0; i < objectList.length; i++){
                objectList[i].id = i;
            }
            renderObjects(li.id);
        }

        if(li.id == caller && type == "object" || caller == "object" && li.id == objectList.length-1){
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
    roomList.forEach(object => { /*creates list items taking the text and id from the array and assigning them*/
        const li = document.createElement('li');
        li.textContent = object.text;
        li.id = object.id;
        li.classList.add("room");
        li.ondblclick = function(){ /*allows name to be edited and causes focus on name when double clicked*/
            li.contentEditable = "true";
            li.focus(); 
        };
        li.onclick = function(){
            document.getElementsByClassName("selected")[0].classList.remove("selected");
            li.classList.add("selected");
            if(document.getElementById("var").className == "tabbed"){
                renderVariables(roomList[li.id], document.getElementById("variableList"));
            }
            else{
                renderDetails(roomList[li.id], document.getElementById("variableList"));
            }
        }
        li.onblur = function(){ /*item becomes uneditable and changes name in array*/
            roomList[li.id].text = li.textContent;
            li.contentEditable = "false";           
        };
        li.onauxclick = function(){
            roomList.splice(li.id,1);
            for(let i = 0; i < roomList.length; i++){
                roomList[i].id = i;
            }
            renderObjects(li.id);
        }

        if(li.id == caller && type == "room"|| caller == "room" && li.id == roomList.length-1){
            li.classList.add("selected");
            if(document.getElementById("var").className == "tabbed"){
                renderVariables(roomList[li.id], document.getElementById("variableList"));
            }
            else{
                renderDetails(roomList[li.id], document.getElementById("variableList"));
            }
        }
        

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
    currentObject.variableList.push(["new variable", 0, currentObject.variableList.length]);
    const variableContainer = document.getElementById("variableList");
    renderVariables(currentObject, variableContainer);
}