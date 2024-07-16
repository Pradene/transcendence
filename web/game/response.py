from enum import StrEnum


class Response(StrEnum):
    NOSUCHGAME = "No such game"
    ALREADYINGAME = "Already in a game"
    GAMEFULL = "Game is full"
    INVALIDUSERNAME = "Invalid username"
    INVALIDREQUEST = "Invalid request"
