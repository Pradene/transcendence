import {Pong}       from './Pong';
import {GameSocket} from "./GameSocket";

let pong: Pong | null  = null;
const sock: GameSocket = GameSocket.get();

async function createSocket(): Promise<WebSocket> {
    return new Promise<WebSocket>((resolve, reject) => {
        let ws: WebSocket = new WebSocket("ws://" + location.hostname + ":" + location.port + "/ws/game");
        ws.onopen    = () => resolve(ws);
        ws.onerror   = (err: any) => reject(err);
        ws.onclose   = (event: any) => console.log("Connection closed");
        ws.onmessage = (event: any) => console.log("Received message: " + event.data);
    }).then((ws: WebSocket) => {
        return ws;
    });
}

//try ?
let socket = await createSocket();
console.log(socket);

socket.onmessage = (event: any) => {
    console.log("Received message: " + event.data);
}
socket.send(JSON.stringify({method: "create_game"}));
socket.send(JSON.stringify({method: "get_games"}));