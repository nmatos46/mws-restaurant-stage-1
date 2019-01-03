//Citation: https://medium.com/shovel-apps/simple-node-js-server-on-heroku-210ec24f485

/**Create a simple http server using node.js */
var static = require('node-static');
var file = new static.Server();

require('http').createServer(function(request, response) {
  request.addListener('end', function() {
    file.serve(request, response, function (err, result) {
      //Citation:https://www.npmjs.com/package/node-static
      //Add error handling
      if (err) { // There was an error serving the file
          console.error("Error serving " + request.url + " - " + err.message);

          // Respond to the client
          response.writeHead(err.status, err.headers);
          response.end();
      };
    }).resume();
  });  
}).listen(process.env.PORT || 5000);