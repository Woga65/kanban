import { dragOver, dragLeave, drop } from "./dragdrop/mouse.js";
import localize from "./localize.js";


// fully functional on common desktops, iPad mini 4, newer i-devices

class Column {
    id;
    title;
    board;
    color;
    minimized;
    hidden;
    protected;
    board;
    x = 0;
    y = 0;
    width = 180;
    height = 564;
    listeners = [
        { evt: "dragover", callback: dragOver },    // default event listeners
        { evt: "dragleave", callback: dragLeave },
        { evt: "drop", callback: drop },
    ];
    listener;

    constructor(id, title, color, minimized, hidden, protectedCol) {
        this.id = id;
        this.title = title;
        this._color = color;
        this.minimized = (minimized) ? minimized : false;
        this.hidden = (hidden) ? hidden : false;
        this.protected = (protectedCol) ? protectedCol : false;
        this.board = 'board';
        this._listener = (this.listeners.length > 0) ? this.listeners[this.listeners.length - 1] : {};
    }

    /*****************************************
    **       getters and setters            **
    *****************************************/

    // get accent and background color
    get _color() {
        return this.color;
    }

    // set accent and background color
    // apply defaults when needed
    set _color(c) {
        this.color = { title: "black", text: "black", accent: "rgba(30, 30, 30, 0.2)", background: "white" };
        if (typeof c == 'object') {
            this.color.title = ('title' in c) ? c.title : this.color.title;
            this.color.text = ('text' in c) ? c.text : this.color.text;
            this.color.accent = ('accent' in c) ? c.accent : this.color.accent;
            this.color.border = ('border' in c) ? c.border : this.color.accent;
            this.color.background = ('background' in c) ? c.background : this.color.background;
         }       
    }

    // get event listeners
    get _listeners() {  
        return this.listeners;
    }

    // set event listeners, if column is present in DOM: 
    // detach whats removed, attach whats new
    set _listeners(value) {
        if (typeof value == 'object' && Array.isArray(value) ) {
            const col = document.getElementById(this.id);
            this.listeners = (typeof this.listeners == 'object' && Array.isArray(this.listeners)) ? this.listeners : [];
            this.removeEventListeners(col);
            this.listeners = (value.length) ? [] : this.listeners;
            value.forEach(v => ('evt' in v && 'callback' in v) ? this.listeners.push(v) : false);
            this.addEventListeners(col);
            this.listener = (this.listeners.length) ? this.listeners[this.listeners.length - 1] : {};
        }
    }

    // get the last added event listener
    get _listener() {
        return this.listener;
    }

    // add a single event listener
    set _listener(value) {
        this.listener = { evt: "", callback: null };
        if (!document.getElementById(this.id) && typeof value == 'object') {
            if ('evt' in value && 'callback' in value) {
                this.listener = value;
                if (this.listeners.findIndex(li => li.evt == value.evt) < 0) {
                    this.listeners.push(value);
                }
            }
        }
    }
    
    /********************************
    **          methods            **
    *********************************/

    // append column to an element in the DOM
    // attach event listeners if present
    appendTo(parent, beforeCol) {
        const par = document.getElementById(parent);
        if (par && !document.getElementById(this.id)) {
            this.board = par.id;
            const col = this.columnsContainerSetup();
            this.addToDom(par, col, beforeCol);
            this.addEventListeners(col);
            this.update();
        }
    }

    // remove column from an element
    // detach event listeners if needed
    removeFrom(parent) {
        const par = document.getElementById(parent);
        const col = document.getElementById(this.id);
        if (par && col && col.parentNode == par) {
            this.removeEventListeners(col);
            par.removeChild(col);
        }
    }

    // hide column
    hide() {
        const col = document.getElementById(this.id);
        col.style.display = "none";
        this.hidden = true;
    }

    // show column
    show() {
        const col = document.getElementById(this.id);
        col.style.display = "";
        this.hidden = false;
    }

