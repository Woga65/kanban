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


/** read removed columns from backend */
function readRemovedColumns() {
    console.log("removed columns read from backend");
    return JSON.parse(backend.getItem('removedColumns'));
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


/** queue removed columns for write */
function writeRemovedColumns(removedColumns) {
    backend.startTransaction();
    backend.setItem('removedColumns', JSON.stringify(removedColumns));
    console.log("removed columns queued for write");
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


export { initBackend, readTasks, readColumns, readRemovedColumns, readSettings }
export { writeSettings, writeTasks, writeColumns, writeCommit, writeRemovedColumns };