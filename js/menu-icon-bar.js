import { columns, hiddenColumns, restoreColumn, removeColumn, addColumn } from "./columns.js";
import { getColumnsProperties, writeAllColumnsToBackend } from "./columns.js";
import { showTasks } from "./tasks.js";
import { setupModal, editPersons, editPriorities, editCategories } from "./modal-settings-dialog.js";
import { showColumnsModal } from "./modal-columns-dialog.js";
import { showHelpModal } from "./modal-show-help.js";
import { showLoginPage } from "./initLoginPage.js";
import localize from "./localize.js";


const setupIconFunctions = [
    setupUndoIcon, setupUsersIcon, setupPrioritiesIcon,
    setupAddListIcon, setupRemoveListIcon, setupBacklogIcon,
    setupTrashCanIcon, setupUserProfileIcon, setupHelpIcon,
    setupSettingsIcon,
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
    const undo = menuIconTemplate('undo', localize().iconBar.undoTitle, '&#xee0b;', (hiddenColumns.length) ? "var(--primary-color)" : "grey");
    parent.appendChild(undo);
    undo.addEventListener("click", restoreColumn.bind(null, -1));
}


/** setup the users icon */
function setupUsersIcon(parent) {
    const users = menuIconTemplate('users', localize().iconBar.teamTitle, '&#xed0b;', 'var(--primary-color)');
    parent.appendChild(users);
    users.addEventListener("click", editPersons);
}


/** setup the priorties icon */
function setupPrioritiesIcon(parent) {
    const prio = menuIconTemplate('priorities', localize().iconBar.prioTitle, `<img src="./img/priority.svg">`, 'var(--primary-color)');
    parent.appendChild(prio);
    prio.addEventListener("click", editPriorities);
}


/** setup the add list icon */
function setupAddListIcon(parent) {
    const list = menuIconTemplate('add-list', localize().iconBar.addListTitle, `<img src="./img/icons8-add-properies-26.png">`, 'var(--primary-color)');
    parent.appendChild(list);
    list.addEventListener("click", () => {
        document.getElementById('add-column-link').scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
        const isIos = typeof navigator.standalone === 'boolean';    //detect iOS / iPad OS
        clickFocusAfterScroll(isIos);                               //on iOS focus need to be set immediately after user interaction
    });
}


/** click add-column link and set focus to input field */
function clickFocusAfterScroll(isIos) {
    if (!isIos) {
        setTimeout(() => {
            document.getElementById('add-column-link').click();
            document.getElementById('add-column-input').focus();
        }, 250);
    } else {
        document.getElementById('add-column-link').click();
        document.getElementById('add-column-input').focus();
    }
}


/** setup the remove list icon */
function setupRemoveListIcon(parent) {
    const list = menuIconTemplate('remove-list', localize().iconBar.removeListTitle, `<img src="./img/icons8-remove-properies-26.png">`, 'var(--primary-color)');
    parent.appendChild(list);
    list.addEventListener("click", () => showColumnsModal());
}


/** setup the show backlog icon */
function setupBacklogIcon(parent) {
    const backlog = menuIconTemplate('show-backlog', localize().iconBar.backlogTitle, '&#xead1;', 'var(--primary-color)');
    parent.appendChild(backlog);
    backlog.addEventListener("click", () => {
        document.getElementById('backlog')
            ? removeColumn('backlog')
            : (
                addColumn('backlog', 'Backlog', { accent: "darksalmon" }, false, false, true, "board", columns[0].id),
                document.getElementById('backlog').scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
            );
        updateBoard();
    });
}


/** setup the trash can icon */
function setupTrashCanIcon(parent) {
    const trashCan = menuIconTemplate('trash-can', localize().iconBar.trashTitle, '&#xf2ed;', 'var(--primary-color)');
    parent.appendChild(trashCan);
    trashCan.addEventListener("click", () => {
        document.getElementById('trash')
            ? removeColumn('trash')
            : (
                addColumn('trash', 'trash', { accent: "rgba(30, 30, 30, .2)" }, false, false, true, "board", columns[0].id),
                document.getElementById('trash').scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
            );
        updateBoard();
    });
}


/** update the column's sizes & positions
 *  save the changes made to the board
 *  render the tasks
 */
function updateBoard() {
    getColumnsProperties();
    writeAllColumnsToBackend();
    showTasks();
}


/** setup the settings icon */
function setupUserProfileIcon(parent) {
    const userProfile = menuIconTemplate('user-profile', localize().iconBar.userTitle, '&#xed01;', 'var(--primary-color)');
    parent.appendChild(userProfile);
    userProfile.addEventListener("click", showLoginPage);
}


/** setup the help icon */
function setupHelpIcon(parent) {
    const help = menuIconTemplate('help-icon', localize().iconBar.helpTitle, '&#xefca;', 'var(--primary-color)');
    parent.appendChild(help);
    help.addEventListener("click", showHelpModal);
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


function refreshIconsState() {
    document.getElementById('undo').style.color = (hiddenColumns.length) ? "var(--primary-color)" : "grey";
}


export { setupMenuIconBar, refreshIconsState };
