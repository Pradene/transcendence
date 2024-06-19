import { GameSocket } from "./GameSocket";
let pong = null;
const sock = GameSocket.get();
async function createSocket() {
    return new Promise((resolve, reject) => {
        let ws = new WebSocket("ws://" + location.hostname + ":" + location.port + "/ws/game");
        ws.onopen = () => resolve(ws);
        ws.onerror = (err) => reject(err);
        ws.onclose = (event) => console.log("Connection closed");
        ws.onmessage = (event) => console.log("Received message: " + event.data);
    }).then((ws) => {
        return ws;
    });
}
//try ?
let socket = await createSocket();
console.log(socket);
socket.onmessage = (event) => {
    console.log("Received message: " + event.data);
};
socket.send(JSON.stringify({ method: "create_game" }));
socket.send(JSON.stringify({ method: "get_games" }));
