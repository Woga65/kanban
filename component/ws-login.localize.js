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
        template: 'component/ws-login_de.html', 
        loggedIn: {
            hello: `Hallo <span class="fullname">${window.wsLogin.state.userName},</span> Sie sind eingeloggt als <span class="uname">${window.wsLogin.state.userId}.</span>`,
            verified: window.wsLogin.state.userVerified ? 'verifiziertes Benutzerkonto' : 'Sie haben Ihr Konto noch nicht verifiziert',
            language: 'deutsch',
        },
        loggedOut: { 
            hello: 'Sie sind nicht eingeloggt.', 
            verified: '&nbsp;',
            language: 'deutsch',
        },
    }
}


function english() {
    return {
        template: 'component/ws-login.html',  
        loggedIn: {
            hello: `Hello <span class="fullname">${window.wsLogin.state.userName},</span> you are logged in as <span class="uname">${window.wsLogin.state.userId}.</span>`,
            verified: window.wsLogin.state.userVerified ? 'verified account' : 'Your account has not yet been verified',
            language: ((window.wsLogin.languages[0] || 'n/a').toLowerCase().startsWith('en') ? 'english' : (window.wsLogin.languages[0] || 'n/a')),
        },
        loggedOut: { 
            hello: 'You are not logged in.',
            verified: '&nbsp;',
            language: ((window.wsLogin.languages[0] || 'n/a').toLowerCase().startsWith('en') ? 'english' : (window.wsLogin.languages[0] || 'n/a')),
        },
    };
}


function generic() {
    return english();
}
