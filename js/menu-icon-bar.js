import { columns, removedColumns, restoreColumn, removeColumn, addColumn } from "./columns.js";
import { getColumnsProperties, writeAllColumnsToBackend } from "./columns.js";
import { showTasks } from "./tasks.js";
import { setupModal, editPersons, editPriorities, editCategories } from "./modal-settings-dialog.js";
import { showColumnsModal } from "./modal-columns-dialog.js";


const setupIconFunctions = [
    setupUndoIcon, setupUsersIcon, setupPrioritiesIcon,
    setupAddListIcon, setupRemoveListIcon, setupBacklogIcon,
    setupTrashCanIcon, setupSettingsIcon,
]


/** setup the menu icon bar */
function setupMenuIconBar() {
    setupModal();
    const parent = document.getElementById("board-container");
    const menuCol = document.createElement("div");
    menuCol.classList.add("menu-icon-bar");
    setupIconFunctions.forEach(iconFunc => iconFunc(menuCol));
    parent.appendChild(menuCol);
}


/** setup the undo icon */
function setupUndoIcon(parent) {
    const undo = menuIconTemplate('undo', 'undo', '&#xee0b;', (removedColumns.length) ? "var(--primary-color)" : "grey");
    parent.appendChild(undo);
    undo.addEventListener("click", restoreColumn.bind(null, -1));
}


/** setup the users icon */
function setupUsersIcon(parent) {
    const users = menuIconTemplate('users', 'add / remove \nteam members', '&#xed01;', 'var(--primary-color)');
    parent.appendChild(users);
    users.addEventListener("click", editPersons);
}


/** setup the priorties icon */
function setupPrioritiesIcon(parent) {
    const prio = menuIconTemplate('priorities', 'add / remove \npriorities',`<img src="./img/priority.svg">`, 'var(--primary-color)');
    parent.appendChild(prio);
    prio.addEventListener("click", editPriorities);
}


/** setup the add list icon */
function setupAddListIcon(parent) {
    const list = menuIconTemplate('add-list', 'add list', `<img src="./img/icons8-add-properies-26.png">`, 'var(--primary-color)');
    parent.appendChild(list);
    list.addEventListener("click", () => {
        document.getElementById('add-column-link').click();
        document.getElementById('add-column-input').focus();
    });
}


/** setup the remove list icon */
function setupRemoveListIcon(parent) {
    const list = menuIconTemplate('remove-list', 'remove lists', `<img src="./img/icons8-remove-properies-26.png">`, 'var(--primary-color)');
    parent.appendChild(list);
    list.addEventListener("click", () => showColumnsModal());
}


/** setup the show backlog icon */
function setupBacklogIcon(parent) {
    const backlog = menuIconTemplate('show-backlog', 'show / hide \nBacklog', '&#xead1;', 'var(--primary-color)');
    parent.appendChild(backlog);
    backlog.addEventListener("click", () => {
        document.getElementById('backlog') 
            ? removeColumn('backlog')
            : addColumn('backlog', 'Backlog', { accent: "darksalmon" }, false, true, "board", columns[0].id);
        getColumnsProperties();
        writeAllColumnsToBackend();
        showTasks();
    });
}


/** setup the trash can icon */
function setupTrashCanIcon(parent) {
    const trashCan = menuIconTemplate('trash-can', 'show / hide \ntrash can', '&#xf2ed;', 'var(--primary-color)');
    parent.appendChild(trashCan);
    trashCan.addEventListener("click", () => {
        document.getElementById('trash') 
            ? removeColumn('trash')
            : addColumn('trash', 'trash', { accent: "rgba(30, 30, 30, .2)" }, false, true, "board", columns[0].id);
        getColumnsProperties();
        writeAllColumnsToBackend();
        showTasks();
    });
}


/** setup the settings icon */
function setupSettingsIcon(parent) {
    const settings = menuIconTemplate('settings', 'settings', '&#xef3a;', 'var(--primary-color)', 'none');
    parent.appendChild(settings);
    //settings.addEventListener("click", changeSettings);
}


function menuIconTemplate(id, desc, html, color, display = '') {
    const icon = document.createElement("div");
    icon.id = id;
    icon.setAttribute('title', desc);
    icon.innerHTML = html;
    icon.style.color = color;
    icon.style.display = display;
    return icon;
}


export { setupMenuIconBar };