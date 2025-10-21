import logging

logger = logging.getLogger(__name__)

def log_websocket_event(message, level='info'):
    """Логирование WebSocket событий"""
    if level == 'error':
        logger.error(f"WebSocket: {message}")
    elif level == 'warning':
        logger.warning(f"WebSocket: {message}")
    else:
        logger.info(f"WebSocket: {message}")