import { Column } from "../column.class.js";
import { columns, currentlyDraggedColumn } from "../columns.js";
import { getColumnsProperties, findColumnById, moveColumn } from "../columns.js";
import { currentlyDraggedTask, taskTemplate } from "../tasks.js";
import { findTaskById, moveTaskToColumn, removeTaskFromColumn, showTasks, findTasksByColumn } from "../tasks.js";
import { highlightDraggedTask, removeDraggedTaskHighlighting, } from "./mouse.js";


// support for mobile touch devices

const touch = {
    x: 0,
    y: 0,
    dragging: false,
    long: false,
}

const touchTimer = {
    id: null,
    duration: 150,
}


/**
 * start touch action - reset dragged element   
 * to empty string and store touched coordinates
 * 
 * @param { string } id - the ID of the touched task or column
 * @param { object } e - the event object
 */
function touchStart(id, e) {
    document.getElementById(id).classList.add('ios-touch');
    longTouchDetectionTimer('start');
    currentlyDraggedTask.id = "";
    currentlyDraggedColumn.id = "";
    touch.x = parseInt(e.changedTouches[0].clientX);
    touch.y = parseInt(e.changedTouches[0].clientY);
    document.getElementById(id).addEventListener('contextmenu', preventContextMenu);
}


/**
 * initiate drag action - store touched coordinates
 * and initialize dragging for either task or column
 * 
 * @param { string } id - the ID of the touched task or column
 * @param { object } e - the event object
 */
function touchMove(id, e) {
    longTouchDetectionTimer('suspend');
    if (touch.long) {
        e.preventDefault();
        e.stopPropagation();
        touch.x = parseInt(e.changedTouches[0].clientX);
        touch.y = parseInt(e.changedTouches[0].clientY);
        /** @todo move the highlighting of the dragged element to the timer function */
        const touchedElement = document.getElementById(id);
        (touchedElement.classList.contains("task")) ? touchMoveTask(e, id) : touchMoveColumn(e, id);
    }
}


/**
 * initialize dragging action for task
 * 
 * @param { object } e - the event object
 * @param { string } id - the ID of the touched task 
 */
function touchMoveTask(e, id) {
    currentlyDraggedTask.id = id;
    currentlyDraggedColumn.id = "";
    currentlyDraggedTask.sourceColumn = findTaskById(id).columnId;
    currentlyDraggedTask.boundingRect = document.getElementById(id).getBoundingClientRect();
    addPlaceholderToColumn();
    highlightDraggedTask();
    highlightTouchedColumn();
    positionTouchedTaskFreely();
}


/**
 * initialize dragging action for column
 * 
 * @param { object } e - the event object
 * @param { string } id - the ID of the touched column 
 */
function touchMoveColumn(e, id) {
    if (id != "add-column") {
        currentlyDraggedTask.id = "";
        currentlyDraggedColumn.id = id;
        currentlyDraggedColumn.boundingRect = document.getElementById(id).getBoundingClientRect();
        addPlaceholderColumn();
        highlightTouchedColumn();
        positionTouchedColumnFreely();
    }
}


/**
 * end dragging or click action for 
 * either task or column
 * 
 * @param { string } id - the ID of the touched task
 * @param { object } e - the event object
 */
function touchEnd(id, e) {
    longTouchDetectionTimer('stop');
    e.stopPropagation();
    (currentlyDraggedTask.id) ? touchHandleDraggedTask() : false;
    (currentlyDraggedColumn.id) ? touchHandleDraggedColumn() : false;
    document.getElementById(id).removeEventListener('contextmenu', preventContextMenu);
}


/** 
 * task has been dragged 
 * move task from source to target column
 */
function touchHandleDraggedTask() {
    removeTouchHighlighting();
    removeDraggedTaskHighlighting();
    const colId = getTouchTargetColumn() || currentlyDraggedTask.sourceColumn;
    let task = findTaskById(currentlyDraggedTask.id);
    removeTaskFromColumn(task);
    moveTaskToColumn(currentlyDraggedTask.id, colId);
    removePlaceholderFromColumn();
    showTasks();
    getColumnsProperties();
}


/** 
 * column has been dragged 
 * move it to it's destination location
 */
