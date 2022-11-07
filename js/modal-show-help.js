import localize from "./localize.js";
import { openModal } from "./modal-settings-dialog.js";


/** show general help */
function showHelpModal() {
    renderHelpModal('help');
    openModal();
}


/** render help modal */
function renderHelpModal(topic) {
    const modal = document.getElementById("modal-container");
    modal.innerHTML = modalTemplate(topic, { help: localize().iconBar.helpItems });
    addModalListeners();
}


/** add event listeners for closing modal dialog */
 function addModalListeners() {
    const modalClose = document.getElementById('modal-close');
    const modalContainer = document.getElementById('modal-container');
    modalClose.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', clickedOutside);
}


/** remove event listeners from dialog */
function removeModalListeners() {
    const modalClose = document.getElementById('modal-close');
    const modalContainer = document.getElementById('modal-container');
    modalContainer.removeEventListener('click', clickedOutside);
    modalClose.removeEventListener('click', closeModal);
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



/** fill modal with data */
function modalTemplate(topic, data) {
    let dataList = '';
    data[topic].forEach(d => dataList += modalDataItemTemplate(d));
    return `
        <div id="modal" class="modal">
            <div class="modal-msg">
                <h2>${localize().iconBar.helpHeading}</h2>
            </div>
            <div class="modal-data">
                <ul>
                    ${dataList}
                    <li>
                        <button id="modal-close">${localize().close}</button>
                    </li>
                </ul>
            </div>
        </div>`.trim();
}


/** modal list item template */
function modalDataItemTemplate(data) {
    return `
        <li class="modal-help-row">
            <p class="modal-help-item">${data}</p>
        </li>`.trim();
}


export { showHelpModal };
