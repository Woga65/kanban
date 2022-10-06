import { columns, removedColumns, writeAllColumnsToBackend, restoreColumn } from "./columns.js";
import { removeColumn, findColumnsIndex, findRemovedColumnsIndex } from "./columns.js";
import { moveTaskToColumn } from "./tasks.js";
import { openModal } from "./modal-settings-dialog.js";


/** show dialog for removing columns */
function showColumnsModal() {
    renderDataModal('Lists', getColumns());
    openModal();
}


/** get settings from backend */
function getColumns() {
    const columnData = [];
    columns.forEach(c => columnData.push({ id: c.id, title: c.title, protected: c.protected, hidden: false }));
    removedColumns.forEach(hc => columnData.push({ id: hc.column.id, title: hc.column.title, protected: false, hidden: true }));
    return columnData;
}


/** render data modal */
function renderDataModal(heading, data) {
    const modal = document.getElementById("modal-container");
    modal.innerHTML = modalTemplate(heading, data);
    addModalListeners(heading, data);
}


/** fill modal with data */
function modalTemplate(heading, data) {
    let dataList = '';
    data.forEach((d, i) => dataList += d.protected ? '' : modalDataItemTemplate(i, d));
    return `
        <div id="modal" class="modal">
            <div class="modal-msg">
                <h2>${heading}</h2>
            </div>
            <div class="modal-data">
                <ul class="modal-column-list">
                    <li>
                        <button id="modal-close" style="width: 100%;"> close</button>
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
            <div id="modal-data-item-${index}">${data.title}</div>
            <div id="modal-item-${('00' + index).substring(index.length)}-delete">&#xf2ed;</div>
        </li>`.trim();
}


/** event listener - close modal data dialog */
async function closeModal(e) {
    const modal = document.getElementById('modal-container');
    modal.style.opacity = "";
    setTimeout(() => modal.style.display = "", 400);
    removeModalListeners();
}


/** event listener - clicked on backdrop */
function clickedOutside(e) {
    if (e.target.id && e.target.id == 'modal-container') {
        closeModal(e);
    }
}


/**
 * event listener - delete data
 * 
 * @param { string } heading - heading for modal dialog 
 * @param { string[]} data  - data to be shown / deleted 
 * @param { object } e - the event object 
 */
 function deleteData(heading, data, e) {
    const index = Number(e.target.id.substring(11, 14));
    deleteColumn(data[index]);
    data.splice(index, 1);
    removeModalListeners();
    renderDataModal(heading, data);
}


/** add event listeners for delete
 *  data and close modal dialog */
 function addModalListeners(heading, data) {
    const modalClose = document.getElementById('modal-close');
    const modalContainer = document.getElementById('modal-container');
    const deleteIcons = document.querySelectorAll('.modal-data li div:last-child');
    modalClose.addEventListener('click', closeModal);
    deleteIcons.forEach(di => di.addEventListener('click', deleteData.bind(null, heading, data)));
    modalContainer.addEventListener('click', clickedOutside);
}


/** remove event listeners from dialog */
function removeModalListeners() {
    const modalClose = document.getElementById('modal-close');
    const deleteIcons = document.querySelectorAll('.modal-data li div:last-child');
    modalClose.removeEventListener('click', closeModal);
    deleteIcons.forEach(di => di.removeEventListener('click', deleteData));
}


/** delete column from the DOM and from the backend */
function deleteColumn(data) {
    if (data.hidden) restoreColumn(findRemovedColumnsIndex(data.id), {});
    columns[findColumnsIndex(data.id)].protected = true;
    const tasks = removeColumn(data.id);
    writeAllColumnsToBackend();
    tasks.forEach(task => moveTaskToColumn(task.id, "trash"));
    console.log("tasks from deleted column moved to 'trash': ", tasks);
}


export { showColumnsModal };