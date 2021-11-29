var express = require('express');
var app = express();
var products = require("./products.json");

app.use(express.static('./public'));

// Route to handle any request; also calls next
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path: ' + request.path);
    next();
});

var listener = app.listen(8080, () => { console.log('Server has started listening on port: ' + listener.address().port) });