function touchHandleDraggedColumn() {
    removeTouchHighlighting();
    positionDraggedItemRegularly(currentlyDraggedColumn);
    removePlaceholderColumn();
    moveColumn(currentlyDraggedColumn.id, getTouchTargetColumn());
    showTasks();
    getColumnsProperties();
}


/**
 * dragging action has been aborted abnormally
 * reset dragging action to 'never happened'
 * 
 * @param { string } id - the ID of the touched task or column
 * @param { object } e - the event object
 */
function touchCancel(id, e) {
    longTouchDetectionTimer('stop');
    e.stopPropagation();
    removeTouchHighlighting();
    if (currentlyDraggedTask.id) {
        removeDraggedTaskHighlighting();
        positionDraggedItemRegularly(currentlyDraggedTask);
        removePlaceholderFromColumn();
    }
    if (currentlyDraggedColumn.id) {
        positionDraggedItemRegularly(currentlyDraggedColumn);
        removePlaceholderColumn();
    }
    showTasks();
    document.getElementById(id).removeEventListener('contextmenu', preventContextMenu);
}


/**
 * after dragging finished, position the dragged item regularly
 * 
 * @param { object } currentlyDraggedItem - stored properties of the dragged item
 */
function positionDraggedItemRegularly(currentlyDraggedItem) {
    const item = document.getElementById(currentlyDraggedItem.id);
    item.style.position = "";
    item.style.top = "";
    item.style.left = "";
    item.style.width = "";
    item.style.height = "";
}


/**
 * get the target column for drag & drop
 * 
 * @returns { string } - the ID of the target column or an empty string 
 */
function getTouchTargetColumn() {
    let col = "";
    getColumnsProperties();
    columns.forEach(c => {
        if (touch.x >= c.x && touch.x <= c.x + c.width && touch.y >= c.y && touch.y <= c.y + c.height) {
            col = (c.minimized) ? "" : c.id;
        }
    });
    return col;
}


/** highlight the column which an item has been dragged over */
function highlightTouchedColumn() {
    getColumnsProperties();
    columns.forEach(c => {
        if (c.id != currentlyDraggedTask.sourceColumn || !currentlyDraggedTask.id) {
            const col = document.getElementById(c.id);
            switch (touch.x >= c.x && touch.x <= c.x + c.width && touch.y >= c.y && touch.y <= c.y + c.height) {
                case true:
                    col.style.backgroundColor = window.getComputedStyle(col).borderColor;
                    break;
                case false:
                    col.style.backgroundColor = "";
            }
        }
    });
}


/** remove higlighting from all columns */
function removeTouchHighlighting() {
    columns.forEach(column => {
        const col = document.getElementById(column.id);
        col.style.backgroundColor = "";
    });
}


/** does what the function's name implies */
function positionTouchedTaskFreely() {
    const task = initDraggedItemsPosition(currentlyDraggedTask);
    const pos = scrollIfNedded(task);
    task.style.left = touch.x - (pos.width / 2) + "px";
    task.style.top = touch.y - (pos.height / 2) + "px";
}


/** does what the function's name implies */
function positionTouchedColumnFreely() {
    const col = initDraggedItemsPosition(currentlyDraggedColumn);
    const pos = scrollIfNedded(col);
    col.style.left = touch.x - (pos.width / 2) + "px";
    col.style.top = touch.y < (pos.height / 2) ? pos.top + "px" : touch.y - (pos.height / 2) + "px";
    getColumnsProperties();
}


/** init size and position of the currently dragged item */
function initDraggedItemsPosition(currentlyDraggedItem) {
    const item = document.getElementById(currentlyDraggedItem.id);
    item.style.position = "fixed";
    item.style.width = currentlyDraggedItem.boundingRect.width + "px";
    item.style.height = currentlyDraggedItem.boundingRect.height + "px";
    item.style.left = currentlyDraggedItem.boundingRect.left + "px";
    item.style.top = currentlyDraggedItem.boundingRect.top + "px";
    return item;
}


/** scroll board if an item is dragged beyond the viewport */
function scrollIfNedded(item) {
    const board = document.getElementById('board-container');
    const boardSize = board.getBoundingClientRect();
    const itemPos = item.getBoundingClientRect();
    if (itemPos.left + itemPos.width > (window.innerWidth < boardSize.width ? window.innerWidth : boardSize.width)) board.scrollBy(10, 0);
    if (itemPos.left - (itemPos.width / 2) <= 0) board.scrollBy(-10, 0);
    if (currentlyDraggedTask.id) {
        if (itemPos.top + itemPos.height > (window.innerHeight < boardSize.height ? window.innerHeight : boardSize.height)) {
            board.scrollBy(0, 10);
        }
        if (itemPos.top <= 0) board.scrollBy(0, -10);
    }   
    return itemPos;
}


