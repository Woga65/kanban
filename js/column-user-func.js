import { columns, addColumn, removeColumn, findRemovedColumnById, findRemovedColumnsIndex, restoreColumn, getColumnsProperties } from "./columns.js";
import { writeAllColumnsToBackend, readColumnsFromBackend } from "./columns.js";
import { showTasks } from "./tasks.js";


const columnColors = {
    choice: 0,
    colors: [
        { accent: "rgba(30, 30, 30, .2)", background: "white", text: "black", title: "black" },
        { accent: "rgba(255, 0, 0, .2)", background: "white", text: "black", title: "black" },
        { accent: "rgba(0, 255, 0, .2)", background: "white", text: "black", title: "black" },
        { accent: "rgba(0, 0, 255, .2)", background: "white", text: "black", title: "black" },
        { accent: "rgba(128, 255, 255, .9)", background: "white", text: "black", title: "black" },
        { accent: "darksalmon", background: "white", text: "black", title: "black" },
    ]
};


/**
 * inserts and renders a new column before the UI column
 * 
 * @param { string } newColumnId    - the ID of the new column that will be created
 * @param { string } newColumnTitle - a title for the column to be created
 */
function insertUserAddedColumn(newColumnId, newColumnTitle) {
    if (!document.getElementById(newColumnId)) {
        const column = columns[columns.length - 1];
        addColumn(newColumnId, newColumnTitle, columnColors.colors[columnColors.choice], false, false, column.board, "add-column"); 
        getColumnsProperties();
        writeAllColumnsToBackend();
        showTasks();
    }
}


/**
 * attaches event listeners to the UI column
 */
function attachAddColumnListeners() {
    const lt = validateAddColumnListenerTargets();
    if (lt.valid) {
        lt.link.parentNode.addEventListener('click', e => addColumnLinkListener(e, lt.link, lt.inputForm, lt.input));
        lt.input.addEventListener('click', e => inputFieldClicked(e));
        lt.cancelBtn.addEventListener('click', e => cancelButtonListener(e, lt.link, lt.inputForm, lt.input));
        lt.applyBtn.addEventListener('click', e => applyButtonListener(e, lt.link, lt.inputForm, lt.input));
        lt.input.addEventListener('input', e => inputFieldListener(e));
        lt.input.addEventListener('keyup', e => inputFieldKeyListener(e, lt.link, lt.inputForm, lt.input));
    }
}


/**
 * @returns { object }  - an object containing a flag indicating whether all elements are provided
 *                        correctly and if so references to the elements themselves
 */
function validateAddColumnListenerTargets() {
    const link = document.getElementById("add-column-link");
    const inputForm = document.getElementById("enter-new-column");
    const input = document.getElementById("add-column-input");
    const cancelBtn = document.getElementById("add-column-cancel");
    const applyBtn = document.getElementById("add-column-now");
    return { 
        valid: link && inputForm && input && cancelBtn && applyBtn,
        link: link, inputForm: inputForm, input: input, cancelBtn: cancelBtn, applyBtn: applyBtn
    }
}


/**
 * listens for a click onto the 'add column' button
 * hides the just clicked link and shows the input field
 * 
 * @param { object } e          - the event object 
 * @param { object } link       - a reference to the link's DOM element
 * @param { object } inputForm  - a reference to the DOM element containing input related stuff 
 * @param { object } input      - a reference to the input field's DOM element
 */
function addColumnLinkListener(e, link, inputForm, input) {
    e.stopPropagation();
    inputForm.style.display = "";
    input.focus();
    link.parentElement.style.cursor = "auto";
    link.style.display = "none";
    columnColors.choice = 0;
    input.style.backgroundColor = columnColors.colors[columnColors.choice].accent;
    input.style.color = columnColors.colors[columnColors.choice].title;
}


/**
 * listens for input events 
 * filters invalid inputs
 * 
 * @param { object } e - the event object 
 */
function inputFieldListener(e) {
    const pattern = /[a-z 0-9äöüß+-.()\/]/gi;
    e.target.value = (e.target.value.match(pattern) || []).toString().replaceAll(",", "");
}


