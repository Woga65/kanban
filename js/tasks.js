import { touchStart, touchMove, touchEnd, touchCancel, } from "./dragdrop/touch.js";
import { startDragging, stopDragging, dragging } from "./dragdrop/mouse.js";
import { backend, setURL, downloadFromServer, jsonFromServer } from "../smallest_backend_ever/mini_backend_module.js";
import { readSettings, readTasks, writeSettings, writeTasks, writeCommit } from "./backend.js";


const tasks = [];
const currentlyDraggedTask = { id: "", sourceColumn: "" };

const defaultPriorities = ["niedrig", "mittel", "hoch"];
const priorities = [];
const defaultPersons = ["Wolfgang", "Max", "Daniel", "Lukas"]; // for testing
const inCharge = [];
const defaultCategories = ["Management", "Marketing", "Frontend", "Backend", "Entwicklung", "Arbeit", "Hobby"]; // for testing
const categories = [];

const taskListeners = [
    { evt: "dragstart", callback: startDragging },
    { evt: "dragend", callback: stopDragging },
    { evt: "touchstart", callback: touchStart },
    { evt: "touchmove", callback: touchMove },
    { evt: "touchend", callback: touchEnd },
    { evt: "touchcancel", callback: touchCancel },
    { evt: "click", callback: taskClicked },
    { evt: "focusout", callback: taskOutOfFocus },
];


/**********************************
**     task's core functions     **
**********************************/


/**
 * create a task, push it to the tasks array
 * and write it to the backend
 * 
 * @param { string } columnId   - the ID of the column the task will be added to
 * @param { string } title      - the title of the task
 * @param { string } description - a description of the task
 * @param { string } category   - the task's categoy
 * @param { number } priority   - the number of the task's priority
 * @param { string } deadline   - the date when the task need to be finished (UTC date string) 
 * @param { string } personInCharge - the person the task is assigned to 
 * @returns { string } - the ID of the just created task
 */
function addTask(columnId, title, description, category, priority, deadline, personInCharge) {
    let addedAt = Date.now();
    let task = {
        id: 't' + Date.now() + String(Math.floor(Math.random() * 1000)),
        title: title,
        description: description,
        category: category,
        priority: priority,
        deadline: new Date(deadline).getTime(),
        addedAt: addedAt,
        inCharge: personInCharge,
        columnId: columnId,
    }
    tasks.push(task);
    writeAllTasksToBackend();
    return task.id;
}


/**
 * remove a task from the DOM, tasks array and backend
 * 
 * @param { string } taskId - the ID of the task to remove
 */
function removeTask(taskId) {
    let i = findTasksIndex(taskId);
    if (i >= 0) {
        const taskExists = document.getElementById(tasks[i].id);
        taskListeners.forEach(tl => taskExists.removeEventListener(tl.evt, tl.callback));
        document.getElementById(`${tasks[i].columnId}-body`).removeChild(taskExists);
        tasks.splice(i, 1);
        writeAllTasksToBackend();
    }
}


/**
 * render all the tasks from the tasks array
 */
function showTasks() {
    tasks.sort((a, b) => a.deadline - b.deadline);
    tasks.forEach(task => {
        const col = document.querySelector(`#${task.columnId} .column-body`);
        if (col) {
            const taskExists = document.getElementById(task.id);
            (taskExists) ? col.removeChild(taskExists) : false;
            const div = createTaskContainer(task);
            div.style.border = "1px solid " + window.getComputedStyle(col.parentElement).borderColor;
            col.appendChild(div);
        }
    });
}


/**
 * create and setup a task's DOM element
 * 
 * @param { object } task - a task's object from the tasks array 
 * @returns { object } - a reference to the task's object in the DOM
 */
function createTaskContainer(task) {
    const div = document.createElement("div");
    div.id = task.id;
    div.classList.add("task");
    div.draggable = true;
    div.style.cursor = "grab";
    div.innerHTML = taskTemplate(task);
    taskListeners.forEach(tl => div.addEventListener(tl.evt, tl.callback.bind(null, task.id)));
    return div;
}


/**
 * create a template string from a task's object
 * 
 * @param { object } task - a task's object from the tasks array
 * @returns { string } - the task's template string
 */
