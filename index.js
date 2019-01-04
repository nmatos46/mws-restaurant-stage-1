//Citation: https://medium.com/jondengdevelops/deploy-your-front-end-app-in-20-lines-of-code-24be44f8b51

/**Create a simple http server using node.js */
var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname)));
app.use("/css", express.static(__dirname + '/css'));
app.use("/img", express.static(__dirname + '/img'));
app.use("/imgMedium", express.static(__dirname + '/imgMedium'));
app.use("/imgSmall", express.static(__dirname + '/imgSmall'));
app.use("/js", express.static(__dirname + '/js'));

// viewed at based directory http://localhost:9000/
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + 'index.html'));
});

// add other routes below
app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname + 'views/about.html'));
});

app.listen(process.env.PORT || 9000);