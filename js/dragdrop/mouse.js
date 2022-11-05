import { columns, currentlyDraggedColumn, moveColumn, getColumnsProperties } from "../columns.js";
import { currentlyDraggedTask } from "../tasks.js";
import { findTaskById, removeTaskFromColumn, moveTaskToColumn, showTasks } from "../tasks.js";


// drag & drop support

const board = document.getElementById('board-container');


function startDragging(id, e) {
    e.stopPropagation();
    document.addEventListener('dragover', scrollIfNeeded, false);
    e.dataTransfer.dropEffect = 'move';
    e.dataTransfer.setData('text/plain', 'hello');
    e.target.classList.contains("task") ? startDraggingTask(id) : startDraggingColumn(id);
    getColumnsProperties();
}


function scrollIfNeeded(e) {    //auto scroll while dragging to the left not working properly with some browsers
    if (e.pageX <= 64) board.scrollBy(-10, 0);
}


function startDraggingTask(id) {
    const task = findTaskById(id);
    if (task) {
        currentlyDraggedTask.id = task.id;
        currentlyDraggedTask.sourceColumn = task.columnId;
        highlightDraggedTask();
    }
    currentlyDraggedColumn.id = "";
}


function startDraggingColumn(id) {
    currentlyDraggedTask.id = "";
    currentlyDraggedColumn.id = id;
}


function stopDragging(taskId, e) {
    document.removeEventListener('dragover', scrollIfNeeded, false);
    if (findTaskById(currentlyDraggedTask.id)) {
        removeDraggedTaskHighlighting();
        currentlyDraggedTask.id = "";
    }
    currentlyDraggedColumn.id = "";
}


function dragging(taskId, e) {
    //console.log("drag: ", e);
}


function dragOver(colId, e) {
    e.preventDefault();
    // e.dataTransfer.dropEffect = 'copy';
    highlight(e, colId);
}


function drop(colId, e) {
    e.preventDefault();
    if (columns.some(c => c.id == colId && !c.minimized)) {
        if (currentlyDraggedTask.id) {
            const task = findTaskById(currentlyDraggedTask.id);
            removeTaskFromColumn(task);
            moveTaskToColumn(task.id, colId);
        }
        moveColumn(currentlyDraggedColumn.id, colId);
        document.getElementById(colId).style.backgroundColor = "";
        currentlyDraggedTask.id = "";
        currentlyDraggedColumn.id = "";
        showTasks();
        getColumnsProperties();
    }
}


function highlight(e, colId) {
    if (columns.some(c => c.id == colId && !c.minimized) && colId != currentlyDraggedTask.sourceColumn) {
        e.dataTransfer.dropEffect = 'copy';
        const col = document.getElementById(colId);
        col.style.backgroundColor = window.getComputedStyle(col).borderColor;
    }
}


function dragLeave(colId, e) {
    if (columns.some(c => c.id == colId)) {
        document.getElementById(colId).style.backgroundColor = "";
    }
}


function highlightDraggedTask() {
    const task = document.getElementById(currentlyDraggedTask.id);
    task.style.backgroundColor = window.getComputedStyle(task).borderColor;
}


function removeDraggedTaskHighlighting() {
    document.getElementById(currentlyDraggedTask.id).style.backgroundColor = "";
}


// for debugging
/*
function logDragEvent(dragEvent) {
    const col = document.getElementById("testing") || "";
    const test = document.getElementById("test") || "";
    if (col) {
        (test) ? col.removeChild(test) : false;
        col.innerHTML += '<div id="test">' + dragEvent + '</div>';
    }
}
*/


export {
    startDragging, stopDragging, dragOver, drop, dragLeave, dragging,
    highlightDraggedTask, removeDraggedTaskHighlighting,
};