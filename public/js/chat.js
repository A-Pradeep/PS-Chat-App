const socket = io()

// Elements
const $messageForm = document.querySelector('#MessageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $LocationButton = document.querySelector('#location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemp = document.querySelector('#messageTemp').innerHTML
const LocationTemp = document.querySelector('#LocationTemp').innerHTML
const SideBarTemp = document.querySelector('#SideBarTemp').innerHTML

// Options
const {username, room} = Qs.parse(location.search,{ ignoreQueryPrefix: true })

// Auto Scroll to bottom
const autoscroll = () => {
    // New message
    const $newMessage = $messages.lastElementChild
    // Get height of new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // visible height
    const visibleHeight = $messages.offsetHeight
    // Height of mesaage container
    const containerHeight = $messages.scrollHeight
    //how Far scroll 
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

// User / Message Response
socket.on('NewUser',(message) => {
    console.log(message)
    const html = Mustache.render(messageTemp,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html) 
    autoscroll()
})

// Location Response
socket.on('locationshare',(location) =>{
    const html = Mustache.render(LocationTemp,{
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html) 
    autoscroll()
})

// Send Button
$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    // Disable Form when its sent
    $messageFormButton.setAttribute('disabled','disabled')
    
    socket.emit('ClientMessage',event.target.elements.message.value,(err) => {
        // Enable based on server response
        $messageFormInput.value = ''
        $messageFormInput.focus()
        $messageFormButton.removeAttribute('disabled')
        if(err){
           return console.log(err);
        }
        console.log('Message Delivered')
    })
})

// Location Button
$LocationButton.addEventListener('click',() => {
    if(!navigator.geolocation){
        return alert('Geo Location not supported')
    }
    $LocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('UserLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },() => {
            $LocationButton.removeAttribute('disabled')
            console.log('Loacation Shared');
        })
    })
})

// Login Data to Server
socket.emit('join',{username,room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})

// Room Users List
socket.on('RoomData',({room,users})=>{
    const html = Mustache.render(SideBarTemp,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})