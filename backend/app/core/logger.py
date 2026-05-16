import logging
import sys

def get_logger():
    logger = logging.getLogger("cahbot_backend")
    
    # Only configure if no handlers exist
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        # Create formatter: [backend] YYYY-MM-DD HH:MM:SS - INFO - Message
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
        
        # Create console handler
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(logging.INFO)
        ch.setFormatter(formatter)
        
        logger.addHandler(ch)
        logger.propagate = False
        
    return logger

logger = get_logger()
