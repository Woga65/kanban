import { helpItems_en, helpItems_de } from "./help-items.js";


export default function localize() {
    switch (window.wsLogin.languages[0].toLowerCase()) {
        case 'de':
        case 'de-de':
        case 'de-at':
        case 'de-ch':
        case 'de-li':
        case 'de-lu':
            return german();            
        case 'en':
        case 'en-us':
        case 'de-gb':
            return english();
    }
    return generic();
}


function german() {
    return {
        addCard: 'Karte hinzufügen',
        emptyTrash: 'Papierkorb leeren',
        cancel: 'Abbrechen',
        add: 'Hinzufügen',
        close: 'Schließen',
        enterData: 'Daten eingeben...',
        addColumn: addColumn_de(),
        resetDemo: 'Demo zurücksetzen',
        newTask: {
            title: 'neue Aufgabe',
            category: 'allgemein',
            description: 'bitte Beschreibung eingeben',
            inCharge: 'niemand',
        },
        iconBar: {
            undoTitle: 'ausblenden rückgängig',
            teamTitle: 'Team bearbeiten',
            teamHeading: 'Team Mitglieder verwalten',
            prioTitle: 'Prioritäten\nbearbeiten',
            prioHeading: 'Prioritäten verwalten',
            categoriesTitle: 'Kategorien',
            categoriesHeading: 'Kategorien verwalten',
            addListTitle: 'Liste hinzufügen',
            removeListTitle: 'Listen entfernen',
            removeListHeading: 'Listen entfernen',
            backlogTitle: 'Backlog ein-\n/ausblenden',
            trashTitle: 'Papierkorb\nein-/ausblenden',
            userTitle: 'Benutzerprofil',
            helpTitle: 'Hilfe',
            helpHeading: 'Hilfe',
            helpItems: helpItems_de(),
        },
    }
}


function english() {
    return {
        addCard: 'Add Card',
        emptyTrash: 'Empty Trash',
        cancel: 'Cancel',
        add: 'Add',
        close: 'Close',
        enterData: 'enter data...',
        addColumn: addColumn_en(),
        resetDemo: 'Restore Demo Data',
        newTask: {
            title: 'new Task',
            category: 'generic',
            description: 'enter description',
            inCharge: 'nobody',
        },
        iconBar: {
            undoTitle: 'unhide Lists',
            teamTitle: 'add / remove \nteam members',
            teamHeading: 'manage Team Members',
            prioTitle: 'add / remove \npriorities',
            prioHeading: 'manage Priorities',
            categoriesTitle: 'Categories',
            categoriesHeading: 'manage Categories',
            addListTitle: 'Add List',
            removeListTitle: 'Remove List(s)',
            removeListHeading: 'Remove Lists',
            backlogTitle: 'show / hide \nBacklog',
            trashTitle: 'show / hide \ntrash can',
            userTitle: 'user \nprofile',
            helpTitle: 'Help',
            helpHeading: 'Help',
            helpItems: helpItems_en(),
        },
    };
}


function generic() {
    return english();
}


function addColumn_de() {
    return `
    <div id="add-column-link">Liste hinzufügen</div>
    <div id="enter-new-column" style="display: none;">
        <div id="add-column-input-bg"></div>
        <input id="add-column-input" name="add-column-input" type="text" maxlength="20" placeholder="klick: Farbe wechseln">
        <div id="add-column-buttons">
            <button id="add-column-cancel">Abbrechen</button>
            <button id="add-column-now">Hinzufügen</button>
        </div>
    </div>
    `.trim();
}


function addColumn_en() {
    return `
    <div id="add-column-link">Add List</div>
    <div id="enter-new-column" style="display: none;">
        <div id="add-column-input-bg"></div>
        <input id="add-column-input" name="add-column-input" type="text" maxlength="20" placeholder="click to change color">
        <div id="add-column-buttons">
            <button id="add-column-cancel">Cancel</button>
            <button id="add-column-now">Add List</button>
        </div>
    </div>
    `.trim();
}
