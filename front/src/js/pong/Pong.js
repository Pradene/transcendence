import * as THREE from 'three'
import {Router} from "../utils/Router.js"

import {Player} from "./Player.js"
import {Ball} from "./Ball.js"
import {ThreeCamera} from './Camera.js'
import {ThreeRenderer} from './Renderer.js'
import {Sizes} from './Sizes.js'
import {Environment} from './Environment.js'
import {Timer} from './Timer.js'
import {Platform} from './Platform.js'
import {Stadium} from './Stadium.js'
import {WSManager} from '../utils/WebSocketManager.js'

export class Pong {
    constructor(id, isLocal = false) {
        console.log('Pong constructor')
        if (Pong.instance) {
            console.log('Pong instance already exists')
            return Pong.instance
        }

        Pong.instance = this

        this.gameID = id

        const canvas = document.getElementById('canvas')
        if (!canvas) return
        canvas.getContext('webgl2')

        this.canvas      = canvas
        this.sizes       = new Sizes()
        this.scene       = new THREE.Scene()
        this.camera      = new ThreeCamera()
        this.renderer    = new ThreeRenderer()
        this.environment = new Environment()
        this.timer       = new Timer()
        this.platform    = new Platform()
        this.stadium     = new Stadium()

        this.player   = new Player({x: -400 + 20, y: 0})
        this.opponent = new Player({x: 400 - 20, y: 0})

        this.ball = new Ball()

        this.sizes.on('resize', () => this.resize())

        this.endGame = () => this.end()
        window.addEventListener('beforeunload', this.endGame)

        this.keyDown = (e) => this.keyDownHandler(e)
        window.addEventListener('keydown', this.keyDown)

        this.keyUp = (e) => this.keyUpHandler(e)
        window.addEventListener('keyup', this.keyUp)

        this.touchStart = (e) => this.touchStartHandler(e)
        window.addEventListener('touchstart', this.touchStart)

        this.touchEnd = (e) => this.touchEndHandler(e)
        window.addEventListener('touchend', this.touchEnd)

        this.requestId = null
        this.display()

        console.log('Pong instance created')
        this.connectGameWebSocket(isLocal)
    }

    static get() {
        return Pong.instance || new Pong()
    }

    keyDownHandler(e) {
        console.log(e.key)
        switch (e.key) {

            case 'a':
                WSManager.send('game', {movement: 'UP'})
                break
            case 'd':
                WSManager.send('game', { movement: 'DOWN' })
                break
            case 'p':
                this.camera.setPosition(new THREE.Vector3(0, 4, 10))
                break
            case 'o':
                this.camera.setPosition(new THREE.Vector3(0, 4, -10))
                break
            case 'u':
                this.camera.setPosition(new THREE.Vector3(0, 10, 0))
                break
            default:
                break
        }

        switch (e.key) {
            case 'ArrowLeft':
                WSManager.send('game', {p2movement: 'UP'})
                break
            case 'ArrowRight':
                WSManager.send('game', {p2movement: 'DOWN'})
                break
        }
    }

