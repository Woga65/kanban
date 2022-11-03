import { defaultColumns, addColumn } from "./columns.js";


export function applyExampleData() {
    setTimeout(() => {
        defaultColumns.forEach(dc => addColumn(dc.id, dc.title, dc.color, dc.minimized, dc.hidden, dc.protected, dc.board));
    }, 450);
}
