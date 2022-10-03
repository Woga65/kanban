import { Column } from "./column.class.js";
import { dragOver, dragLeave, drop } from "./dragdrop/mouse.js";
import { startDragging, stopDragging, dragging } from "./dragdrop/mouse.js";
import { touchStart, touchMove, touchEnd, touchCancel, } from "./dragdrop/touch.js";
import { findTasksByColumn, moveTaskToColumn, showTasks, columnFooterClicked } from "./tasks.js";
import { attachAddColumnListeners } from "./column-user-func.js";
import { readColumns, readRemovedColumns, writeColumns, writeRemovedColumns, writeCommit } from "./backend.js";
import { setupModal, getSettings, editPersons, editPriorities } from "./edit-settings.js";


const userAddedColumn = `
<div id="add-column-link">Liste hinzufügen</div>
<div id="enter-new-column" style="display: none;">
    <div id="add-column-input-bg"></div>
    <input id="add-column-input" name="add-column-input" type="text" maxlength="20" placeholder="click to change color">
    <div id="add-column-buttons">
        <button id="add-column-cancel">Abbrechen</button>
        <button id="add-column-now">Hinzufügen</button>
    </div>
</div>
`.trim();

const defaultColumns = [
    { id: "todo", title: "to-do", color: { accent: "rgba(30, 30, 30, .2)" }, minimized: false, board: "board", protected: true },
    { id: "inprogress", title: "in progress", color: { accent: "rgba(255, 0, 0, .2)" }, },
    { id: "testing", title: "testing", color: { accent: "rgba(0, 255, 0, .2)" }, },
    { id: "complete", title: "complete", color: { accent: "rgba(0, 0, 255, .2)" }, },
    { id: "discussing", title: "discussing", color: { accent: "rgba(128, 255, 255, .9)" }, },
    { id: "add-column", title: userAddedColumn, color: { accent: "#2369a4", title: "white" }, minimized: true, board: "board", protected: true },
];

const columns = [];
const removedColumns = [];
const maximumRemovedColumns = 8;
const currentlyDraggedColumn = { id: "", placeholder: {} };

const columnListeners = [
    { evt: "dragover", callback: dragOver },
    { evt: "dragleave", callback: dragLeave },
    { evt: "drop", callback: drop },
    { evt: "dragstart", callback: startDragging },
    { evt: "dragend", callback: stopDragging },
    { evt: "touchstart", callback: touchStart },
    { evt: "touchmove", callback: touchMove },
    { evt: "touchend", callback: touchEnd },
    { evt: "touchcancel", callback: touchCancel },
    { evt: "click", callback: removeColumnListener },
    { evt: "click", callback: columnFooterClicked },
];



/**
 * create a new column an add it to the DOM
 * 
 * @param { string } colId - ID of the column to create
 * @param { string } title - title of the column 
 * @param { object } color - an object containing the column's colors
 * @param { boolean } minimized - true: the column belongs to the UI, false: regular column
 * @param { boolean } protectedCol - column cannot|can be deleted by the user
 * @param { string } boardId - the DOM element the column will be added to
 * @param { string } beforeCol - insert the column before column ID 
 * @returns { object | string } - the column object pushed to the colums array or an empty string
 */
function addColumn(colId, title, color, minimized, protectedCol, boardId, beforeCol) {
    const col = new Column(colId, title, color, minimized);
    col.listeners = columnListeners;
    col.protected = protectedCol || false;
    col.appendTo(boardId || "board", beforeCol);
    if (col.protected && !col.minimized) document.getElementById(`${col.id}-close`).classList.add("disabled");
    (columns.length && columns[columns.length - 1].id == "add-column") ? columns.splice(columns.length -1, 0, col) : columns.push(col);
    return columns[columns.findIndex(column => column.id == colId)] || "";
}


/**
 * remove a column from the DOM and from the column's array
 * 
 * @param { string } colId - the ID of the column to remove
 * @returns { object[] } - an array of task objects that are assigned to the removed column
 */
