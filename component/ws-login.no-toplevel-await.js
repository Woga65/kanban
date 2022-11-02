const user = { timer: null, timerRunning: false, data: { loggedIn: null } };

/* backend end points */
const endPoints = { 
    signup: 'includes/signup.inc.php',
    login: 'includes/login.inc.php',
    logout: 'includes/logout.inc.php',
    loginState: 'includes/isloggedin.inc.php',
    verificationState: 'includes/isverified.inc.php',
    sessionExists: 'includes/sessionexists.inc.php',
}


const parser = new DOMParser();

fetch('component/ws-login.html')
    .then(stream => stream.text())
    .then(html => {
        define(parser.parseFromString(html, 'text/html').querySelector('template'));
    });
    

function define(template) {
    class WsLogin extends HTMLElement {
        constructor() {
            super();
            this.shadow = this.attachShadow({ mode: 'open' });
            this.shadow.appendChild(template.content.cloneNode(true));
            this.getElementsReferences();
            this.setTranslucentBackgroundColor();
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
        }
                
        
        /* get the primary background color, add transparency  
         * and store it in a css variable  */
        setTranslucentBackgroundColor() {
            const r = document.querySelector(':root');
            const cssVar = getComputedStyle(r).getPropertyValue('--primary-bgr').trim();
            if (cssVar) {
                r.style.setProperty('--primary-bgr-translucent', cssVar.startsWith('#') ? cssVar + '80' : cssVar);
            }
        }

        
        /* initialize the login system */
        initAuth() {
            window.addEventListener('loginchange', this.loginStateListener.bind(this)); //listen for login state change
            this.checkUserLoggedIn();                                        //determine if a user is already logged in
            this.loginStateTimer = this.loginChangeTimer(5000);
            this.addHideDataSentMessageListeners();                          //add event listeners to the notification modal
            this.forms.forEach((form, index) => {
                form.formFields.forEach(ff => form.defaultErrorMessages.push(ff.nextElementSibling.textContent.replace(/[\n\r]/g, ''))); //save default hints
                this.addFormFieldListeners(form);                                                       //form fields check valid data  
                form.submit.addEventListener('click', this.submitPreflightListener.bind(this, form));   //submit button clicked, check valid form data
                form.form.addEventListener('submit', this.submitListener.bind(this, form, index));      //on submit send form data to the end point
            });
            this.addNonSubmitButtonListeners();
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
            this.submitRequest(form.endPoint, formDataObject)
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
                this.shadow.getElementById('hello-message').innerHTML = 'You are not logged in.';
                this.shadow.getElementById('verified-message').innerHTML = '&nbsp;';
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
                this.shadow.getElementById('hello-message').innerHTML = `Hello <span class="fullname">${user.data.userName},</span> you are logged in as <span class="uname">${user.data.userId}.</span>`;
                this.shadow.getElementById('verified-message').innerHTML = user.data.userVerified ? 'verified account' : 'Your account has not yet been verified';
                this.shadow.querySelector('header').style.opacity = '1';
            }, 150);
            window.scroll({top: 0, left: 0, behavior: "smooth"});
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
            return await this.submitRequest(endPoints.sessionExists, {})
                .then(result => {
                    if (result.ok && result.data.loggedIn != user.data.loggedIn) this.checkUserLoggedIn();
                });
        }


        /* determine if a user is already logged in */
        async checkUserLoggedIn() {
            return await this.submitRequest(endPoints.loginState, {})
                .then(result => {
                    result.ok && result.data.loggedIn ? this.loginSuccess(result) : this.logoutSuccess(result);
                    /* just for demonstration purpose */
                    //this.shadow.getElementById('state-container').style.display = 'block';
                });
        }

        
        /* determine if a user's account is verified */
        async checkUserVerified() {
            if (user.data.loggedIn) {
                return await this.submitRequest(endPoints.verificationState, {})
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
            return await this.submitRequest(endPoints.login, loginData)
                .then(result => result.ok ? this.loginSuccess(result) : this.logoutSuccess(result));
        }
        
        
        /* user logout */
        async logout() {
            return await this.submitRequest(endPoints.logout, {})
                .then(result => this.logoutSuccess(result));
        }        
        

        /* send request to the endpoint */
        async submitRequest(endPoint, dataObject) {
            try {
                const response = await fetch(endPoint, {
                    method: 'POST',
                    body: JSON.stringify(dataObject),
                    headers: { 'Content-Type': 'application/json' }
                });
                return await response.json();
            } catch (err) {
                console.error(err);
                return { err: err, ok: false, data: {} };
            }
        }
    }

    customElements.define('ws-login', WsLogin);
};