function taskTemplate(task) {
    return `
    <div class="task-menu">
        <span class="delete-task">&#xf2ed;</span>
        <span class="close-task">&#xeee1;</span>
    </div>
    <div class="task-header">
        <h5><input tabindex="1" class="task-category" type="text" value="${task.category}" readonly></h5>
        <span class="task-priority">${priorities[task.priority] || "none"}</span>
    </div>
    <div class="task-body">
        <textarea tabindex="2" class="task-title" readonly>${task.title}</textarea>
        <textarea tabindex="3" class="task-description" rows="3" style="display: none;" readonly>${task.description}</textarea>
    </div>
    <div class="task-footer">
        <span class="task-incharge">${task.inCharge}: </span>
        <span class="task-deadline">${new Date(task.deadline).toLocaleString().slice(0, -10)}</span>
        <input tabindex="4" class="input-task-deadline" type="date" value="${euDateToUtc(new Date(task.deadline).toLocaleString().slice(0, -10))}">
        <span class="task-added-at">${new Date(task.addedAt).toLocaleString()}</span>
    </div>
    `.trim();
}


/**
 * moves a task from one column to the other
 * 
 * @param { string } taskId     - the ID of the task to move
 * @param { string } columnId   - the ID of the column the task will be moved to
 */
function moveTaskToColumn(taskId, columnId) {
    tasks[findTasksIndex(taskId)].columnId = columnId;
    writeAllTasksToBackend();
}


/**
 * removes a task from the DOM
 * 
 * @param { object } task - the task's object from the tasks array
 */
function removeTaskFromColumn(task) {
    const taskItem = document.getElementById(task.id);
    const col = document.querySelector(`#${task.columnId} .column-body`);
    taskListeners.forEach(tl => taskItem.removeEventListener(tl.evt, tl.callback));
    col.removeChild(taskItem);
}


/******************************
**     utility functions     **
******************************/


function findTaskById(taskId) {
    return tasks[tasks.findIndex(task => task.id == taskId)] || "";
}


function findTasksByColumn(ColumnId) {
    return tasks.filter(task => task.columnId == ColumnId);
}


function findTasksIndex(taskId) {
    return tasks.findIndex(task => task.id == taskId);
}


function parseEuDate(date) {
    return new Date(date.split(".").map((d, i) => (i == 2) ? (d.length == 1 ? "200" + d : "20" + d).slice(-4) : ("00" + d).slice(-2)).reverse().join("-")).getTime();
}


function euDateToUtc(date) {
    return date.split(".").map((d, i) => (i == 2) ? (d.length == 1 ? "200" + d : "20" + d).slice(-4) : ("00" + d).slice(-2)).reverse().join("-");
}


/************************************
**       event listeners and       **
**       related functions         **
*************************************/


/**
 * listenes for clicks on the
 * add-task button of a column
 * 
 * @param { string } colId  - the ID of the colunm which the task is added to
 * @param { object } e      - the event object
 */
function addTaskListener(colId, e) {
    if (e.target.id == colId + "-new-task") {
        e.stopPropagation();
        insertUserAddedTask(e);
    }
}


/**
 * adds a new task's template to the
 * column targeted by the event object 
 * 
 * @param { object } e - the event object
 */
function insertUserAddedTask(e) {
    const col = e.target.parentNode;
    console.log("add task to '" + col.id + "'\n");
    addTask(col.id, "neue Aufgabe", "Beschreibung", "allgemein", 1, euDateToUtc(new Date().toLocaleString().slice(0, -10)), "nobody");
    showTasks();
}


/**
 * listens for clicks on a task and 
 * performs specific action on that task
 * 
 * @param { string } taskId - the ID of the task
 * @param { object } e - the event object
 */
function taskClicked(taskId, e) {
    const te = getTaskElement(taskId);      // get references to the task's DOM elements
    if (e.target == te.priority) {
        nextPriority(taskId, te);           // switch to next priority
        return;                             // do not change editable state
    }
    if (e.target == te.inCharge) {
        nextPersonInCharge(taskId, te);     // switch to the next team member
        return;                             // do not change editable state
    }
    (te.taskMenu.style.display = "none") ? taskEditable(e, te) : e.target.focus();
    checkMenuItemClicked(e, te, taskId);
    checkClickedOutside(te, taskId);
}


/**
 * check if something outside the edited task element has been touched
 * needed just for some iOS versions since click events are not always triggered
 * and touch events do not move the focus 
 * 
 * @param { object } te - an object containing references to a task and it's children
 * @param { string } taskId - the ID of the task
 */
