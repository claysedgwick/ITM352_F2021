var express = require('express');
var app = express();
var products = require("./products.json");

app.use(express.static('./public'));

var listener = app.listen(8080, () => { console.log('Server has started listening on port: ' + listener.address().port) });