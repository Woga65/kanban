import { readSettings, writeSettings, writeCommit } from "./backend.js";
import localize from "./localize.js";
import { priorities, inCharge, categories } from "./tasks.js"


const defaultPriorities = ["niedrig", "mittel", "hoch"];
//const priorities = [];

const defaultPersons = ["Max", "Daniel", "Lukas", "Wolfgang"]; // may be useful for testing
//const inCharge = [];

const defaultCategories = ["Management", "Marketing", "Frontend", "Backend", "Entwicklung", "Arbeit", "Hobby"]; // for testing
//const categories = [];



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
    getSettings();
    renderDataModal(localize().iconBar.teamHeading, inCharge);
    openModal();
}


/** add, edit, remove priorities */
function editPriorities() {
    getSettings();
    renderDataModal(localize().iconBar.prioHeading, priorities);
    openModal();
}


/** add, edit, remove categories */
function editCategories() {
    getSettings();
    renderDataModal('Categories', localize().iconBar.categoriesHeading);
    openModal();
}


/** setup data modal element*/
function setupModal() {
    if (!document.getElementById("modal-container")) {
        const parent = document.getElementById("board-container");
        const modal = document.createElement("div");
        modal.classList.add("modal-container");
        modal.id = "modal-container";
        parent.appendChild(modal);
    }
}


/** render data modal */
function renderDataModal(heading, data) {
    const modal = document.getElementById("modal-container");
    modal.innerHTML = modalTemplate(heading, data);
    addModalListeners(heading, data);
}


/** add event listeners for add data,
 *  delete data and close modal dialog */
function addModalListeners(heading, data) {
    const modalAdd = document.getElementById('modal-add');
    const modalClose = document.getElementById('modal-close');
    const modalContainer = document.getElementById('modal-container');
    const deleteIcons = document.querySelectorAll('.modal-data li div:last-child');
    modalAdd.addEventListener('click', addData.bind(null, heading, data));
    modalClose.addEventListener('click', closeModal);
    deleteIcons.forEach(di => di.addEventListener('click', deleteData.bind(null, heading, data)));
    modalContainer.addEventListener('click', clickedOutside);
}


/** remove event listeners from dialog */
function removeModalListeners() {
    const modalAdd = document.getElementById('modal-add');
    const modalClose = document.getElementById('modal-close');
    const modalContainer = document.getElementById('modal-container');
    const deleteIcons = document.querySelectorAll('.modal-data li div:last-child');
    modalContainer.removeEventListener('click', clickedOutside);
    modalClose.removeEventListener('click', closeModal);
    modalAdd.removeEventListener('click', addData);
    deleteIcons.forEach(di => di.removeEventListener('click', deleteData));
}


/** open modal data dialog */
function openModal() {
    const modal = document.getElementById('modal-container');
    modal.style.display = "flex";   
    setTimeout(() => modal.style.opacity = "1", 0);
}


/** event listener - close modal data dialog */
async function closeModal(e) {
    const modal = document.getElementById('modal-container');
    modal.style.opacity = "";
    setTimeout(() => modal.style.display = "", 400);
    removeModalListeners();
    writeSettings({ priorities: priorities, persons: inCharge, categories: categories });
    await writeCommit();
}


/** event listener - clicked on backdrop */
function clickedOutside(e) {
    if (e.target.id && e.target.id == 'modal-container') {
        closeModal(e);
    }
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
    if (modalInput.value) data.push(modalInput.value.trim());
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
    if (e.target.nodeName.toLowerCase() == 'button') {
        const index = Number(e.target.parentElement.id.substring(11, 14));
        data.splice(index, 1);
        removeModalListeners();
        renderDataModal(heading, data);
    } else {
        setTimeout(() => {
            hideDeleteButtons();
            e.target.nextElementSibling.style.display = 'inline';
        }, 250);
    }
}


function hideDeleteButtons() {
    const delButtons = document.querySelectorAll('.modal-data .modal-data-delete-button');
    delButtons.forEach(db => db.style.display = 'none');
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
                        <input id="modal-input" type="text" placeholder="${localize().enterData}">
                        <button id="modal-add">${localize().add}</button>
                        <button id="modal-close">${localize().close}</button>
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
            <div id="modal-item-${('00' + index).substring(index.length)}-delete">
                <span>&#xf2ed;</span>
                <button class="modal-data-delete-button">${localize().delete}</button>
            </div>
        </li>`.trim();
}


export { setupModal, openModal, editPersons, editPriorities, editCategories };