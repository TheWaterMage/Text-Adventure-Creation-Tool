const objectList = [];

function createObjectButton(){
    const newObject = {
        id: objectList.length,
        variableList: [],
        text: "new object"
    }; /* Creating blank object with id corresponding to next index*/
    objectList.push(newObject); /*adds to list*/
    const objectListContainer = document.getElementById('objectList');
    objectListContainer.innerHTML = ''; /*Deletes existing html list*/
    renderObjects();
}
function createRoom(){ /* will be used to add rooms */ 
    alert("Create room");
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
            currentObject.variableList.splice(currentObject.variableList[2],1);
            renderVariables(currentObject, variableContainer);
        }

        li.appendChild(deleteBtn);

        variableContainer.appendChild(li);
    });
}

function renderObjects(){
    objectListContainer = document.getElementById("objectList");
    objectListContainer.innerHTML = ''; /*Deletes existing html list*/
    objectList.forEach(object => { /*creates list items taking the text and id from the array and assigning them*/
        const li = document.createElement('li');
        li.textContent = object.text;
        li.id = object.id;
        li.ondblclick = function(){ /*allows name to be edited and causes focus on name when double clicked*/
            li.contentEditable = "true";
            li.focus(); 
        };
        li.onclick = function(){
            document.getElementsByClassName("selected")[0].classList.remove("selected");
            li.className = "selected";
            renderVariables(objectList[li.id], document.getElementById("variableList"));
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
            renderObjects();
        }

        if(li.id == objectList.length-1){
            li.className = "selected";
            renderVariables(objectList[li.id], document.getElementById("variableList"));
        }

        objectListContainer.appendChild(li);
    });
}

