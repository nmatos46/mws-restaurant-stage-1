//Citation: https://medium.com/shovel-apps/simple-node-js-server-on-heroku-210ec24f485

/**Create a simple http server using node.js */
var static = require('node-static');
var file = new static.Server();

require('http').createServer(function(request, response) {
  request.addListener('end', function() {
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    console.log(request.url)
    file.serve(request, response);
  }).resume();
}).listen(process.env.PORT || 9000);