
/* save/removes the user's language choice to/from local storage */
export function saveLang(language) {
    if (storageAvailable('localStorage')) {
        language ? localStorage.setItem('language', language) : localStorage.removeItem('language');
        return true;
    }
    return false;
}


/* restore the user's language choice from local storage */
export function restoreLang() {
    return storageAvailable('localStorage') ? localStorage.getItem('language') : null;
}


/* check whether local storage is available or not */
function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            e.code === 22 ||
            e.code === 1024 ||
            e.name === 'QuotaExceededError' ||
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            (storage && storage.length !== 0);
    }

}