    keyUpHandler(e) {
        switch (e.key) {
            case 'a':
            case 'd':
                WSManager.send('game', {movement: 'NONE'})
                break
            default:
                break
        }

        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
                WSManager.send('game', {p2movement: 'NONE'})
                break
        }
    }

    touchStartHandler(e) {
        console.log(e)
        const position = e.touches[0].clientX

        if (position < window.innerWidth / 2) {
            WSManager.send('game', {movement: 'UP'})
        } else {
            WSManager.send('game', {movement: 'DOWN'})
        }
    }

    touchEndHandler(e) {
        console.log(e)

        WSManager.send('game', {movement: 'NONE'})
    }

    connectGameWebSocket(isLocal = false) {
        if (!isLocal && !this.gameID) return
        console.log('Connecting to game WebSocket')


        const url = isLocal ? `wss://${location.hostname}:${location.port}/ws/localgame/` : `wss://${location.hostname}:${location.port}/ws/game/${this.gameID}/`
        const socket = new WebSocket(url)
        if (!socket) return

        WSManager.add('game', socket)

        socket.onopen = () => {
            console.log('Connected to game WebSocket')

            sessionStorage.setItem('game', this.gameID)
        }

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data)
            this.update(data)
        }

        socket.onerror = async (e) => {
            console.log('WebSocket error: ', e)

            sessionStorage.removeItem('game')
            socket.close()

            const router = Router.get()
            router.back()
        }

        socket.onclose = () => {
            console.log('Game WebSocket closed')
        }
    }

    end() {
        Pong.instance = null

        window.removeEventListener('keydown', this.keyDown)
        window.removeEventListener('keyup', this.keyUp)
        window.removeEventListener('touchstart', this.touchStart)

        if (this.requestId) {
            window.cancelAnimationFrame(this.requestId)
            this.requestId = null
        }
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }

    update(data) {
        if (data.type === 'player_info') {
            this.displayPlayersName(data)

        } else if (data && data.status === 'waiting') {
            this.timer.create(data.timer)

        } else if (data && data.status === 'started') {
            this.player.setPosition(data.player.position.x, data.player.position.y)
            this.opponent.setPosition(data.opponent.position.x, data.opponent.position.y)
            this.ball.setPosition(data.ball.position.x, data.ball.position.y)
            this.displayScore(data)

        } else if (data && data.status === 'finished') {
            sessionStorage.removeItem('game')
            WSManager.remove('game')

            this.displayScore(data)
            this.displayResult(data)

            this.ball.remove()
            this.player.remove()
            this.opponent.remove()
            this.platform.remove()
            this.stadium.remove()
        }
    }

    display() {
        this.renderer.update()
        this.requestId = window.requestAnimationFrame(this.display.bind(this))
    }

    displayScore(data) {
        const playerScore   = data.player.score
        const opponentScore = data.opponent.score

        const playerScoreElement       = document.querySelector('.scores .player .score')
        playerScoreElement.textContent = playerScore

        const opponentScoreElement = document.querySelector('.scores .opponent .score')
        opponentScoreElement.textContent = opponentScore
    }

    displayPlayersName(data) {
        const player   = data.player
        const opponent = data.opponent

        const playerName       = document.querySelector('.scores .player .username')
        playerName.textContent = player

        const opponentName       = document.querySelector('.scores .opponent .username')
        opponentName.textContent = opponent
    }


    translateLeaveBtn() {
        const currentLanguage = localStorage.getItem('selectedLanguage') || "en";
        const translations = { de: "Spiel Verlassen", en: "Leave Game", fr: "Quitter le jeu" }
        console.log(translations[currentLanguage])
        const leaveBtn = document.getElementById('leave-game')
        leaveBtn.innerHTML = translations[currentLanguage]
        console.log(leaveBtn.innerHTML)
    }

	displayResult(data) {
		const result = document.getElementById('result')

        const player = data.player
		const opponent = data.opponent

        const playerName = document.querySelector('.scores .player .username').textContent

        const currentLanguage = localStorage.getItem('selectedLanguage') || "en"
        const translations = {
            en: {
            won: 'You Won !',
            congrats: `Congratulation ${playerName}`,
            lose: 'You Lose...',
            encouraging: `Don't give up ${playerName}, you'll do better next time, maybe...`
        },
        de: {
            won: ' Du hast Gewonnen !',
            congrats: `Gratulation ${playerName}`,
            lose: 'Du verliesst...',
            encouraging: `Gib nicht auf ${playerName}, nächstes Mal machst du es besser, vielleicht...`
        },
        fr: {
            won: 'Tu as gagne !',
            congrats: `Felicitation ${playerName}`,
            lose: 'Tu as perdu...',
            encouraging: `N'abandonne pas ${playerName}, tu feras mieux la prochaine fois, peut-etre...`
        }
    }

		const wol = document.getElementById('wol')
		const resmsg = document.getElementById('resmsg')

        if (player.score > opponent.score) {
			wol.textContent = translations[currentLanguage].won
			resmsg.textContent = translations[currentLanguage].congrats
			const firework1 = document.getElementById('firework1')
			const firework2 = document.getElementById('firework2')
			const firework3 = document.getElementById('firework3')
			firework1.removeAttribute('hidden')
			firework2.removeAttribute('hidden')
			firework3.removeAttribute('hidden')

        } else {
			wol.textContent = translations[currentLanguage].lose
			resmsg.textContent = translations[currentLanguage].encouraging
		}

        const button = document.getElementById('leave-game')
        button.addEventListener('click', async () => await this.leaveGame())
        result.removeAttribute('hidden')
        this.translateLeaveBtn()
    }

    async leaveGame() {
        const router = Router.get()
        await router.back()
    }
}
