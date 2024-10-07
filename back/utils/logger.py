import logging
import inspect

class Logger:
    def __init__(self):
        self._logClassIdentifier: str | None = None

    def log(self, message: str, is_error: bool = False):
        callframe = inspect.currentframe()
        caller = inspect.getouterframes(callframe, 2)[1][3]
        if not is_error:
            self.info(message, caller)
        else:
            self.error(message, caller)

    def info(self, message: str, caller: str | None = None):
        if caller is None:
            callframe = inspect.currentframe()
            lastframe = inspect.getouterframes(callframe, 2)
            caller = lastframe[1][3]
        idstr = f"{'(' + self._logClassIdentifier + ')' if self._logClassIdentifier is not None else ''}"
        logmsg = f"[{type(self).__name__} {idstr} from {caller}]: {message}"
        logging.info(logmsg)

    def error(self, message: str, caller: str | None = None):
        if caller is None:
            callframe = inspect.currentframe()
            lastframe = inspect.getouterframes(callframe, 2)
            caller = lastframe[1][3]
        idstr = f"{'(' + self._logClassIdentifier + ')' if self._logClassIdentifier is not None else ''}"
        logmsg = f"[{type(self).__name__} {idstr} from {caller}]: {message}"
        logging.error(logmsg)
