var express = require('express');
var Keycloak = require('keycloak-connect');

var app = express();

var keycloak = new Keycloak({});

app.use(keycloak.middleware());

app.get('/protected', keycloak.protect(), function (req, res) {
  res.setHeader('content-type', 'text/plain');
  res.send('Access granted to protected resource');
});

app.listen(8080, function () {
  console.log('Started at port 8080');
});