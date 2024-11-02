import { TemplateComponent } from "../utils/TemplateComponent"
import { Pong } from "../pong/Pong"
import { WSManager } from "../utils/WebSocketManager"

export class Game extends TemplateComponent {
    constructor() {
        super()

        this.socket = null
        this.game = null

        this.removeGame = () => this.game.end()

        this.keyDownHandler = (e) => this.movePlayer(e)
        this.keyUpHandler = (e) => this.stopPlayer(e)
    }

    async unmount() {
        if (this.socket)
            this.socket.close()

        if (this.game)
            this.game.end()

        window.removeEventListener('beforeunload', this.removeGame)
        window.removeEventListener('keydown', this.keyDownHandler)
        window.removeEventListener('keyup', this.keyUpHandler)
    }

    async componentDidMount() {
        const canvas = document.getElementById('canvas')
        this.game = new Pong(canvas)
        
        this.connectToGameWebSocket()

        window.addEventListener('beforeunload', this.removeGame)
        window.addEventListener('keydown', this.keyDownHandler)
        window.addEventListener('keyup', this.keyUpHandler)
    }

    connectToGameWebSocket() {
        const id = this.getGameID()
        const url = `wss://${location.hostname}:${location.port}/ws/game/${id}/`
        
        const socket = WSManager.add('game', url)

        socket.onopen = () => {
            console.log('Connected to game WebSocket')
        }

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data)
            
            this.handleWebSocketMessage(data)
        }

        socket.onerror = async (e) => {
            console.log('WebSocket error: ', e)
        }

        socket.onclose = () => {
            console.log('Game WebSocket closed')
        }
    }

    handleWebSocketMessage(data) {
        this.game.update(data)
    }

    getGameID() {
        return location.pathname.split("/")[2]
    }

    movePlayer(e) {
        
        if (e.key === 'a') {
            const message = {
                movement: 'UP'
            }

            WSManager.send('game', message)
            
        } else if (e.key === 'd') {
            const message = {
                movement: 'DOWN'
            }

            WSManager.send('game', message)
        }
    }
    
    stopPlayer(e) {
        if (e.key === 'a' || e.key === 'd') {
            const message = {
                movement: 'NONE'
            }

            WSManager.send('game', message)
        }
    }
}