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
    active: false,
}


/**
 * start touch action - reset dragged element   
 * to empty string and store touched coordinates
 * 
 * @param { string } id - the ID of the touched task or column
 * @param { object } e - the event object
 */
function touchStart(id, e) {
    e.preventDefault();
    //e.stopPropagation();
    currentlyDraggedTask.id = "";
    currentlyDraggedColumn.id = "";
    touch.x = parseInt(e.changedTouches[0].clientX);
    touch.y = parseInt(e.changedTouches[0].clientY);
}


/**
 * initiate drag action - store touched coordinates
 * and initialize dragging for either task or column
 * 
 * @param { string } id - the ID of the touched task or column
 * @param { object } e - the event object
 */
function touchMove(id, e) {
    e.preventDefault();
    e.stopPropagation();
    touch.x = parseInt(e.changedTouches[0].clientX);
    touch.y = parseInt(e.changedTouches[0].clientY);
    const touchedElement = document.getElementById(id);
    (touchedElement.classList.contains("task")) ? touchMoveTask(e, id) : touchMoveColumn(e, id);
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
    e.stopPropagation();
    (currentlyDraggedTask.id) ? touchHandleDraggedTask() : false;
    (currentlyDraggedColumn.id) ? touchHandleDraggedColumn() : false;
    touchHandleMobileClick(e, id);
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
    positionDraggedColumnRegularly();
    removePlaceholderColumn();
    moveColumn(currentlyDraggedColumn.id, getTouchTargetColumn());
    showTasks();
    getColumnsProperties();
}


/** task or column has been touched
 *  some iOS / iPadOS versions do not trigger click events
 *  on some elements so let's do it here
 * 
 * @param { object } e - the event object
 * @param { string } id - the ID of the touched task or column 
 */
function touchHandleMobileClick(e, id) {
    if (findTaskById(id) && !currentlyDraggedTask.id && !currentlyDraggedColumn.id) {
        e.target.click();
    }
    if (findColumnById(id)) {
        e.target.click();
    }
}


/**
 * dragging action has been aborted abnormally
 * reset dragging action to 'never happened'
 * 
 * @param { string } id - the ID of the touched task or column
 * @param { object } e - the event object
 */
function touchCancel(id, e) {
    e.stopPropagation();
    removeTouchHighlighting();
    if (currentlyDraggedTask.id) {
        removeDraggedTaskHighlighting();
        positionDraggedTaskRegularly();
        removePlaceholderFromColumn();
    }
    if (currentlyDraggedColumn.id) {
        positionDraggedColumnRegularly();
        removePlaceholderColumn();
    }
    showTasks();
}


/**
 * position column regularly
 */
function positionDraggedColumnRegularly() {
    const col = document.getElementById(currentlyDraggedColumn.id);
    col.style.position = "";
    col.style.top = "";
    col.style.left = "";
    col.style.width = "";
    col.style.height = "";
}


/**
 * position task regularly
 */
function positionDraggedTaskRegularly() {
    const task = document.getElementById(currentlyDraggedTask.id);
    task.style.position = "";
    task.style.top = "";
    task.style.left = "";
    task.style.width = "";
    task.style.height = "";
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


/**
 * highlight the column which an item has been dragged over 
 */
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


/**
 * remove higlighting from all columns 
 */
function removeTouchHighlighting() {
    columns.forEach(column => {
        const col = document.getElementById(column.id);
        col.style.backgroundColor = "";
    });
}


/** does what the function's name implies */
function positionTouchedTaskFreely() {
    const task = document.getElementById(currentlyDraggedTask.id);
    const pos = task.getBoundingClientRect();
    task.style.position = "fixed";
    task.style.width = currentlyDraggedTask.boundingRect.width + "px";
    task.style.height = currentlyDraggedTask.boundingRect.height + "px";
    task.style.left = touch.x - (pos.width / 2) + "px";
    task.style.top = touch.y - (pos.height / 2) + "px";
}


/** does what the function's name implies */
function positionTouchedColumnFreely() {
    const col = document.getElementById(currentlyDraggedColumn.id);
    col.style.position = "fixed";
    col.style.width = currentlyDraggedColumn.boundingRect.width + "px";
    col.style.height = currentlyDraggedColumn.boundingRect.height + "px";
    getColumnsProperties();
    const pos = col.getBoundingClientRect();
    col.style.left = touch.x - (pos.width / 2) + "px";
    col.style.top = touch.y < (pos.height / 2) ? pos.top + "px" : touch.y - (pos.height / 2) + "px";
}


/** add a placeholder DIV for the currently
 * dragged task to the source column   */
function addPlaceholderToColumn() {
    if (!touch.active) {
        touch.active = true;
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
    if (touch.active) {
        touch.active = false;
        const column = document.querySelector(`#${currentlyDraggedTask.sourceColumn} .column-body`);
        const placeholder = document.getElementById("touched");
        column.removeChild(placeholder);
    }
}


/** add a placeholder DIV in place of 
 * the currently dragged column   */
function addPlaceholderColumn() {
    if (!touch.active) {
        touch.active = true;
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
 * column's placeholder DIV   */
function removePlaceholderColumn() {
    if (touch.active) {
        touch.active = false;
        currentlyDraggedColumn.placeholder.removeFrom(currentlyDraggedColumn.placeholder.board);
        currentlyDraggedColumn.placeholder = {};
    }
}



export { touch, touchStart, touchMove, touchEnd, touchCancel };