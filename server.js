var express = require('express')
  , http = require('http')
  , port = process.env.PORT || 3000
  , app = express()
  , server = require('http').Server(app)
  , io = require('socket.io')(server)
  , path = require('path')

app.use(express.static(path.join(__dirname, 'public')))

io.sockets.on('connection', function (socket) {
  // console.log('connection received on socket', socket)
  socket.on('init', function () {
    console.log('init', socket.rooms[0])
    io.to(socket.rooms[0]).emit('init-ack', socket.rooms[0])
  })

  socket.on('next-tick', function (beat) {
    io.to(socket.rooms[0]).emit('tick')
  })

  socket.on('glitch', function (glitch) {
    io.to(socket.rooms[0]).emit('g', glitch)
  })

  socket.on('join-room', function (roomName) {
    socket.join(roomName)
  })
})

server.listen(port)