/**
 * listens for clicks on the input field
 * changes color of the column to be created
 * 
 * @param { object } e - the event object 
 */
function inputFieldClicked(e) {
    e.stopPropagation();
    nextColumnColor();
    e.target.style.backgroundColor = columnColors.colors[columnColors.choice].accent;
    e.target.style.color = columnColors.colors[columnColors.choice].title;
}


/**
 * listens for 'keyup' events and
 * initiates appropiate actions
 * 
 * @param { object } e - the event object
 * @param { object } link - a reference to the link's DOM element
 * @param { object } inputForm - a reference to the DOM element containing input related stuff
 * @param { object } input - a reference to the input field's DOM element
 */
function inputFieldKeyListener(e, link, inputForm, input) {
    const keyCodeActions = setKeyCodeActions();
    const modifier = e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.key == "AltGraph";
    if (!modifier) {
        keyCodeActions.forEach(k => (e.keyCode == k.keyCode || e.key == k.key) ? k.callback(link, inputForm, input) : false);
    } 
    input.style.backgroundColor = columnColors.colors[columnColors.choice].accent;
    input.style.color = columnColors.colors[columnColors.choice].title;
}


/**
 * returns an array of objects of valid key strokes and actions
 * 
 * @returns { object[] } - valid keys and their assigned callbacks
 */
function setKeyCodeActions() {
    return [
        { keyCode: 13, key: "Enter", callback: applyButtonHit },
        { keyCode: 27, key: "Escape", callback: cancelButtonHit },
        { keyCode: 38, key: "ArrowUp", callback: previousColumnColor },
        { keyCode: 40, key: "ArrowDown", callback: nextColumnColor },
    ];
}


/** changes the color of the column to be created */
function previousColumnColor() {
    (columnColors.choice > 0) ? columnColors.choice-- : columnColors.choice = columnColors.colors.length - 1;
}


/** changes the color of the column to be created */
function nextColumnColor() {
    (columnColors.choice < columnColors.colors.length - 1 ) ? columnColors.choice++ : columnColors.choice = 0;
}


/**
 * listens for clicks onto the 'cancel' button
 * 
 * @param { object } e - the event object
 * @param { object } link - a reference to the link's DOM element
 * @param { object } inputForm - a reference to the DOM element containing input related stuff
 * @param { object } input - a reference to the input field's DOM element
 */
function cancelButtonListener(e, link, inputForm, input) {
    e.stopPropagation();
    cancelButtonHit(link, inputForm, input);
}


/**
 * listens for clicks onto the 'apply' button
 * 
 * @param { object } e - the event object
 * @param { object } link - a reference to the link's DOM element
 * @param { object } inputForm - a reference to the DOM element containing input related stuff
 * @param { object } input - a reference to the input field's DOM element
 */
function applyButtonListener(e, link, inputForm, input) {
    e.stopPropagation();
    applyButtonHit(link, inputForm, input);
}


/** add new colum canceled by user */
function cancelButtonHit(link, inputForm, input) {
    input.value = "";
    inputForm.style.display = "none";
    link.style.display = "";
    link.parentElement.style.cursor = "pointer";
}


/**
 * generates a new column ID out of the user's input
 * and initiates the creation of the column
 * 
 * @param { object } link - a reference to the link's DOM element
 * @param { object } inputForm - a reference to the DOM element containing input related stuff
 * @param { object } input - a reference to the input field's DOM element
 */
function applyButtonHit(link, inputForm, input) {
    const pattern = /[a-z0-9-]/gi;
    const newColumnTitle = (input.value) ? input.value : "";
    const newColumnId = (input.value.match(pattern) || []).join("").replaceAll("-", "").toLowerCase();
    inputForm.style.display = "none";
    link.style.display = "";
    link.parentElement.style.cursor = "pointer";
    input.value = "";
    if (newColumnId) {                                              // if the column already has existed and was deleted
        const index = findRemovedColumnsIndex(newColumnId);         // restore it from the undo stack, else create 
        (index < 0) ? insertUserAddedColumn(newColumnId, newColumnTitle) : restoreColumn(index, {}); // a new column
    }
}


export { attachAddColumnListeners };