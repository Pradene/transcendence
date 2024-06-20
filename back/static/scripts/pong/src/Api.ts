interface apicall {
    method: string;
    data?: any;
}

interface apicallrequest {
    method: string;
    data?: any;
}

interface apicallresponse {
    method: string;
    status: boolean;
    reason?: string;
    data?: any;
}

interface create_game_request extends apicallrequest {
    method: "create_game";
    data: {
        username: string;
    }
}

interface create_game_response extends apicallresponse {
    method: "create_game",
}


interface get_games extends apicallrequest {
    method: "get_games";
}

interface update_game_response extends apicallresponse {
    method: "update_game";
    data: {
        status: "running" | "waiting";
        p1: {
            name: string;
            position: Array<number>;
        }
        p2: {
            name: string;
            position: Array<number>;
        }
        ball: {
            position: Array<number>;
        }
    }
}

export {apicall, apicallrequest, apicallresponse, create_game_request, create_game_response, get_games, update_game_response};