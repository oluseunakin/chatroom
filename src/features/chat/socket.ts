import { io } from "socket.io-client";

const server = "http://127.0.0.1:3000"
export const socket = io(server, {autoConnect: false})

socket.on("connect", () => {
    console.log("Connected to Socket server")
})

socket.on('disconnect', () => {
    console.log('Disconnected from Socket server')
})
