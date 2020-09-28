/****************************/
/* OpenID Connect functions */
/****************************/

// Load the OpenID Provider Configuration
function loadDiscovery() {
    var issuer = getInput('input-issuer');
    setState('issuer', issuer);

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState === 4) {
            setState('discovery', JSON.parse(req.responseText));
            setOutput('output-discovery', state.discovery);
        }
    }
    req.open('GET', issuer + '/.well-known/openid-configuration', true);
    req.send();
}

// Create an Authentication Request
function generateAuthenticationRequest() {
    var req = state.discovery['authorization_endpoint'];

    var clientId = getInput('input-clientid');
    var scope = getInput('input-scope');
    var prompt = getInput('input-prompt');
    var maxAge = getInput('input-maxage');
    var loginHint = getInput('input-loginhint');

    var authenticationInput = {
        clientId: clientId,
        scope: scope,
        prompt: prompt,
        maxAge: maxAge,
        loginHint: loginHint
    }
    setState('authenticationInput', authenticationInput);

    req += '?client_id=' + clientId;
    req += '&response_type=code';
    req += '&redirect_uri=' + document.location.href.split('?')[0];
    if ('' !== scope) {
        req += '&scope=' + scope;
    }
    if ('' !== prompt) {
        req += '&prompt=' + prompt;
    }
    if ('' !== maxAge) {
        req += '&max_age=' + maxAge;
    }
    if ('' !== loginHint) {
        req += '&login_hint=' + loginHint;
    }

    setOutput('output-authenticationRequest', req.replace('?', '<br/><br/>').replaceAll('&', '<br/>'));
    document.getElementById('authenticationRequestLink').onclick = function() {
        document.location.href = req;
    }
}

// Create a Token Exchange Request
function loadTokens() {
    var code = getInput('input-code');
    var clientId = getInput('input-clientid');

    var params = 'grant_type=authorization_code';
    params += '&code=' + code;
    params += '&client_id=' + clientId;
    params += '&redirect_uri=' + document.location.href.split('?')[0];

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState === 4) {
            var response = JSON.parse(req.responseText);
            setOutput('output-response', req.responseText);

            if (response['id_token']) {
                var idToken = response['id_token'].split('.');
                var idTokenHeader = JSON.parse(base64UrlDecode(idToken[0]));
                var idTokenBody = JSON.parse(base64UrlDecode(idToken[1]));
                var idTokenSignature = idToken[2];
                setOutput('output-idtokenHeader', idTokenHeader);
                setOutput('output-idtoken', idTokenBody);
                setOutput('output-idtokenSignature', idTokenSignature);
                setState('refreshToken', response['refresh_token']);
                setState('idToken', response['id_token']);
                setState('accessToken', response['access_token']);
            } else {
                setOutput('output-idtoken', '');
            }
        }
    }
    req.open('POST', state.discovery['token_endpoint'], true);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    setOutput('output-tokenRequest', state.discovery['token_endpoint'] + '<br/><br/>' + params.replaceAll('&', '<br/>'));

    req.send(params);

    window.history.pushState({}, document.title, '/');
}

// Create a Refresh Token Request
function refreshTokens() {
    var code = getInput('input-code');
    var clientId = getInput('input-clientid');

    var params = 'grant_type=refresh_token';
    params += '&refresh_token=' + state.refreshToken;
    params += '&client_id=' + clientId;
    params += '&scope=openid';

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState === 4) {
            var response = JSON.parse(req.responseText);
            setOutput('output-refreshResponse', req.responseText);

            if (response['id_token']) {
                var idToken = JSON.parse(base64UrlDecode(response['id_token'].split('.')[1]));
                setOutput('output-idtokenRefreshed', idToken);
                setState('refreshToken', response['refresh_token']);
            } else {
                setOutput('output-idtokenRefreshed', '');
            }
        }
    }
    req.open('POST', state.discovery['token_endpoint'], true);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    setOutput('output-refreshRequest', state.discovery['token_endpoint'] + '<br/><br/>' + params.replaceAll('&', '<br/>'));

    req.send(params);

    window.history.pushState({}, document.title, '/');
}

// Create a UserInfo Request
function userInfo() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState === 4) {
            var response = JSON.parse(req.responseText);
            setOutput('output-userInfoResponse', req.responseText);
        }
    }
    req.open('GET', state.discovery['userinfo_endpoint'], true);
    req.setRequestHeader('Authorization', 'Bearer ' + state.accessToken);

    setOutput('output-userInfoRequest', state.discovery['userinfo_endpoint'] + '<br/><br/>' + 'Authorization: Bearer ' + state.accessToken);

    req.send();

    window.history.pushState({}, document.title, '/');
}

/*************************/
/* Application functions */
/*************************/

var steps = ['discovery', 'authentication', 'token', 'refresh', 'userinfo']
var state = loadState();

function reset() {
    localStorage.removeItem('state');
    window.location.reload();
}

function loadState() {
   var s = localStorage.getItem('state');
   if (s) {
       return JSON.parse(s);
   } else {
       return {
           step: 'discovery'
       }
   }
}

function setState(key, value) {
    state[key] = value;
    localStorage.setItem('state', JSON.stringify(state));
}

function step(step) {
    setState('step', step);
    for (i = 0; i < steps.length; i++) {
        document.getElementById('step-' + steps[i]).style.display = steps[i] === step ? 'block' : 'none'
    }
    setState('step', step);

    switch(step) {
        case 'discovery':
            if (state.issuer) {
                setInput('input-issuer', state.issuer);
            }
            break;
        case 'authentication':
            var authenticationInput = state.authenticationInput;
            if (authenticationInput) {
                setInput('input-clientid', authenticationInput.clientId);
                setInput('input-scope', authenticationInput.scope);
                setInput('input-prompt', authenticationInput.prompt);
                setInput('input-maxage', authenticationInput.maxAge);
                setInput('input-loginhint', authenticationInput.loginHint);
                setOutput('output-authenticationResponse', '');
            }
            break;
    }
}

function getInput(id) {
    return document.getElementById(id).value
}

function setInput(id, value) {
    return document.getElementById(id).value = value
}

function setOutput(id, value) {
    if (typeof value === 'object') {
        value = JSON.stringify(value, null, 2)
    } else if (value.startsWith('{')) {
        value = JSON.stringify(JSON.parse(value), null, 2)
    }
    document.getElementById(id).innerHTML = value;
}

function getQueryVariable(key) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == key) {
            return decodeURIComponent(pair[1]);
        }
    }
}

function base64UrlDecode(input) {
    input = input
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    var pad = input.length % 4;
    if(pad) {
      if(pad === 1) {
        throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
      }
      input += new Array(5-pad).join('=');
    }

    return atob(input);
}

function init() {
    step(state.step);
    if (state.discovery) {
        setOutput('output-discovery', state.discovery);
    }

    var code = getQueryVariable('code');
    if (code) {
        setInput('input-code', code);
        setOutput('output-authenticationResponse', 'code=' + code);
    }

    var error = getQueryVariable('error');
    var errorDescription = getQueryVariable('error_description');
    if (error) {
        setOutput('output-authenticationResponse', 'error=' + error + '<br/>error_description=' + errorDescription);
    }
}