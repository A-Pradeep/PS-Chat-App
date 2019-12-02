const express = require('express')
const path = require('path')
const http = require('http')
const socketIO = require('socket.io')
const Filter = require('bad-words')

// Utils Files
const {GenerateMessage , LocationURL} = require('./utils/message')
const {addUser, removeUser, GetUser, GetUserRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const IO = socketIO(server)

const port = process.env.PORT || 3000
const PublicDirectory = path.join(__dirname,'../public')

app.use(express.static(PublicDirectory))

IO.on('connection', (socket) => {
    console.log('New Websocket Connection')
    
    socket.on('join',({username,room}, callback) => {

        const {error, user } = addUser({id: socket.id, username, room})

        if(error){
            return callback('error')
        }

        socket.join(user.room)
        socket.emit('NewUser', GenerateMessage('Admin','Welcome !'))
        socket.broadcast.to(user.room).emit('NewUser', GenerateMessage('Admin',`${user.username} has Joined`))

        IO.to(user.room).emit('RoomData',{
            room: user.room,
            users: GetUserRoom(user.room)
        }) 

        callback()
    })

    socket.on('ClientMessage',(message,callback) => {
        const user = GetUser(socket.id)

        const CheckWords = new Filter()
        if(CheckWords.isProfane(message)){
            return callback('Bad Words not Allowed')
        }
        IO.to(user.room).emit('NewUser', GenerateMessage(user.username,message))
        callback()
    })

    socket.on('UserLocation', (location,callback) => {
        const user = GetUser(socket.id) 
        IO.to(user.room).emit('locationshare', LocationURL(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            socket.broadcast.to((user.room)).emit('NewUser', GenerateMessage(`${user.username} has left`))
            IO.to(user.room).emit('RoomData',{
                room: user.room,
                users: GetUserRoom(user.room)
            })
        }
    })

})


server.listen(port, () => {
    console.log(`Server is Running in : ${port}`)
})