/** add a placeholder DIV for the currently
 * dragged task to the source column   */
function addPlaceholderToColumn() {
    if (!touch.dragging) {
        touch.dragging = true;
        const task = findTaskById(currentlyDraggedTask.id);
        const taskItem = document.getElementById(task.id);
        const column = document.querySelector(`#${currentlyDraggedTask.sourceColumn} .column-body`);
        const div = document.createElement("div");
        div.innerHTML = taskTemplate(task);
        div.id = "touched";
        div.classList.add("task");
        column.insertBefore(div, taskItem);
        div.style.backgroundColor = window.getComputedStyle(taskItem).borderColor;
        div.style.border = window.getComputedStyle(taskItem).border;
    }
}


/** remove the placeholder DIV for the currently
 * dragged task from the source column   */
function removePlaceholderFromColumn() {
    if (touch.dragging) {
        touch.dragging = false;
        const column = document.querySelector(`#${currentlyDraggedTask.sourceColumn} .column-body`);
        const placeholder = document.getElementById("touched");
        column.removeChild(placeholder);
    }
}


/** add a placeholder DIV in place of 
 * the currently dragged column   */
function addPlaceholderColumn() {
    if (!touch.dragging) {
        touch.dragging = true;
        const column = findColumnById(currentlyDraggedColumn.id);
        currentlyDraggedColumn.placeholder = setupPlaceholderColumn(column);
        cloneDraggedColumnsTasks(column.id);
    }
}


/**
 * bring a placeholder for a dragged column in place
 * 
 * @param { object } column - the dragged column
 * @returns { object } - the placeholder object
 */
function setupPlaceholderColumn(column) {
    const placeholder = new Column("touched-col", column.title, column.color, false);
    placeholder.listeners = [];
    placeholder.footerListener = {};
    placeholder.closeListener = {};
    placeholder.color.background = column.color.accent;
    placeholder.appendTo(column.board || "board", currentlyDraggedColumn.id);
    return placeholder
}


/**
 * find all tasks that belog to a column and bring
 * a placeholder for each of them in place
 * 
 * @param { string } colId - the column's Id 
 */
function cloneDraggedColumnsTasks(colId) {
    const placeholder = document.getElementById('touched-col');
    findTasksByColumn(colId).forEach(taskItem => {
        const div = document.createElement("div");
        div.innerHTML = taskTemplate(taskItem);
        div.classList.add("task");
        placeholder.insertBefore(div, placeholder.lastChild);
    });
}


/** remove the currently dragged   
 *  column's placeholder DIV   */
function removePlaceholderColumn() {
    if (touch.dragging) {
        touch.dragging = false;
        currentlyDraggedColumn.placeholder.removeFrom(currentlyDraggedColumn.placeholder.board);
        currentlyDraggedColumn.placeholder = {};
    }
}


/** manage timer for detection
 *  of long touch events     */
function longTouchDetectionTimer(command) {
    switch (command) {
        case 'start':
            startTouchDetectionTimer();
            break;
        case 'stop':
            stopTouchDetectionTimer();
            break;
        case 'suspend':
            suspendTouchDetectionTimer();
    }
}


/** start timer on touchstart */
function startTouchDetectionTimer() {
    if (!touchTimer.id) {
        touchTimer.id = setTimeout(_ => {
            touch.long = true;
        }, touchTimer.duration);
    }
}


/** stop timer and reset long-touch detection
 *  data on touchend and touchcancel */
function stopTouchDetectionTimer() {
    if (touchTimer.id) {
        clearTimeout(touchTimer.id);
        touch.long = false;
        touchTimer.id = null;
    }
}


/** stop timer without affecting long-touch
 *  detection data on touchmove */
function suspendTouchDetectionTimer() {
    if (touchTimer.id) {
        clearTimeout(touchTimer.id);
    }
}


/** prevent context menu from showing up when
 *  testing touch events on desktop browser */
function preventContextMenu(e) {
    e.preventDefault();
}



export { touch, touchStart, touchMove, touchEnd, touchCancel };