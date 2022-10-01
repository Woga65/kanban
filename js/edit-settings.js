import { readSettings } from "./backend.js";

const columns = [];
const removedColumns = [];

const tasks = [];

const defaultPriorities = ["niedrig", "mittel", "hoch"];
const priorities = [];

const defaultPersons = ["Max", "Daniel", "Lukas", "Wolfgang"]; // may be useful for testing
const inCharge = [];

const defaultCategories = ["Management", "Marketing", "Frontend", "Backend", "Entwicklung", "Arbeit", "Hobby"]; // for testing
const categories = [];



/** get settings from backend */
function getSettings() {
    priorities.splice(0, priorities.length);
    inCharge.splice(0, inCharge.length);
    categories.splice(0, categories.length);
    const settings = readSettings();
    (settings.priorities || defaultPriorities).forEach(p => priorities.push(p));
    (settings.persons || []).forEach(p => inCharge.push(p));
    (settings.categories || defaultCategories).forEach(p => categories.push(p));
}


/** add, edit, remove team members */
function editPersons() {
    renderDataModal('Team members', inCharge);
    openModal();
}


/** add, edit, remove priorities */
function editPriorities() {
    renderDataModal('Priorities', priorities);
    openModal();
}


/** add, edit, remove categories */
function editCategories() {
    renderDataModal('Categories', categories);
    openModal();
}


/** setup data modal element*/
function setupModal() {
    const parent = document.getElementById("board-container");
    const modal = document.createElement("div");
    modal.classList.add("modal-container");
    modal.id = "modal-container";
    parent.appendChild(modal);
}


/** render data modal */
function renderDataModal(heading, data) {
    const modal = document.getElementById("modal-container");
    modal.innerHTML = modalTemplate(heading, data);
    addModalListeners(heading, data);
}


/** add event listeners for add
 *  data and close modal dialog */
function addModalListeners(heading, data) {
    const modalAdd = document.getElementById('modal-add');
    const modalClose = document.getElementById('modal-close');
    const deleteIcons = document.querySelectorAll('.modal-data li div:last-child');
    modalAdd.addEventListener('click', addData.bind(null, heading, data));
    modalClose.addEventListener('click', closeModal);
    deleteIcons.forEach(di => di.addEventListener('click', deleteData.bind(null, heading, data)));
}


/** remove event listeners from dialog */
function removeModalListeners() {
    const modalAdd = document.getElementById('modal-add');
    const modalClose = document.getElementById('modal-close');
    const deleteIcons = document.querySelectorAll('.modal-data li div:last-child');
    modalClose.removeEventListener('click', closeModal);
    modalAdd.removeEventListener('click', addData);
    deleteIcons.forEach(di => di.removeEventListener('click', deleteData));
}


/** open modal data dialog */
function openModal() {
    const modal = document.getElementById('modal-container');
    modal.style.display = "flex";
    modal.style.opacity = "1";
}


/** event listener - close modal data dialog */
function closeModal(e) {
    const modal = document.getElementById('modal-container');
    modal.style.opacity = "";
    setTimeout(() => modal.style.display = "", 400);
    removeModalListeners();
}


/**
 * event listener - add data
 * 
 * @param { string } heading - heading for modal dialog 
 * @param { string[] } data  - data to be shown / edited
 * @param { object } e - the event object 
 */
function addData(heading, data, e) {
    const modalInput = document.getElementById('modal-input');
    if (modalInput.value) data.push(modalInput.value);
    removeModalListeners();
    renderDataModal(heading, data);
}


/**
 * event listener - delete data
 * 
 * @param { string } heading - heading for modal dialog 
 * @param { string[]} data  - data to be shown / edited 
 * @param { object } e - the event object 
 */
function deleteData(heading, data, e) {
    const index = Number(e.target.id.substring(11, 14));
    data.splice(index, 1);
    removeModalListeners();
    renderDataModal(heading, data);
}


/** fill modal with data */
function modalTemplate(heading, data) {
    let dataList = '';
    data.forEach((d, i) => dataList += modalDataItemTemplate(i, d));
    return `
        <div id="modal" class="modal">
            <div class="modal-msg">
                <h2>${heading}</h2>
            </div>
            <div class="modal-data">
                <ul>
                    <li>
                        <input id="modal-input" type="text" placeholder="enter data">
                        <button id="modal-add">add</button>
                        <button id="modal-close"> close</button>
                    </li>
                    ${dataList}
                </ul>
            </div>
        </div>`.trim();
}


/** modal list item template */
function modalDataItemTemplate(index, data) {
    return `
        <li id="modal-data-row-${index}">
            <div id="modal-data-item-${index}">${data}</div>
            <div id="modal-item-${('00' + index).substring(index.length)}-delete">&#xf2ed;</div>
        </li>`.trim();
}



/** will be moved to a separate module */
/*function readSettings() {
    return {
        priorities: JSON.parse(backend.getItem('priorities')) || (defaultPriorities),
        persons: JSON.parse(backend.getItem('inCharge')) || (defaultPersons)
    }
}*/


export { setupModal, editPersons, editPriorities, editCategories, getSettings };