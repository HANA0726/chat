// Importation des modules nécessaires
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', './views')
app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// Création d'un objet pour stocker les rooms
const rooms = { }
app.get('/', (req, res) => {
  res.render('index', { rooms: rooms })
})
// Route pour créer une nouvelle salle s'elle n'existe pas 
app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
    
  }
  //lier chaque  salle  avec  les utilisateurs connectés
  rooms[req.body.room] = { users: {} }
  res.redirect(req.body.room)

  //emettre un evenement  que une nouvelle salle est cree
  io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render('room', { roomName: req.params.room })
})

server.listen(3000)

io.on('connection', socket => {
  //Emettre un evenement que un nouveau utilisateur rejoindre le chat
  socket.on('new-user', (room, name) => {
    socket.join(room)
    rooms[room].users[socket.id] = name
    socket.broadcast.to(room).emit('user-connected', name)
  })
  // Émettre le message envoyé par un utilisateur  en broadcast
  socket.on('send-chat-message', (room, message) => {
    socket.broadcast.to(room).emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })
  //pour informer les utilisateurs, qu'une personne se déconnecte
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.broadcast.to(room).emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})
// Fonction pour récupérer toutes les salles auxquelles l'utilisateur appartient
function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}