function checkClickedOutside(te, taskId) {
    setTimeout(() => {
        document.addEventListener('touchstart', e => {
            if (e.target.classList.contains('column') || e.target.classList.contains('board')) {
                setEditedTasksValues(te, findTasksIndex(taskId));
                te.task.draggable = true;
                te.column.draggable = true;
                te.task.style.cursor = "grab";
                e.target.focus();
            }
        }, { once: true });
    }, 200);
}


/**
 * check if something inside the task's menu has been clicked
 * and perform the desired action
 * 
 * @param { object } e - the event object
 * @param { object } te - an object containing references to a task and it's children
 * @param { string } taskId - the ID of the task
 */
function checkMenuItemClicked(e, te, taskId) {
    if (e.target.classList.contains("close-task")) {        // close icon has been clicked
        te.details.style.display = "none";                  // hide task's details 
        te.taskMenu.style.display = "none";                 // and action menu bar
        setEditedTasksValues(te, findTasksIndex(taskId));
        taskNonEditable(te);
    }
    if (e.target.classList.contains("delete-task")) {       // delete icon has been clicked
        const task = findTaskById(taskId);                                          // either move task to the trash column
        (task.columnId == "trash") ? removeTask(taskId) : moveTaskToTrash(task);    // or remove it entirely if it was already there
        showTasks();
    }
}


/**
 * does what the functions's name implies
 * 
 * @param { object } task - the task object to perform the action on
 */
function moveTaskToTrash(task) {
    removeTaskFromColumn(task);
    moveTaskToColumn(task.id, "trash");
}


/**
 * get a task's DOM elements
 * 
 * @param { string } taskId - the ID of the task 
 * @returns { object } - references to the task and it's children
 */
function getTaskElement(taskId) {
    const c = findTaskById(taskId).columnId;
    return {
        task: document.querySelector(`#${taskId}`),
        category: document.querySelector(`#${taskId} .task-category`),
        priority: document.querySelector(`#${taskId} .task-priority`),
        inCharge: document.querySelector(`#${taskId} .task-incharge`),
        title: document.querySelector(`#${taskId} .task-title`),
        details: document.querySelector(`#${taskId} .task-description`),
        deadline: document.querySelector(`#${taskId} .task-deadline`),
        inputDeadline: document.querySelector(`#${taskId} .input-task-deadline`),
        taskMenu: document.querySelector(`#${taskId} .task-menu`),
        column: document.querySelector(`#${findTaskById(taskId).columnId}`),
    }
}


/**
 * make a task editalble by the user
 * 
 * @param { object } e - event object
 * @param { object} taskElement - an object containing references to a task and it's children
 */
function taskEditable(e, taskElement) {
    taskElement.task.style.cursor = "text";
    taskElement.details.style.display = "block";    // show task's details
    taskElement.taskMenu.style.display = "flex";    // and menue
    taskElement.inputDeadline.style.display = "block";  // show date input field
    taskElement.deadline.style.display = "none";        // hide date display field
    taskElement.task.draggable = false;     // do not drag the task
    taskElement.column.draggable = false;   // while in edit mode 
    taskElement.category.removeAttribute('readonly');    // make the task's children
    taskElement.title.removeAttribute('readonly');       // elements editable
    taskElement.details.removeAttribute('readonly');
    (e.target.classList.contains("task-deadline")) ? taskElement.inputDeadline.focus() : e.target.focus(); // set focus to the clicked element
    //taskElement.column.parentElement.firstElementChild.style.cursor = "default";
}


/**
 * switch a task to the next priority option
 * 
 * @param { string } taskId - the ID of the task
 * @param { object } te - an object containing references to a task and it's children
 */
function nextPriority(taskId, te) {
    if (priorities.length) {
        const tasksIndex = findTasksIndex(taskId);
        (tasks[tasksIndex].priority < priorities.length - 1) ? tasks[tasksIndex].priority++ : tasks[tasksIndex].priority = 0;
        te.priority.textContent = priorities[tasks[tasksIndex].priority] || "none";
        writeAllTasksToBackend();
    }
}


/**
 * assign a task to the next person in charge option
 * 
 * @param { string } taskId - the ID of the task
 * @param { object } te - an object containing references to a task and it's children
 */
function nextPersonInCharge(taskId, te) {
    if (inCharge.length) {
        const tasksIndex = findTasksIndex(taskId);
        const personsIndex = inCharge.findIndex(person => person == te.inCharge.textContent.trim().slice(0, -1));
        te.inCharge.textContent = (personsIndex < inCharge.length - 1) ? inCharge[personsIndex + 1] : inCharge[0];
        tasks[tasksIndex].inCharge = te.inCharge.textContent;
        te.inCharge.textContent += ":";
        writeAllTasksToBackend();
    }
}


