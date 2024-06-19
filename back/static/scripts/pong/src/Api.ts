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
    data?: any;
}

interface create_game extends apicallrequest {
    method: "create_game";
}


interface get_games extends apicallrequest {
    method: "get_games";
}

interface update_game_response extends apicallresponse {
    method: "update_game";
    status: boolean;
    data: {
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

export {apicall, apicallrequest, apicallresponse, create_game, get_games, update_game_response};