function removeColumn(colId) {
    const colIndex = findColumnsIndex(colId);
    const toRemove = columns[colIndex] || "";
    if (toRemove && !toRemove.protected) {
        backupRemovedColumn(toRemove, colIndex);
        toRemove.removeFrom(toRemove.board);
        columns.splice(colIndex, 1);
        getColumnsProperties();
        //findTasksByColumn(colId).forEach(task => moveTaskToColumn(task.id, "trash"));
    }
    return (!toRemove.protected) ? findTasksByColumn(colId) : [];
}


/**
 * store a column on top of the undo-stack
 * remove a column from the bottom of the
 * undo-stack, if the max lenght is exceeded
 * 
 * @param { object } column - the column object to be stored on top of the undo-stack 
 * @param { number } index  - the index where the column was stored in the column's array
 * @returns { object | boolean } - the object that has been stored on top of the undo-stack or false
 */
function backupRemovedColumn(column, index) {
    document.getElementById("undo").style.color = "black";
    if (removedColumns.length >= maximumRemovedColumns) removedColumns.shift();
    return (column.id != "add-column") ? removedColumns.push({ index: index, column: column }) : false;
}


/**
 * restore either a specific column or the column on top of the undo-stack
 * 
 * @param { number} index - the index of the to be restored column inside the undo-stack or -1 
 * @param { object } e - the event object if the function is invoked by an event 
 */
function restoreColumn(index, e) {
    if (removedColumns.length) {
        const toRestore = (index < 0) ? removedColumns.pop() : removedColumns.splice(index, 1)[0];
        if (!document.getElementById(toRestore.id)) {
            const beforeColumn = columns[(toRestore.index < columns.length) ? toRestore.index : columns.length - 1].id;
            toRestore.column.appendTo(toRestore.column.board, beforeColumn);
            columns.splice(toRestore.index, 0, toRestore.column);
            showTasks();
            getColumnsProperties();
        }
        writeAllColumnsToBackend();
    }
    document.getElementById("undo").style.color = (removedColumns.length) ?  "black" : "grey";
}


/**
 * move a column form one place to the other in the DOM and in the column's array
 * 
 * @param { string } sourceColumn - the ID of the column to be moved
 * @param { string } targetColumn - the ID of the the column which the moved column will be inserted before or after
 */
function moveColumn(sourceColumn, targetColumn) {
    if (sourceColumn && targetColumn && targetColumn != sourceColumn) {
        const ti = findColumnsIndex(targetColumn);
        const tc = (ti > findColumnsIndex(sourceColumn) && ti < columns.length - 1) ? columns[ti + 1].id : targetColumn; 
        const column = columns.splice(findColumnsIndex(sourceColumn), 1)[0];
        column.removeFrom(column.board);
        column.appendTo(column.board, tc);
        columns.splice(findColumnsIndex(tc), 0, column);
        getColumnsProperties();
        writeAllColumnsToBackend();
        console.log("dropped " + sourceColumn + " onto " + targetColumn);
    }
}


/** initialize the kanban board's columns/lists and UI
 *  uses either the data read from the backend or the default data */
function initColumns() {
    const columnsData = readColumnsFromBackend() || defaultColumns;
    columnsData.forEach(column => addColumn(column.id, column.title, column.color, column.minimized || false, column.protected || false, column.board || "board"));
    readRemovedColumnsFromBackend();
    window.addEventListener("resize", resizeViewportListener);
    window.addEventListener("scroll", resizeViewportListener);
    attachAddColumnListeners();
    setupUI();
}


/** setup the board's user interface and related elements */
function setupUI() {
    setupMenuIconBar();
    setupModal();
}


/** setup the menu icon bar */
function setupMenuIconBar() {
    const parent = document.getElementById("board-container");
    const menuCol = document.createElement("div");
    menuCol.classList.add("menu-icon-bar");
    setupUndoIcon(menuCol);
    setupUsersIcon(menuCol);
    setupPrioritiesIcon(menuCol);
    setupListIcon(menuCol);
    setupSettingsIcon(menuCol);
    parent.appendChild(menuCol);
}


/** setup the undo icon */
function setupUndoIcon(parent) {
    const undo = document.createElement("div");
    undo.id = "undo";
    undo.innerHTML = "&#xee0b;";
    undo.style.color = (removedColumns.length) ? "black" : "grey";
    parent.appendChild(undo);
    undo.addEventListener("click", restoreColumn.bind(null, -1));
}


