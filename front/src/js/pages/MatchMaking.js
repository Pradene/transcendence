import { Router } from '../utils/Router'
import { TemplateComponent } from '../utils/TemplateComponent'

export class MatchMaking extends TemplateComponent {
    constructor() {
        super()
    
        this.socket = null
    }

    unmount() {
        if (this.socket)
            this.socket.close()
    }

    async componentDidMount() {
        this.connectToMatchMakingWebSocket()

        const cancelButton = document.getElementById('cancel-matchmaking')
        cancelButton.addEventListener('click', () => {
            const router = Router.get()
            router.navigate('/')
        })
    }

    connectToMatchMakingWebSocket() {
        const url = 'wss://' + location.hostname + ':' + location.port + '/ws/matchmaking/'
        this.socket = new WebSocket(url)

        this.socket.onopen = () => {
            console.log('Connected to matchmaking WebSocket')

            this.socket.send(JSON.stringify({type: 'join_queue'}))
        }

        this.socket.onmessage = (e) => {
            console.log(e)
            
            this.handleWebSocketMessage(e)
        }

        this.socket.onerror = (e) => {
            console.error('WebSocket error: ', e)
        }

        this.socket.onclose = () => {
            console.log('Matchmaking WebSocket closed')
        }
    }

    handleWebSocketMessage(e) {
        const data = JSON.parse(e.data)

        if (data.type == 'game_found') {
            const id = data.game_id

            const router = Router.get()
            router.navigate(`/game/${id}/`)
        }
    }
}