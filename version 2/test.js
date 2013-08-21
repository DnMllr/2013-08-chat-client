var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8080);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/css/stylesheet.css', function(req, res){
  res.sendfile(__dirname + '/css/stylesheet.css');
})

app.get('/lib/underscore-min.js', function(req, res){
  res.sendfile(__dirname + '/lib/underscore-min.js');
})

app.get('/lib/backbone-min.js', function(req, res){
  res.sendfile(__dirname + '/lib/backbone-min.js');
})

app.get('/src/source.js', function(req, res){
  res.sendfile(__dirname + '/src/source.js');
})

app.get('/lib/d3.v3.min.js', function(req, res){
  res.sendfile(__dirname + '/lib/d3.v3.min.js');
})

app.get('/lib/jquery.js', function(req, res){
  res.sendfile(__dirname + '/lib/jquery.js');
})

var users = {};

io.sockets.on('connection', function (socket) {

  socket.emit('news', { hello: 'world' });

  socket.on('my other event', function (data) {
    console.log(data);
  });

  socket.on('sendchat', function(data) {
    io.sockets.emit('updatechat', {username: socket.username, message: data, timeRecieved: Date()});
  });

  socket.on('adduser', function(username){
    socket.username = username;
    users[username] = true;
    socket.emit('updatechat', {username: 'SERVER', message: 'You have connected.', timeRecieved: Date()});
    socket.broadcast.emit('updatechat', {username: 'SERVER', message: username + ' has connected', timeRecieved: Date()});
    io.sockets.emit('updateusers', users);
  })

  socket.on('disconnect', function(){
    socket.broadcast.emit('updatechat', {username: 'SERVER', message: socket.username + ' has disconnected', timeRecieved: Date()});
    delete users[socket.username];
    io.sockets.emit('updateusers', users);
  })

});