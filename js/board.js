import { setupMenuIconBar } from "./menu-icon-bar.js";
import { initLoginPage, showLoginPage, hideLoginPage } from "./initLoginPage.js";
import { initBackend } from "./backend.js";
import { initColumns } from "./columns.js";
import { showTasks, readAllTasksFromBackend } from "./tasks.js";
import { applyExampleData } from "./fakeData.js";


//-----for debugging-----
window.debugMode = true;    // if set to 'true', the exports from 'tasks.js' and 'columns.js' can be  
debug();                    // accessed from within the browser's dev-tools via the prefixes 't' and 'c'


init();


function init() {

    //let the document's body fade in
    document.querySelector('body').style.opacity = '1';

    //initialize login page
    initLoginPage();

    //on login state change
    window.addEventListener('loginchange', async e => {
        setupMenuIconBar();                     //initialize sidebar
        if (e.detail.loginState.loggedIn) {
            await initBackend();
            readAllTasksFromBackend();
            initColumns();                      //initialize kanban board
            showTasks();
            hideLoginPage();                    //hide login page
        } else {
            showLoginPage();                    //show user login
            applyExampleData();                 //fake data as background
        }
    });
    
}


// 
//   for debugging 
// 
async function debug() {
    if (!debugMode && 't' in window) {
        delete window.t;
        delete window.c;
        console.log("debug mode: off");
        console.log("t and c removed from window object");
    }
    if (debugMode && !('t' in window)) {
        const t = await import("./tasks.js");
        const c = await import("./columns.js");
        window.t = t;
        window.c = c;
        console.log("prefix t assigned to tasks.js");
        console.log("prefix c assigned to columns.js");
    }
}



    /***************************
     **      examples         **
     ***************************

    // addColumn(columnId, columnTitle, colors, minimized, hidden, protected, parentElement, insertBeforeElement)
    // addTask(columnId, taskTitle, taskDetails, taskCategory, taskPriority, dueDate, assignedTo)
    
    import { initColumns, addColumn, removeColumn } from "./columns.js";
    import { addTask, removeTask, showTasks, euDateToUtc, readAllTasksFromBackend } from "./tasks.js";
    import { initBackend } from "./backend.js";

    await initBackend();
    readAllTasksFromBackend();
    initColumns();
    showTasks();
    
    let task, col;
    col = addColumn("neuespalte", "neue Spalte", { title: "black", accent: "darksalmon", text: "black", background: "white" }, false, false, true, "board", "todo");
    task = addTask("neuespalte", "Fluggerät nochmal testen", "Text 3", "Hobby", 1, euDateToUtc("15.05.2022"), "Müllers Kuh");
    showTasks();

    setTimeout(function () {
        removeTask(task);
    }, 7000);

    setTimeout(function () {
        console.log(removeColumn("neuespalte"));
    }, 10000);

/*
    addTask("inprogress", "Frontend programmieren", "Task's description goes here", "Entwicklung", 0, euDateToUtc("30.04.2022"), "Fritz");
    addTask("complete", "Überbrückungshilfe beantragen", "Text 2", "Arbeit", 0, euDateToUtc("25.03.2022"), "Hans");
    addTask("complete", "Tanzstunde vorbereiten", "Text 5", "Arbeit", 0, euDateToUtc("15.01.22"), "Gustav");
    addTask("inprogress", "Tanzstunde vorbereiten", "Text 6", "Arbeit", 0, euDateToUtc("23.04.2022"), "Michaela");
    addTask("discussing", "Backend programmieren", "Text 7", "Entwicklung", 1, euDateToUtc("15.08.2022"), "Sarah");

    showTasks();
*/