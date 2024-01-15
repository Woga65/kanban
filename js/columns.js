import { Column } from "./column.class.js";
import { dragOver, dragLeave, drop } from "./dragdrop/mouse.js";
import { startDragging, stopDragging, dragging } from "./dragdrop/mouse.js";
import { touchStart, touchMove, touchEnd, touchCancel, } from "./dragdrop/touch.js";
import { findTasksByColumn, columnFooterClicked } from "./tasks.js";
import { attachAddColumnListeners } from "./column-user-func.js";
import { readColumns, writeColumns, writeCommit, readHiddenColumns, writeHiddenColumns } from "./backend.js";
import { refreshIconsState } from "./menu-icon-bar.js";
import localize from "./localize.js";


/** @todo Move handling of special columns out of column.class.js and handle it here*/
const userAddedColumn = localize().addColumn;

const defaultColumns = [
    { id: "todo", title: "to-do", color: { accent: "rgba(30, 30, 30, .2)", text: "var(--primary-color)", title: "var(--primary-color)" }, minimized: false, protected: true, hidden: false, board: "board" },
    { id: "inprogress", title: "in progress", color: { accent: "rgba(255, 0, 0, .2)", text: "var(--primary-color)", title: "var(--primary-color)" }, },
    { id: "testing", title: "testing", color: { accent: "rgba(0, 255, 0, .2)", text: "var(--primary-color)", title: "var(--primary-color)" }, },
    { id: "complete", title: "complete", color: { accent: "rgba(0, 0, 255, .2)", text: "var(--primary-color)", title: "var(--primary-color)" }, },
    { id: "discussing", title: "discussing", color: { accent: "rgba(128, 255, 255, .9)", text: "var(--primary-color)", title: "var(--primary-color)" }, },
    { id: "add-column", title: "add column", color: { accent: "#2369a4", title: "var(--primary-bgr)" }, minimized: true, board: "board", protected: true },
];

const columns = [];
const hiddenColumns = [];
const currentlyDraggedColumn = { id: "", placeholder: {}, boundingRect: {} };

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
    { evt: "click", callback: hideColumnListener },
    { evt: "click", callback: columnFooterClicked },
];



/**
 * create a new column and add it to the DOM
 * If the colId includes an underscore, the column will be created
 * just in the DOM and not be stored in the columns array.
 * 
 * @param { string } colId - ID of the column to create.
 * @param { string } title - title of the column 
 * @param { object } color - an object containing the column's colors
 * @param { boolean } minimized - true: the column belongs to the UI, false: regular column
 * @param { boolean } hidden - the column hidden|visible
 * @param { boolean } protectedCol - column cannot|can be deleted by the user
 * @param { string } boardId - the DOM element the column will be added to
 * @param { string } beforeCol - insert the column before column ID 
 * @returns { object | string } - the column object pushed to the colums array or an empty string
 */
function addColumn(colId, title, color, minimized, hidden, protectedCol, boardId, beforeCol) {
    const col = new Column(colId, title, color, minimized, hidden, protectedCol || false);
    col.listeners = columnListeners;
    col.appendTo(boardId || "board", beforeCol);
    if (col.protected && !col.minimized) document.getElementById(`${col.id}-close`).classList.add("disabled");
    if (!colId.includes('_')) {
        (columns.length && columns[columns.length - 1].id == "add-column") 
            ? (beforeCol ? columns.splice(findColumnsIndex(beforeCol), 0, col) : columns.splice(columns.length - 1, 0, col))
            : columns.push(col);
    }
    return columns[columns.findIndex(column => column.id == colId)] || "";
}


/**
 * remove a column from the DOM and if needed from the column's array
 * 
 * @param { string } colId - the ID of the column to remove
 * @returns { object[] } - an array of task objects that are assigned to the removed column
 */
function removeColumn(colId) {
    if (removeNonDataColumn(colId)) return [];
    const colIndex = findColumnsIndex(colId);
    const toRemove = columns[colIndex] || ""; 
    if (toRemove) {
        if (hiddenColumns.includes(colId)) hiddenColumns.splice(findHiddenColumnsIndex(colId), 1);
        toRemove.removeFrom(toRemove.board);
        columns.splice(colIndex, 1);
        getColumnsProperties();
        refreshIconsState();
    }
    return findTasksByColumn(colId) || [];
}