    //store the screen position and size of the column
    //inside the column's object's properties 
    update() {
        const col = document.getElementById(this.id);
        if (col) {
            const pos = col.getBoundingClientRect();
            this.x = Math.floor(pos.left);
            this.y = Math.floor(pos.top);
            this.width = Math.floor(pos.width);
            this.height = Math.floor(pos.height);
        }
    }

    // remove a single event listener,
    // detach it if it was attached before
    removeListener(value) {
        const col = document.getElementById(this.id);
        const listenerToRemove = this.listeners[this.listeners.findIndex(l => l.evt == value)] || "";
        if (listenerToRemove) {
            this.removeEventListeners(col);
            this.listeners.splice(i, 1);
            this.addEventListeners(col);
        }
        this.listener = (this.listeners.length > 0) ? this.listeners[this.listeners.length - 1] : {};
    }

    // remove all event listeners
    // the setters will detach them when needed
    removeAllListeners() {
        this.listeners = [];
        this.listener = {};
    }

    // create and setup the column's 
    // container element
    columnsContainerSetup() {
        const col = document.createElement("div");
        col.innerHTML = (this.minimized) ? this.minimizedColumnsTemplate() : this.regularColumnsTemplate();
        col.id = this.id;
        col.classList.add("column");
        (this.minimized) ? col.setAttribute("draggable", false) : col.setAttribute("draggable", true);
        this.columnsContainerApplyStyles(col);
        return col;
    }

    // apply styles to column's
    // container element
    columnsContainerApplyStyles(col) {
        col.style.border = "1px solid "+ this.color.border;
        col.style.backgroundColor = this.color.background;
        col.style.color = this.color.text;
        col.style.height = (this.minimized) ? "fit-content" : "";
        col.style.minHeight = (this.minimized) ? "fit-content" : "";
        col.style.outline = (this.minimized) ? "1px solid " + this.color.border : "";
        col.style.outlineOffset = (this.minimized) ? "-2px" : "";
        col.style.display = this.hidden ? "none" : "";
    }

    // template function for 
    // the column's title
    regularColumnsTemplate() {
        return `
        <h4 id="${this.id}-header" class="title title-regular" style="color: ${this.color.title}; background-color: ${this.color.accent};">
            <span class="title-left"></span>
            <span class="title-mid">${this.title}</span>
            <span id="${this.id}-close" class="title-right icon close">&#xeee1;</span>
        </h4>
        <div id="${this.id}-body" class="column-body"></div>
        <div id="${this.id}-new-task" class="new-task" style="margin-top: auto; background-color: ${this.color.accent};">
            ${ this.id == 'trash' ? localize().emptyTrash : localize().addCard }
        </div>
        `.trim();
    }

    // template function for 
    // the column's footer
    minimizedColumnsTemplate() {
        return `
        <h4 class="title title-minimized" style="color: ${this.color.title}; background-color: ${this.color.accent};">
            ${ this.id == 'add-column' ? localize().addColumn : this.title }
        </h4>
        `.trim();
    }

    // attach all the event listeners to the
    // newly created column's DOM element
    addEventListeners(col) {
        //this.listeners.forEach(l => (col && 'evt' in l && 'callback' in l) ? col.addEventListener(l.evt, e => l.callback(e, col.id)) : false);
        this.listeners.forEach(l => {
            if (col && 'evt' in l && 'callback' in l) {
                col.addEventListener(l.evt, l.callback.bind(null, col.id), { passive: false });
            }
        });
    }

    // remove event listeners from
    // the column's DOM element
    removeEventListeners(col) {
        //this.listeners.forEach(l => (col && 'evt' in l && 'callback' in l) ? col.removeEventListener(l.evt, e => l.callback(e, col.id)) : false);
        this.listeners.forEach(l => {
            if (col && 'evt' in l && 'callback' in l) col.removeEventListener(l.evt, l.callback);
        });
    }

    // add column to the DOM, either append it
    // or insert it before an existing column
    addToDom(parent, column, beforeColumn) {
        const before = document.getElementById(beforeColumn) || false;
        (before) ? parent.insertBefore(column, before) : parent.appendChild(column);
    }
}



export { Column };
