var express = require('express');
var app = express();

app.get('/', function(req, res) {
    var response = '<html><body>';

    response += '<p><a href="http://localhost/callback?logout=http://localhost">Logout</a></p>';

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