let jsonFromServer = {};
let transactionStarted = false;
let BASE_SERVER_URL;

//window.onload = async function() {    // in opposite to the original not needed
//}                                     // because I turned it into an ES6 module


export const backend = {
    startTransaction: function() {               // start transaction processing. The data will be written to the server if
        return transactionStarted = true;        // a commit is issued or restored from the server in case of a rollback 
    },
    commit: function() {                                            // write data to the server
        return (transactionStarted) ? saveJSONToServer() : false;   // and stop transaction processing
    },
    rollback: function() {                                          // restore the data from the server
        return (transactionStarted) ? downloadFromServer() : false; // and stop transaction processing
    },
    setItem: function(key, item) {                                  // write the complete JSON including 
        jsonFromServer[key] = item;                                 // all keys after a key has been
        return (transactionStarted) ? true : saveJSONToServer();    // added or updated
    },
    getItem: function(key) {                                        // get an element from
        if (!jsonFromServer[key]) {                                 // the already read JSON
            return null;                                            // -> no server access
        }
        return jsonFromServer[key];
    },
    deleteItem: function(key) {                                     // write the complete JSON including
        delete jsonFromServer[key];                                 // all keys after a key has been 
        return (transactionStarted) ? true:  saveJSONToServer();    // deleted from the JSON
    }
};


export async function downloadFromServer() {
    transactionStarted = false;
    let result = await loadJSONFromServer();    // download all Data
    jsonFromServer = JSON.parse(result);
    console.log(Object.keys(jsonFromServer).length + ' keys Loaded\n');
}


export function setURL(url) {
    BASE_SERVER_URL = url;
}

/**
 * Loads a JSON or JSON Array to the Server
 * payload {JSON | Array} - The payload you want to store
 */

async function loadJSONFromServer() {
    let response = await fetch(BASE_SERVER_URL + '/nocors.php?json=database&nocache=' + (new Date().getTime()));
    return await response.text();

}

/**
 * Saves a JSON or JSON Array to the Server
 */
function saveJSONToServer() {
    transactionStarted = false; 
    return new Promise(function(resolve, reject) {
        let xhttp = new XMLHttpRequest();
        let proxy = determineProxySettings();
        let serverURL = proxy + BASE_SERVER_URL + '/save_json.php';
        xhttp.open('POST', serverURL);

        xhttp.onreadystatechange = function(oEvent) {
            if (xhttp.readyState === 4) {
                if (xhttp.status >= 200 && xhttp.status <= 399) {
                    resolve(xhttp.responseText);
                } else {
                    reject(xhttp.statusText);
                }
            }
        };

        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(JSON.stringify(jsonFromServer));         // write all data

    });
}


function determineProxySettings() {
    return '';
}

export { jsonFromServer };
