import { TemplateComponent } from '../utils/TemplateComponent.js'
import { WSManager } from '../utils/WebSocketManager.js'
import { Router } from '../utils/Router.js'

export class Tournament extends TemplateComponent {
    constructor() {
        super()
    }

    unmount() {
    
    }

    async componentDidMount() {
        const id = this.getTournamentID()
        const url = `wss://${location.hostname}:${location.port}/ws/tournament/${id}/`
    
        const socket = WSManager.add('tournament', url)

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data)
            this.handleMessage(data)
        }
    }

    handleMessage(data) {
        if (data.type === 'game_found') {
            const id = data.game_id
            const url = `/game/${id}/`

            const router = Router.get()
            router.navigate(url)
        }
    }

    getTournamentID() {
        return location.pathname.split('/')[2]
    }
}