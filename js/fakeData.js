import { defaultColumns, addColumn, removeColumn } from "./columns.js";


export function applyExampleData() {
    defaultColumns.forEach(dc => addColumn(dc.id, dc.title, dc.color, dc.minimized, dc.hidden, dc.protected, dc.board));
}


export function removeExampleData() {
    defaultColumns.forEach(dc => removeColumn(dc.id));
}