/**
 * remove a column from the DOM without
 * looking for it in the columns array
 * 
 * @param { string } colId - the ID of the column to be removed 
 * @returns { boolean } - true if column is removed, false if not
 */
function removeNonDataColumn(colId) {
    const col = document.getElementById(colId);
    if (colId.includes('_') && col) {
        col.remove();
        return true;
    }
    return false;
}


/**
 * restore either a specific column or the column on top of the undo-stack
 * 
 * @param { number} index - the index of the to be restored column inside the undo-stack or -1 
 * @param { object } e - the event object if the function is invoked by an event 
 */
function restoreColumn(index, e) {
    if (hiddenColumns.length) { //sibi
        const toRestor = (index < 0) ? hiddenColumns.pop() : hiddenColumns.splice(index, 1)[0];
        console.log('i: ', index);
        console.log('to res: ', toRestor);
        columns[findColumnsIndex(toRestor)].show();
        getColumnsProperties();
        writeAllColumnsToBackend();
    }
    document.getElementById("undo").style.color = (hiddenColumns.length) ?  "black" : "grey";
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
        if (column.protected && !column.minimized) document.getElementById(`${column.id}-close`).classList.add("disabled");
        columns.splice(findColumnsIndex(tc), 0, column);
        getColumnsProperties();
        writeAllColumnsToBackend();
        console.log("dropped " + sourceColumn + " onto " + targetColumn);
    }
}


/** initialize the kanban board's columns/lists and UI
 *  uses either the data read from the backend or the default data */
function initColumns() {
    wipeBoard();
    readColumnsFromBackend();
    readHiddenColumnsFromBackend();
    window.addEventListener("resize", resizeViewportListener);
    window.addEventListener("scroll", resizeViewportListener);
    attachAddColumnListeners();
}


/* get rid of all columns remaining on the board */
function wipeBoard() {
    document.getElementById('board').innerHTML = '';
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
function findHiddenColumnById(colId) {
    return hiddenColumns.find(hc => hc == colId) || "";
}


/**
 * find a removed column's index
 * 
 * @param { string } colId - the ID of the column to look for
 * @returns { number } - the index of the column inside the undo-stack or -1
 */
function findHiddenColumnsIndex(colId) {
    return hiddenColumns.findIndex(hc => hc == colId);
}


/**
 * event listener, removes a column when the close icon is clicked
 * 
 * @param { string } colId - the ID of the column to be removed
 * @param { object } e - event object 
 */
function hideColumnListener(colId, e) {
    if (e.target.id == colId + "-close" && ![...e.target.classList].includes('disabled')) {
        e.stopPropagation();
        const col = columns[findColumnsIndex(colId)];
        col.hide();
        getColumnsProperties();
        hiddenColumns.push(col.id);
        document.getElementById("undo").style.color = "black";
        writeAllColumnsToBackend();
    }
}


/*********************************************************
**  backend stuff                                       **
**  the functions do what the function's names implies  **
*********************************************************/


function readColumnsFromBackend() {
    columns.splice(0, columns.length);
    const columnsData = readColumns() || defaultColumns;
    columnsData.forEach(column => addColumn(column.id, column.title, column.color, 
        column.minimized || false, column.hidden || false, column.protected || false, column.board || "board"));
}


function readHiddenColumnsFromBackend() {
    hiddenColumns.splice(0, hiddenColumns.length);
    (readHiddenColumns() || []).forEach(hc => hiddenColumns.push(hc));
}


async function writeAllColumnsToBackend() {
    writeColumns(columns);
    writeHiddenColumns(hiddenColumns);    
    await writeCommit();
}


export { columns, hiddenColumns, columnListeners, currentlyDraggedColumn, defaultColumns };
export { initColumns, addColumn, removeColumn, restoreColumn, moveColumn };
export { getColumnsProperties, findColumnById, findColumnsIndex, findHiddenColumnById, findHiddenColumnsIndex };
export { readColumnsFromBackend, writeAllColumnsToBackend };