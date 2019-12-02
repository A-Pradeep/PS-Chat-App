const users = []

// Add User 
    const addUser = ({id, username, room}) => {
        // Clean the data
        username = username.trim().toLowerCase()
        room = room.trim().toLowerCase()

        // Validate Data
        if(!username || !room) {
            return {
                error: 'Username and room required'
            }
        }

        // Check for existing user
        const existingUser = users.find((user) => {
            return user.room === room && user.username === username
        }) 

        // Validate user name
        if(existingUser) {
            return {
                error: 'Username is in use'
            }
        }

        // store user
        const user = {id, username, room}
        users.push(user)
        return { user }
    }

// Remove User
    const removeUser = (id) => {
        const index = users.findIndex((user) => user.id === id)

        if(index != -1){
            return users.splice(index,1)[0]
        }
    }
// Get User
    const GetUser = (id) => {
        return users.find((user) => user.id === id)
    }
// Get Users in room
    const GetUserRoom = (room) => {
        return users.filter((user) => user.room === room)
    }

module.exports = {
    addUser,
    removeUser,
    GetUser,
    GetUserRoom
}