/**
 * listens for a task's element going out of focus
 * resets editable state + initiates furter processing
 * 
 * @param { string } taskId - the ID of the task
 * @param { object } e - the event object
 */
function taskOutOfFocus(taskId, e) {
    const taskElement = getTaskElement(taskId);
    if (e.target == taskElement.category || e.target == taskElement.title || e.target == taskElement.details || e.target == taskElement.inputDeadline) {
        //taskNonEditable(taskElement);
        setEditedTasksValues(taskElement, findTasksIndex(taskId));
        taskElement.task.draggable = true;
        taskElement.column.draggable = true;
        taskElement.task.style.cursor = "grab";
    }
}


/**
 * resets a task's editable state 
 * 
 * @param { object } taskElement - an object containing references to a task and it's children
 */
function taskNonEditable(taskElement) {
    window.getSelection().removeAllRanges();
    taskElement.inputDeadline.style.display = "none";
    taskElement.deadline.style.display = "block";
    taskElement.category.setAttribute('readonly', 'readonly');  // note we are using readonly instead 
    taskElement.title.setAttribute('readonly', 'readonly');     // of the disabled attribute for click 
    taskElement.details.setAttribute('readonly', 'readonly');   // events to be triggered
    taskElement.task.draggable = true;
    taskElement.column.draggable = true;
    taskElement.task.style.cursor = "grab";
    taskElement.deadline.textContent = new Date(taskElement.inputDeadline.value).toLocaleString().slice(0, -10)
    //taskElement.column.parentElement.firstElementChild.style.cursor = "grab";
}


/**
 * move edited task values to the tasks array
 * and write it to the backend
 * 
 * @param { object } taskElement - an object containing references to a task and it's children
 * @param { number } taskIndex - the index of the task inside the tasks array
 */
function setEditedTasksValues(taskElement, taskIndex) {
    tasks[taskIndex].category = taskElement.category.value;
    tasks[taskIndex].title = taskElement.title.value;
    tasks[taskIndex].description = taskElement.details.value;
    tasks[taskIndex].deadline = new Date(taskElement.inputDeadline.value).getTime();
    writeAllTasksToBackend();
}


/*********************************
**  backend stuff               **
**  if not commented otherwise, **
**  the functions do what the   **
**  function's names implies    **
*********************************/


function readAllTasksFromBackend() {
    readTaskSettingsFromBackend();
    const tasksData = readTasks() || [];
    tasksData.forEach(task => {
        const taskData = convertForeignData(task);
        const tasksIndex = findTasksIndex(taskData.id);
        (tasksIndex < 0) ? tasks.push(taskData) : tasks.splice(tasksIndex, 1, taskData);
    });
    showTasks();
}


function readTaskSettingsFromBackend() {
    const settings = readSettings();
    const priorityData = settings.priorities || (defaultPriorities);
    const personsData = settings.persons || [];
    const categoryData = settings.categories || (defaultCategories);
    priorityData.forEach(p => priorities.push(p));
    personsData.forEach(p => inCharge.push(p));
    categoryData.forEach(p => categories.push(p));
    writeTaskSettingsToBackend();
}


function writeAllTasksToBackend() {
    //tasks.forEach(task => task.assignedTo = task.inCharge); // match different field name used by co-workers
    writeTasks(tasks);
    writeTaskSettingsToBackend();
}


async function writeTaskSettingsToBackend() {
    writeSettings({ priorities: priorities, persons: inCharge, categories: categories });
    await writeCommit();
}


// convert foreign data to match our data structure
function convertForeignData(data) {
    data.inCharge = ('assignedTo' in data) ? data.assignedTo : inCharge[0];
    data.assignedTo = data.inCharge;
    data.id = (data.id.startsWith("t")) ? data.id : "t" + data.id;
    data.id = (data.id.length != 17) ? 't' + Date.now() + String(Math.floor(Math.random() * 1000)) : data.id;
    console.log("task data: ", data, "\n");
    return data;
}



export { tasks, priorities, inCharge, categories, currentlyDraggedTask, parseEuDate, euDateToUtc };
export { findTaskById, findTasksIndex, findTasksByColumn, removeTaskFromColumn };
export { moveTaskToColumn, showTasks, addTask, removeTask, taskTemplate, taskClicked };
export { readAllTasksFromBackend, writeAllTasksToBackend };
export { addTaskListener as columnFooterClicked };
