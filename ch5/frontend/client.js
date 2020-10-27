/***********************/
/* OAuth 2.0 functions */
/***********************/

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

// Create an Authorization Request
function generateAuthorizationRequest() {
    var req = state.discovery['authorization_endpoint'];

    var clientId = getInput('input-clientid');
    var scope = getInput('input-scope');

    var authorizationInput = {
        clientId: clientId,
        scope: scope
    }
    setState('authorizationInput', authorizationInput);

    req += '?client_id=' + clientId;
    req += '&response_type=code';
    req += '&redirect_uri=' + document.location.href.split('?')[0];
    if ('' !== scope) {
        req += '&scope=' + scope;
    }

    document.location.href = req;
}

// Create a Token Exchange Request
function loadTokens(code) {
    var clientId = getInput('input-clientid');

    var params = 'grant_type=authorization_code';
    params += '&code=' + code;
    params += '&client_id=' + clientId;
    params += '&redirect_uri=' + document.location.href.split('?')[0];

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState === 4) {
            var response = JSON.parse(req.responseText);

            if (response['access_token']) {
                var accessToken = response['access_token'].split('.');
                var accessTokenHeader = JSON.parse(base64UrlDecode(accessToken[0]));
                var accessTokenBody = JSON.parse(base64UrlDecode(accessToken[1]));
                var accessTokenSignature = accessToken[2];
                setOutput('output-accessTokenHeader', accessTokenHeader);
                setOutput('output-accessToken', accessTokenBody);
                setOutput('output-accessTokenSignature', accessTokenSignature);
                document.getElementById('output-accessTokenEncoded').innerHTML = response['access_token'];
                setState('refreshToken', response['refresh_token']);
                setState('accessToken', response['access_token']);
            } else {
                setOutput('output-accessToken', '');
            }
        }
    }
    req.open('POST', state.discovery['token_endpoint'], true);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    req.send(params);

    window.history.pushState({}, document.title, '/');
}

// Create a Service Request
function invokeService() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState === 4) {
            if (req.status === 0) {
                setOutput('output-serviceResponse', "Failed to send request");
            } else {
                setOutput('output-serviceResponse', req.responseText);
            }
        }
    }
    console.debug(serviceUrl);
    req.open('GET', serviceUrl, true);
    req.setRequestHeader('Authorization', 'Bearer ' + state.accessToken);

    req.send();

    window.history.pushState({}, document.title, '/');
}

/*************************/
/* Application functions */
/*************************/

var steps = ['discovery', 'authorization', 'invoke']
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
        case 'authorization':
            var authorizationInput = state.authorizationInput;
            if (authorizationInput) {
                setInput('input-clientid', authorizationInput.clientId);
                setInput('input-scope', authorizationInput.scope);
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
        loadTokens(code);
    }

    var error = getQueryVariable('error');
    var errorDescription = getQueryVariable('error_description');
    if (error) {
        setOutput('output-authorizationResponse', 'error=' + error + '<br/>error_description=' + errorDescription);
    }
}