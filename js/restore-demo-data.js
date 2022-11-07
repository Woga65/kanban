import { addColumn } from "./columns.js";
import localize from "./localize.js";

export function addResetDemoDataButton() {
    addColumn('restore_demo_data', localize().resetDemo, {title: '#fa2759', accent: 'white', border: '#2369a4'}, true, false, true, 'board');
    document.getElementById('restore_demo_data').addEventListener('click', resetDemoData, { once: true });
    document.getElementById('restore_demo_data').addEventListener('touchstart', resetDemoData, { once: true });
}


async function resetDemoData() {
    const response = await fetch("restore-demo-data.php");
    const restored = await response.json();
    console.log('restore_demo_data: ', restored);
    setTimeout(() => window.location.reload(), 50);
}
