// créer une connexion socket.io avec le serveur
const socket = io('http://localhost:3000')
// récupérer les éléments du DOM
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

if (messageForm != null) {
   // demander le nom de l'utilisateur
  const name = prompt('What is your name?')
 // ajouter un message indiquant que l'utilisateur a rejoint la salle de chat
  appendMessage('You joined')
    // envoyer un événement 'new-user' au serveur avec le nom de l'utilisateur et  la salle
    socket.emit('new-user', roomName, name)
  

  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`You: ${message}`)
    socket.emit('send-chat-message', roomName, message)
    messageInput.value = ''
  })
}
// pour creer une nouvelle room
socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})
// pour associer a chaque utilisateur  son message
socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})
// un utilisateur se connecte  
socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})
//un utilisateur se  deconnecte 
socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}