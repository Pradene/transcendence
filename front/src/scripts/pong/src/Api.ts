interface apicall {
    method: string;
    data?: any;
}

/**
 * Basic request to the server
 */
interface apicallrequest {
    method: string;
    data?: any;
}

/**
 * Basic response from the server
 */
interface apicallresponse {
    method: string;
    status: boolean;
    reason?: string;
    data?: any;
}

/**
 * List of all currently running games
 *
 * @param data          A list of all currently running games
 * @param data.creator  The username of the creator of the game (same as gameid)
 * @param data.nplayers How many player are currently in the game
 * @param data.is_full  If true we cannot join this game
 */
interface get_games_response extends apicallresponse {
    method: "get_games",
    data: {
        games: [{
            creator: string, //TODO remove this field when auth if functionnal, may be missused
            player_count: number,
            is_full: boolean
        }],
        tournaments: [{
            creator: string,
            player_count: number,
            is_full: boolean
        }]
    }
}

/**
 * All data about a game, is used to display pong
 *
 * @param data.status           The current status of the game
 *
 * @param data.players          A list of all players currently in the game
 * @param data.players.name     The username of this player
 * @param data.players.position The current position of this player in the game
 *
 * @param ball                  The ball
 * @param ball.position         The position of the ball
 */
interface update_game_response extends apicallresponse {
    method: "update_game";
    data: {
        status: "running" | "waiting" | "finished";
        gameid: string,
        current_player: {
            position: Array<number>,
            score: number
        },
        opponent: {
            position: Array<number>,
            score: number
        },
        ball: Array<number>,
        timer?: number
    }
}

interface update_player_request extends apicallrequest {
    method: "update_player",
    data: {
        movement: string
    }
}

interface get_users_request extends apicallrequest {
    method: "get_users",
    data: {
        users: string[]
    }
}

export interface join_queue_request extends apicallrequest {
    method: "join_queue",
    data: {
        mode: "game" | "tournament";
    }
}

export interface join_queue_response extends apicallresponse {
    method: "join_queue",
    reason?: "Already in queue" | "Invalid mode"
}

export interface leave_queue_request extends apicallrequest {
    method: "leave_queue"
}

export interface leave_queue_response extends apicallresponse {
    method: "leave_queue",
    reason?: "Not in queue"
}

export {
    apicall,
    apicallrequest,
    apicallresponse,
    get_games_response,
    update_game_response,
    update_player_request,
    get_users_request
};