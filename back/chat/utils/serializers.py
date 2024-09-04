import json

def serialize_message(message, requesting_user=None):
    """Convert a Message object to a JSON-serializable dictionary including user data."""
    return {
        'id': message.id,
        'room_id': message.room.id,
        'user': serialize_user(message.sender, requesting_user=requesting_user)
        'content': message.content,
        'timestamp': message.timestamp.isoformat(),  # Convert datetime to ISO format
    }