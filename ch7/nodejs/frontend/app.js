var express = require('express');
var session = require('express-session');
var Keycloak = require('keycloak-connect');
var cors = require('cors');

var app = express();

app.use(cors());

var memoryStore = new session.MemoryStore();

app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));

var keycloak = new Keycloak({ store: memoryStore });

app.use(keycloak.middleware());

app.get('/', keycloak.protect(), function (req, res) {
    res.setHeader('content-type', 'text/plain');
    res.send('Welcome!');
});

app.listen(8080, function () {
    console.log('Started at port 8080');
});