/** setup the users icon */
function setupUsersIcon(parent) {
    const users = document.createElement("div");
    users.id = "users";
    users.innerHTML = "&#xed01;";
    users.style.color = "black";
    parent.appendChild(users);
    users.addEventListener("click", editPersons);
}


/** setup the priorties icon */
function setupPrioritiesIcon(parent) {
    const prio = document.createElement("div");
    prio.id = "priorities";
    prio.innerHTML = `<img src="./img/priority.svg">`;
    prio.style.color = "black";
    parent.appendChild(prio);
    prio.addEventListener("click", editPriorities);
}


/** setup the add list icon */
function setupListIcon(parent) {
    const list = document.createElement("div");
    list.id = "add-list";
    list.innerHTML = `<img src="./img/icons8-add-properies-26.png">`;
    list.style.color = "black";
    parent.appendChild(list);
    list.addEventListener("click", () => {
        document.getElementById('add-column-link').click();
        document.getElementById('add-column-input').focus();
    });
}


/** setup the settings icon */
function setupSettingsIcon(parent) {
    const settings = document.createElement("div");
    settings.id = "settings";
    settings.innerHTML = "&#xef3a;";
    settings.style.color = "black";
    settings.style.display = "none";
    parent.appendChild(settings);
    //settings.addEventListener("click", changeSettings);
}


/** get the columns screen positions and sizes */
function getColumnsProperties() {
    columns.forEach(column => column.update());
}


/** as the name of the function implies */
function resizeViewportListener() {
    getColumnsProperties();
}


/**
 * find a column by it's ID
 * 
 * @param { string } colId - the ID of the column to look for 
 * @returns { object | string } - the found column object or an empty string 
 */
function findColumnById(colId) {
    return columns[columns.findIndex(column => column.id == colId)] || "";
}


/**
 * find a columns index
 * 
 * @param { string } colId - the ID of the column to look for
 * @returns { number } - the index of the column inside the columns array or -1
 */
function findColumnsIndex(colId) {
    return columns.findIndex(column => column.id == colId);
}


/**
 * find a removed column by it's ID 
 * 
 * @param { string } colId - the ID of the column to look for 
 * @returns { object | string } - the found column object or an empty string 
 */
function findRemovedColumnById(colId) {
    const rc = removedColumns.find(rc => rc.column.id == colId) || "";
    return (rc) ? rc.column.id : "";
}


/**
 * find a removed columns index
 * 
 * @param { string } colId - the ID of the column to look for
 * @returns { number } - the index of the column inside the undo-stack or -1
 */
function findRemovedColumnsIndex(colId) {
    return removedColumns.findIndex(rc => rc.column.id == colId);
}


/**
 * event listener, removes a column when the close icon is clicked
 * 
 * @param { string } colId - the ID of the column to be removed
 * @param { object } e - event object 
 */
function removeColumnListener(colId, e) {
    if (e.target.id == colId + "-close" && ![...e.target.classList].includes('disabled')) {
        e.stopPropagation();
        const tasks = removeColumn(colId);
        writeAllColumnsToBackend();
    }
}


/*********************************************************
**  backend stuff                                       **
**  the functions do what the function's names implies  **
*********************************************************/


function readColumnsFromBackend() {
    return readColumns();
}


function readRemovedColumnsFromBackend() {
    const removedCols = readRemovedColumns() || [];
    removedCols.forEach(rc => {
        const col = new Column(rc.column.id, rc.column.title, rc.column.color, rc.column.minimized);
        col.listeners = columnListeners;
        col.board = rc.column.board;
        col.protected = rc.column.protected || false;
        removedColumns.push({ index: rc.index, column: col });
    });
}


async function writeAllColumnsToBackend() {
    writeColumns(columns);
    writeRemovedColumns(removedColumns);
    await writeCommit();
}


export { columns, columnListeners, currentlyDraggedColumn,};
export { initColumns, addColumn, removeColumn, restoreColumn, moveColumn };
export { getColumnsProperties, findColumnById, findColumnsIndex, findRemovedColumnById, findRemovedColumnsIndex };
export { readColumnsFromBackend, writeAllColumnsToBackend }
export { removeColumnListener as closeColumnClicked };
