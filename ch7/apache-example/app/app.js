var express = require('express');
var app = express();

app.get('/', function(req, res) {
    var response = '<html><body>';

    response += '<h2><a href="http://localhost/callback?logout=http://localhost">Logout</a></h2>';

    response += '<h2>Request headers</h2>'
    response += '<table>';

    Object.keys(req.headers).sort().forEach(function(key) {
        response += '<tr><td>' + key + '</td><td>' + req.headers[key] + '</td></tr>';
    })

    response += '</table>';
    response += '</body></html>';

    res.send(response);
});

app.listen(8000);