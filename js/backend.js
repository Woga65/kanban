import { backend, setURL, downloadFromServer, jsonFromServer } from "../smallest_backend_ever/mini_backend_module.js";


/** set backend URL and read data from server */
async function initBackend() {
    setURL('https://wolfgang-siebert.de/projects/kanban/smallest_backend_ever');
    await downloadFromServer();
}


/** read tasks from backend */
function readTasks() {
    console.log("tasks read from backend");
    return JSON.parse(backend.getItem('tasks'));
}


/** read columns from backend */
function readColumns() {
    console.log("columns read from backend");
    return JSON.parse(backend.getItem('columns'));
}


/** read hidden columns from backend */
function readHiddenColumns() {
    console.log("hidden columns read from backend");
    return JSON.parse(backend.getItem('hiddenColumns'));
}


/** read settings from backend */
function readSettings() {
    console.log("tasks settings read from backend");
    return {
        priorities: JSON.parse(backend.getItem('priorities')),
        categories: JSON.parse(backend.getItem('categories')),
        persons: JSON.parse(backend.getItem('inCharge')),
    }
}


/** queue tasks for write */
function writeTasks(tasks) {
    tasks.forEach(task => task.assignedTo = task.inCharge); // match different field name used by co-workers
    backend.startTransaction();
    backend.setItem('tasks', JSON.stringify(tasks));
    console.log("tasks queued for write");
}


/** queue settings for write */
function writeSettings(settings) {
    backend.startTransaction();
    backend.setItem('priorities', JSON.stringify(settings.priorities));
    backend.setItem('categories', JSON.stringify(settings.categories));
    backend.setItem('inCharge', JSON.stringify(settings.persons));
    console.log("settings queued for write");
}


/** queue columns for write */
function writeColumns(columns) {
    backend.startTransaction();
    backend.setItem('columns', JSON.stringify(columns));
    console.log("columns queued for write");
}


/** queue hidden columns for write */
function writeHiddenColumns(hiddenColumns) {
    backend.startTransaction();
    backend.setItem('hiddenColumns', JSON.stringify(hiddenColumns));
    console.log("hidden columns queued for write");
}


/** write queued data to backend */
async function writeCommit() {
    const payload = JSON.stringify(jsonFromServer).length;
    if (payload > 50000) {
        console.log(`${payload} chars exceed the maximum payload!`)
        await backend.rollback();
        return false;
    }    
    await backend.commit();
    console.log(`${payload} bytes written to backend`);
    return true;
} 


export { initBackend, readTasks, readColumns, readHiddenColumns, readSettings }
export { writeSettings, writeTasks, writeColumns, writeHiddenColumns, writeCommit };