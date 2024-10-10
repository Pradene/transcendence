export class Score {
    constructor(response) {
        const user = document.querySelector('.game .container .user')
        const opponent = document.querySelector('.game .container .opponent')

        document.querySelector('.game .scores h2').textContent = `${response.data.current_player.username} vs ${response.data.opponent.username}`
        user.querySelector('.username').textContent = response.data.current_player.username
        opponent.querySelector('.username').textContent = response.data.opponent.username

        self._user_score = user.querySelector('.score')
        self._opponent_score = opponent.querySelector('.score')
    }

    update(response) {
        self._user_score.textContent = response.data.current_player.score
        self._opponent_score.textContent = response.data.opponent.score
    }

    hide() {
        document.querySelector('.game .scores').style.visibility = 'hidden'
    }

    show() {
        document.querySelector('.game .scores').style.visibility = 'visible'
    }
}