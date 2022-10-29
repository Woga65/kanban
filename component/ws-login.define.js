import WsLogin from './ws-login.js';

const define = async () => {
    let ctor = null;
    
    customElements.define('ws-login', WsLogin);
    ctor = await customElements.whenDefined('ws-login');
    
    return ctor;
}

export default await define();
    
