import { readColumns, readRemovedColumns, writeColumns, writeRemovedColumns, writeCommit } from "./backend.js";
import { columns, removedColumns } from "./columns.js";
import { openModal } from "./modal-settings-dialog.js";



/** render data modal */
function renderDataModal(heading, data) {
    const modal = document.getElementById("modal-container");
    modal.innerHTML = modalTemplate(heading, data);
    //addModalListeners(heading, data);
}


/** fill modal with data */
function modalTemplate(heading, data) {
    let dataList = '';
    data.forEach((d, i) => dataList += modalDataItemTemplate(i, d.title));
    return `
        <div id="modal" class="modal">
            <div class="modal-msg">
                <h2>${heading}</h2>
            </div>
            <div class="modal-data">
                <ul>
                    <li>
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




/** event listener - close modal data dialog */
async function closeModal(e) {
    const modal = document.getElementById('modal-container');
    modal.style.opacity = "";
    setTimeout(() => modal.style.display = "", 400);
    //removeModalListeners();
    //writeSettings({ priorities: priorities, persons: inCharge, categories: categories });
    //await writeCommit();
}


/** event listener - clicked on backdrop */
function clickedOutside(e) {
    if (e.target.id && e.target.id == 'modal-container') {
        closeModal(e);
    }
}