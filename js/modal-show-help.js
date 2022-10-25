import { openModal } from "./modal-settings-dialog.js";

const helpItems = {
    help: [
        `Drag & drop tasks and lists as you wish. Edit a task by clicking the task's body. Deleted tasks will be moved 
        to the trash folder.<br><br>Change the priority, due date or team member a task is assigned to by simply clicking on it.<br><br>
        <b>Hide a list</b> by clicking the <span class='icon'>&#xeee1;</span> Icon at the top-right corner of the list.<br>`,
        `<b>Add / Remove team members</b> by clicking the <span class='icon' style="font-size: 1.3rem;">&#xed0b;<span> icon.`,
        `<b>Edit the priorities list</b> by clicking the <img style="height: 2rem; object-position: 0 0.35rem;" src="img/priority.svg"> icon.`,
        `<b>Add / Remove lists</b> by clicking the appropiate icons. If a list is removed, the related tasks 
        will be moved to the trash folder.`,
        "<b>Show / hide the backlog</b> by clicking the <span class='icon'>&#xead1;</span> Icon.<br><br>",
    ],
};



/** show general help */
function showHelpModal() {
    renderHelpModal('help');
    openModal();
}


/** render help modal */
function renderHelpModal(topic) {
    const modal = document.getElementById("modal-container");
    modal.innerHTML = modalTemplate(topic, helpItems);
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
                <h2>${topic}</h2>
            </div>
            <div class="modal-data">
                <ul>
                    ${dataList}
                    <li>
                        <button id="modal-close"> close</button>
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
