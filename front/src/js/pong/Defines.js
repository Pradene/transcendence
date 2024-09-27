export const PADDLE_WIDTH = 64;
export const PADDLE_HEIGHT = 8;
export const BALL_RADIUS = 4;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const THREE_RATIO = 100;

export var GAME_MODE;
(function (GAME_MODE) {
    GAME_MODE[GAME_MODE["NONE"] = 0] = "NONE";
    GAME_MODE[GAME_MODE["STORM"] = 1] = "STORM";
    GAME_MODE[GAME_MODE["WIND"] = 2] = "WIND";
    GAME_MODE[GAME_MODE["GEO"] = 3] = "GEO";
})(GAME_MODE || (GAME_MODE = {}));
