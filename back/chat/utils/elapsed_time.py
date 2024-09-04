from datetime import datetime
from django.utils import timezone

def elapsed_time(time: datetime) -> str:
    """
    Calculate the human-readable elapsed time from the given timestamp to now.

    :param message_time: datetime object representing a timestamp.
    :return: A string describing the elapsed time.
    """
    now = timezone.now()
    elapsed = now - time

    # Convert elapsed time to a human-readable format
    if elapsed.total_seconds() < 60:
        return f"{int(elapsed.total_seconds())}s"
    elif elapsed.total_seconds() < 3600:
        return f"{int(elapsed.total_seconds() / 60)}m"
    elif elapsed.total_seconds() < 86400:
        return f"{int(elapsed.total_seconds() / 3600)}h"
    else:
        return f"{int(elapsed.total_seconds() / 86400)}d"