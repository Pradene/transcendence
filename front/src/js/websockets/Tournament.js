import { Router } from "../utils/Router.js"
import { WSManager } from "../utils/WebSocketManager.js"

async function handleMessage(event) {
    const data = JSON.parse(event.data)
    console.log("Message received", data)

    if (data.action === 'query_tournament') {
        dispatchEvent(new CustomEvent("queryTournament", {detail: data.tournament_id}))
    } else if (data.type === 'game_found') {
        const id = data.game_id
        const url = `/game/${id}/`
        console.log(`redirecting to ${url}`)

        const router = Router.get()
        await router.navigate(url)
    }
}

export function connectTournamentSocket(id) {
    const url = `wss://${location.hostname}:${location.port}/ws/tournament/${id}/`
    const socket = new WebSocket(url)
    if (!socket) return

    WSManager.add('tournament', socket)

    sessionStorage.setItem('tournament', id)

	socket.onmessage = (event) => handleMessage(event)

    socket.onclose = () => sessionStorage.removeItem('tournament')

    return socket
}

