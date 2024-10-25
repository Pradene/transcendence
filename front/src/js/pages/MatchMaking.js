import { Router } from '../utils/Router'
import { TemplateComponent } from '../utils/TemplateComponent'

export class MatchMaking extends TemplateComponent {
    constructor() {
        super()
    
        this.socket = null
    }

    async unmount() {
        if (this.socket)
            this.socket.close()
    }

    async componentDidMount() {
        this.connectToMatchMakingWebSocket()

        const cancelButton = document.getElementById('cancel-matchmaking')
        cancelButton.addEventListener('click', async () => {
            const router = Router.get()
            await router.navigate('/')
        })
    }

    connectToMatchMakingWebSocket() {
        const url = 'wss://' + location.hostname + ':' + location.port + '/ws/matchmaking/'
        this.socket = new WebSocket(url)

        this.socket.onopen = () => {
            console.log('Connected to matchmaking WebSocket')
        }

        this.socket.onmessage = async (e) => {
            console.log(e)
            
            await this.handleWebSocketMessage(e)
        }

        this.socket.onerror = async (e) => {
            console.error('WebSocket error: ', e)
        
            const router = Router.get()
            await router.navigate('/')
        }

        this.socket.onclose = () => {
            console.log('Matchmaking WebSocket closed')
        }
    }

    async handleWebSocketMessage(e) {
        const data = JSON.parse(e.data)
        console.log(data)

        if (data.type === 'game_found') {
            const id = data.game_id

            const router = Router.get()
            await router.navigate(`/game/${id}/`)
        }
    }
}
