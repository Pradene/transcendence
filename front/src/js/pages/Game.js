import { TemplateComponent } from "../utils/TemplateComponent"
import { Router } from "../utils/Router"
import { Pong } from "../pong/Pong"

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
        this.socket = new WebSocket(url)

        this.socket.onopen = () => {
            console.log('Connected to game WebSocket')
        }

        this.socket.onmessage = (e) => {
            const data = JSON.parse(e.data)
            
            this.handleWebSocketMessage(data)
        }

        this.socket.onerror = async (e) => {
            console.log('WebSocket error: ', e)

            const router = Router.get()
            await router.navigate('/')
        }

        this.socket.onclose = () => {
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
            this.socket.send(JSON.stringify({
                movement: 'UP'
            }))
            
        } else if (e.key === 'd') {
            this.socket.send(JSON.stringify({
                movement: 'DOWN'
            }))
        }
    }
    
    stopPlayer(e) {
        if (e.key === 'a' || e.key === 'd') {
            this.socket.send(JSON.stringify({
                movement: 'NONE'
            }))
        }
    }
}