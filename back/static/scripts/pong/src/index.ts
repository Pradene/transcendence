import {Pong}       from './Pong';
import {GameSocket} from "./GameSocket";

let pong: Pong | null  = null;
const sock: GameSocket = GameSocket.get();