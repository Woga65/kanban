import localize from "./ws-login.localize.js";
import { saveLang, restoreLang } from "./ws-login.storage.js";


const user = { timer: null, timerRunning: false, data: { loggedIn: null } };

/* backend end points */
const endPoints = { 
    signup: 'public/signup',
    login: 'public/login',
    logout: 'public/logout',
    loginState: 'public/isloggedin',
    verificationState: 'public/isverified',
    sessionExists: 'public/sessionexists',
    initAuth: 'public/initloginsystem',
}


const parser = new DOMParser();

init();


async function init() {
    await submitRequest(endPoints.initAuth, {})
    .then(result => {
        if (result.ok) {
            window.wsLogin ? window.wsLogin.languages = result.langs : window.wsLogin = { languages: result.langs, state: result.data };
            if (!window.wsLogin.languages.length) window.wsLogin.languages = ['en_US'];
            if (restoreLang()) window.wsLogin.languages.unshift(restoreLang().slice(0, 2).toLocaleLowerCase());
            initComponent();
        }
        console.log('db state: ', result);
    });
}


function initComponent() {
    fetch(localize().template)
    .then(stream => stream.text())
    .then(html => {
        define(parser.parseFromString(html, 'text/html').querySelector('template'));
    });
}


function define(template) {
    class WsLogin extends HTMLElement {
        constructor() {
            super();
            this.shadow = this.attachShadow({ mode: 'open' });
            this.shadow.appendChild(template.content.cloneNode(true));
            this.getElementsReferences();
            this.setCssColorVarsOpacity();
        }
        connectedCallback() {
            this.initAuth();
        }
        disconnectedCallback() {
            clearInterval(this.loginStateTimer);
        }

        
        /* get references to the login / signup form elements */
        getElementsReferences() {
            /* the forms array */
            this.forms = [
                {
                    endPoint: endPoints.signup,
                    form: this.shadow.getElementById('signup-form'),
                    submit: this.shadow.querySelector('.signup-form .submit-button'),
                    formFields: this.shadow.querySelectorAll('.signup-form .form-field'),
                    isDirty: new Array(this.shadow.querySelectorAll('.signup-form .form-field').length).fill(false),
                    defaultErrorMessages: [],
                    dataSent: this.signupSuccess.bind(this),
                },
                {
                    endPoint: endPoints.login,
                    form: this.shadow.getElementById('login-form'),
                    submit: this.shadow.querySelector('.login-form .submit-button'),
                    formFields: this.shadow.querySelectorAll('.login-form .form-field'),
                    isDirty: new Array(this.shadow.querySelectorAll('.login-form .form-field').length).fill(false),
                    defaultErrorMessages: [],
                    dataSent: this.loginSuccess.bind(this),
                },
                {
                    endPoint: endPoints.logout,
                    form: this.shadow.getElementById('logout-form'),
                    submit: this.shadow.querySelector('.logout-form .submit-button'),
                    formFields: [],
                    isDirty: [],
                    defaultErrorMessages: [],
                    dataSent: this.logoutSuccess.bind(this),
                },
            ];
            /* data sent notification element */
            this.dataSentMsg = this.shadow.querySelector('.form-data-sent');
            /* language link elements */
            this.languageLinks = this.shadow.querySelectorAll('.language-container .language-link');
        }
                
        
        /* get the primary background and secondary accent color  
         * add transparency and store it in a new css variable  */
        setCssColorVarsOpacity() {
            const r = document.querySelector(':root');
            const cssVarBgr = getComputedStyle(r).getPropertyValue('--primary-bgr').trim();
            const cssVarSecBgr = getComputedStyle(r).getPropertyValue('--secondary-bgr').trim();
            const cssVarAcc = getComputedStyle(r).getPropertyValue('--secondary-accent').trim();
            if (cssVarBgr) r.style.setProperty('--primary-bgr-translucent', cssVarBgr.startsWith('#') ? cssVarBgr + '80' : cssVarBgr);
            if (cssVarSecBgr) r.style.setProperty('--secondary-bgr-translucent', cssVarSecBgr.startsWith('#') ? cssVarSecBgr + '80' : cssVarSecBgr);
            if (cssVarAcc) r.style.setProperty('--secondary-accent-invisible', cssVarAcc.startsWith('#') ? cssVarAcc + '00' : cssVarAcc);
        }

        
         /* initialize the login system */
         async initAuth() {
            this.initLogin();
            this.initUserInterface();
        }
        

        /* initialize login state related stuff */
        initLogin() {
            window.addEventListener('loginchange', this.loginStateListener.bind(this)); //listen for login state change
            this.checkUserLoggedIn();                                       //determine if a user is already logged in
            this.loginStateTimer = this.loginChangeTimer(5000);             //periodically check for login/logout
        }


        /* initialize forms and ui related stuff */ 
        initUserInterface() {
            this.addHideDataSentMessageListeners();                          //add event listeners to the notification modal
            this.forms.forEach((form, index) => {
                form.formFields.forEach(ff => form.defaultErrorMessages.push(ff.nextElementSibling.textContent.replace(/[\n\r]/g, ''))); //save default hints
                this.addFormFieldListeners(form);                                                       //form fields check valid data  
                form.submit.addEventListener('click', this.submitPreflightListener.bind(this, form));   //submit button clicked, check valid form data
                form.form.addEventListener('submit', this.submitListener.bind(this, form, index));      //on submit send form data to the end point
            });
            this.addNonSubmitButtonListeners();
            this.addLanguageLinkListeners();
            setTimeout(() => this.shadow.querySelector('.fade-in').style.opacity = '1', 125);     //let the component's body fade in
        }
      
        
        /* event listeners, let the sent notification fade out */
        addHideDataSentMessageListeners() {
            ['click', 'keyup', 'touchstart'].forEach(ev => this.dataSentMsg.addEventListener(ev, e => {
                this.dataSentMsg.style.opacity = '0';
                setTimeout(() => this.dataSentMsg.style.display = 'none', 400);
            }));
        }
        
        
        /* add event listers for non submit buttons */
        addNonSubmitButtonListeners() {
            this.shadow.getElementById('signup-button').addEventListener('click', this.signupButtonListener.bind(this));   //on click show signup form
            this.shadow.getElementById('login-button').addEventListener('click', this.loginButtonListener.bind(this));     //on click show login form
            this.shadow.getElementById('guest-button').addEventListener('click', this.guestButtonListener.bind(this));     //on click guest login
        }


        addLanguageLinkListeners() {
            this.languageLinks.forEach(ll => ll.addEventListener('click', e => {
                saveLang(e.target.textContent);
                window.location.reload();
            }, 'once: true'));
        }
        
        
        /* event listeners to check whether invalid 
        data has been entered into a form field */
        addFormFieldListeners(form) {
            form.formFields.forEach((ff, i) => {
                ['blur', 'keyup'].forEach(ev => ff.addEventListener(ev, e => {
                    ff.nextElementSibling.textContent = form.defaultErrorMessages[i];
                    if (e.type == 'blur') {
                        form.isDirty[i] = ff.value ? true : false;
                    }
                    !ff.value || !form.isDirty[i] ? ff.classList.toggle('invalid', false) : ff.classList.toggle('invalid', !ff.checkValidity());
                }));
            });
        }
        
        
        /* event listener, on click login as Guest */
        guestButtonListener(e) {
            const index = this.forms.findIndex(form => form.endPoint == endPoints.login);
            const fields = [...(this.forms[index] || {}).formFields || []];
            if (index > -1) {
                this.clearFormData(index);
                fields[fields.findIndex(f => f.name == 'uid')].value = 'Guest';
                fields[fields.findIndex(f => f.name == 'pwd')].value = '123456';
                this.shadow.getElementById('login-submit').click();
            }
        }
        
        
        /* event listener, on click hide login + show signup form */
        signupButtonListener(e) {
            this.forms.forEach((f, i) => this.clearFormData(i));
            this.shadow.getElementById('signup-container').style.display = 'block';
            setTimeout(() => this.shadow.getElementById('signup-container').style.opacity = '1', 150);
            this.shadow.getElementById('login-container').style = 'opacity: 0; display: none;';
            window.scroll({top: 0, left: 0, behavior: "smooth"});
        }
        
        
        /* event listener, on click hide signup + show login form */
        loginButtonListener(e) {
            this.forms.forEach((f, i) => this.clearFormData(i));
            this.shadow.getElementById('login-container').style.display = 'block';
            setTimeout(() => this.shadow.getElementById('login-container').style.opacity = '1', 150);
            this.shadow.getElementById('signup-container').style = 'opacity: 0; display: none;';
            setTimeout(() => window.scroll({top: 0, left: 0, behavior: "smooth"}), 150);
        }
        
        
        /* event listener, on login state change */
        loginStateListener(e) {
            user.data = e.detail.loginState;
            console.log('login state: ', e.detail.loginState);
        }
        
        
        /* event listener, on submit button clicked, check
        if all required data has been entered correctly */
        submitPreflightListener(form, e) {
            let invalidField = null;
            form.formFields.forEach(ff => {
                invalidField = ff.required ? (ff.checkValidity() ? invalidField : invalidField ? invalidField : ff) : invalidField;
                ff.classList.toggle('invalid', !ff.checkValidity());
            });
            if (invalidField) {
                e.preventDefault();
                invalidField.focus();
            }
        }
        
        
        /* event listener, on submit send form data to the endpoint*/
        submitListener(form, index, e) {
            e.preventDefault();
            const formData = new FormData(form.form);
            const formDataObject = Object.fromEntries(formData);
            submitRequest(form.endPoint, formDataObject)
                .then(result => {
                    if (result.ok) {
                        form.dataSent(result, formDataObject);
                        this.clearFormData(index);
                    } else {
                        this.reportInvalidFormData(index, result);
                        console.log('result: ', result);
                    }
                });
        }
        
        
        /* initialize form data and show notification */
        signupSuccess(result, loginData) {
            this.dataSentMsg.style.display = 'flex';
            this.dataSentMsg.style.opacity = '1';
            this.dataSentMsg.focus();
            this.login(loginData);
            window.scroll({top: 0, left: 0, behavior: "smooth"});
        }
        
        
        /* show logout button, hide login + signup form */
        loginSuccess(result, loginData) {
            this.triggerLoginChangeEvent(result);
            result.data.userVerified ? this.userDataUpdateTimer(false) : this.userDataUpdateTimer(true);    //periodically check for user verification
            this.hideLoginForm();
        }
        
        
        /* hide logout button, show login + signup form */
        logoutSuccess(result, loginData) {
            this.triggerLoginChangeEvent(result);
            this.userDataUpdateTimer(false);
            this.showLoginForm();
        }
        
        
        /* dispatch an event on login state change */
        triggerLoginChangeEvent(result) {
            if (result.ok && (result.data.loggedIn != user.data.loggedIn || result.data.userVerified != user.data.userVerified)) {
                const loginChange = new CustomEvent('loginchange', {
                    detail: { loginState: result.data },
                    bubbles: true,
                    cancelable: true,
                    composed: false,
                });
                window.wsLogin ? window.wsLogin.state = result.data : window.wsLogin = { state: result.data };
                window.dispatchEvent(loginChange);
            }
        }
        
        
        /* hide logout button, show login + signup form */
        showLoginForm() {
            this.shadow.getElementById('login-container').style = 'display: block; opacity: 1;';
            this.shadow.getElementById('signup-container').style = 'opacity: 0; display: none;';    
            this.shadow.getElementById('logout-container').style = 'opacity: 0; display: none;';
            this.shadow.querySelector('header').style.opacity = '0';
            setTimeout(() => {
                this.shadow.getElementById('hello-message').innerHTML = this.localize().loggedOut.hello;
                this.shadow.getElementById('verified-message').innerHTML = this.localize().loggedOut.verified;
                this.shadow.querySelector('header').style.opacity = '1';
            }, 150);
            window.scroll({top: 0, left: 0, behavior: "smooth"});
        }
        
        
        /* show logout button, hide login + signup form */
        hideLoginForm() {
            this.shadow.getElementById('login-container').style = 'opacity: 0; display: none;';
            this.shadow.getElementById('signup-container').style = 'opacity: 0; display: none;';
            this.shadow.getElementById('logout-container').style = 'display: block; opacity: 1;';
            this.shadow.querySelector('header').style.opacity = '0';
            setTimeout(() => {
                this.shadow.getElementById('hello-message').innerHTML = this.localize().loggedIn.hello;
                this.shadow.getElementById('verified-message').innerHTML = this.localize().loggedIn.verified;
                this.shadow.querySelector('header').style.opacity = '1';
            }, 150);
            window.scroll({top: 0, left: 0, behavior: "smooth"});
        }
        

        localize() {
            return localize();
        }

        
        /* check which fields were invalid 
           and focus the first invalid field */
        reportInvalidFormData(i, result) {
            if (!result.fields) {
                this.clearFormData(i);
            } else {
                let invalidField = null;
                this.forms[i].formFields.forEach(ff => invalidField = this.checkForInvalid(ff, result, invalidField));
                if (invalidField) invalidField.focus();
            }
        }
        
        
        /* set the hint to the status message reported by 
           the backend, determine which field to focus */
        checkForInvalid(ff, result, invalidField) {
            if (result.fields.includes(ff.name)) {
                ff.classList.toggle('invalid', true);
                ff.nextElementSibling.textContent = result.err;
                invalidField = invalidField ? invalidField : ff;
            }
            return invalidField;
        }
        
        
        /* initialize form data */
        clearFormData(i) {
            this.forms[i].formFields.forEach((ff, j) => {
                ff.value = '';
                this.forms[i].isDirty[j] = false;
                ff.nextElementSibling.textContent = this.forms[i].defaultErrorMessages[j];
                ff.classList.toggle('invalid', false);
            });
        }
        
        
        /* periodically update user state from database */
        userDataUpdateTimer(startTimer) {
            if (!user.timerRunning && startTimer) {
                user.timerRunning = true;
                user.timer = setInterval(() => this.checkUserVerified(), 2000);
            } else if (!startTimer) {
                clearInterval(user.timer);
                user.timerRunning = false;
                user.timer = null;
            }
        }


        /* periodically update the login state from session data */
        loginChangeTimer(interval) {
            return setInterval(() => this.checkLoginChange(), interval);
        }

        
        /* determine if a user has logged in or out */
        async checkLoginChange() {
            return await submitRequest(endPoints.sessionExists, {})
                .then(result => {
                    if (result.ok && result.data.loggedIn != user.data.loggedIn) this.checkUserLoggedIn();
                });
        }


        /* determine if a user is already logged in */
        async checkUserLoggedIn() {
            return await submitRequest(endPoints.loginState, {})
                .then(result => {
                    result.ok && result.data.loggedIn ? this.loginSuccess(result) : this.logoutSuccess(result);
                    /* just for demonstration purpose */
                    //this.shadow.getElementById('state-container').style.display = 'block';
                });
        }

        
        /* determine if a user's account is verified */
        async checkUserVerified() {
            if (user.data.loggedIn) {
                return await submitRequest(endPoints.verificationState, {})
                    .then(result => {
                        if (result.ok && result.data.loggedIn) {
                            result.data.userVerified != user.data.userVerified ? this.loginSuccess(result) : false;
                        } else {
                            this.logoutSuccess(result);
                        }
                    });
            }
        }
        

        /* user login */
        async login(loginData) {
            return await submitRequest(endPoints.login, loginData)
                .then(result => result.ok ? this.loginSuccess(result) : this.logoutSuccess(result));
        }
        
        
        /* user logout */
        async logout() {
            return await submitRequest(endPoints.logout, {})
                .then(result => this.logoutSuccess(result));
        }        


        /* disable logout button */
        disableLogoutButton() {
            this.shadow.getElementById('logout-submit').setAttribute('disabled', '');
        }


        /* (re)enable logout button */
        enableLogoutButton() {
            this.shadow.getElementById('logout-submit').removeAttribute('disabled');
        }
        
    }
    customElements.define('ws-login', WsLogin);
};


/* send request to the endpoint */
export async function submitRequest(endPoint, dataObject, config = { tokenHeader: {}, method: 'POST' }) {
    const requestInit = {
        method: config.method,
        headers: { ...{'Content-Type': 'application/json'}, ...config.tokenHeader },
    };
    if (!['HEAD', 'GET'].includes(config.method)) {
        requestInit.body = JSON.stringify(dataObject);
    }
    try {
        const response = await fetch(endPoint, requestInit);
        return await response.json();
    } catch (err) {
        console.error(err);
        return { err: err, ok: false, data: {} };
    }
}
