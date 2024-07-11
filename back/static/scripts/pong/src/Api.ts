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
 * Request the server to create a game
 *
 * @param data.username Username of the game creator
 */
interface create_game_request extends apicallrequest {
    method: "create_game";
    data: {
    }
}

export interface create_tournament_request extends apicallrequest {
    method: "create_tournament";
    data: {
    }
}

/**
 * Response from the server after asking to create a game
 */
interface create_game_response extends apicallresponse {
    method: "create_game",
    reason?: "Already in a game" | "Invalid username"
}

/**
 * Query the server about every game currently running
 */
interface get_games_request extends apicallrequest {
    method: "get_games";
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
 * Ask the server to join a game with gameid being the username of the
 * creator of the game
 *
 * @param data.gameid   The username of the game's creator
 */
interface join_game_request extends apicallrequest {
    method: "join_game",
    data: {
        gameid: string;
    }
}

/**
 * Response from the server to joining a game
 */
interface join_game_response extends apicallresponse {
    method: "join_game",
    reason?: "Invalid username" | "Already in a game" | "Game is full" | "Game not found" | "Already in this game"
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
        movement: "UP" | "DOWN" | "NONE"
    }
}

export {
    apicall,
    apicallrequest,
    apicallresponse,
    create_game_request,
    create_game_response,
    get_games_request,
    get_games_response,
    join_game_request,
    join_game_response,
    update_game_response,
    update_player_request
};