"""
Logging Configuration for AirWatch AI
Comprehensive logging setup for production and development
"""

import logging
import logging.handlers
import os
from datetime import datetime

def setup_logging():
    """Setup comprehensive logging configuration"""
    
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(os.path.dirname(__file__), '..', 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Clear existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    root_logger.addHandler(console_handler)
    
    # File handler for general logs
    file_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, 'airwatch_ai.log'),
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(detailed_formatter)
    root_logger.addHandler(file_handler)
    
    # Error file handler
    error_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, 'errors.log'),
        maxBytes=5*1024*1024,  # 5MB
        backupCount=3
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    root_logger.addHandler(error_handler)
    
    # API access log handler
    api_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, 'api_access.log'),
        maxBytes=20*1024*1024,  # 20MB
        backupCount=10
    )
    api_handler.setLevel(logging.INFO)
    api_handler.setFormatter(detailed_formatter)
    
    # Create API logger
    api_logger = logging.getLogger('api_access')
    api_logger.addHandler(api_handler)
    api_logger.setLevel(logging.INFO)
    api_logger.propagate = False
    
    # AI/ML model logger
    ai_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, 'ai_models.log'),
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    ai_handler.setLevel(logging.INFO)
    ai_handler.setFormatter(detailed_formatter)
    
    ai_logger = logging.getLogger('ai_models')
    ai_logger.addHandler(ai_handler)
    ai_logger.setLevel(logging.INFO)
    ai_logger.propagate = False
    
    # Real-time data logger
    rt_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, 'realtime_data.log'),
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    rt_handler.setLevel(logging.INFO)
    rt_handler.setFormatter(detailed_formatter)
    
    rt_logger = logging.getLogger('realtime_data')
    rt_logger.addHandler(rt_handler)
    rt_logger.setLevel(logging.INFO)
    rt_logger.propagate = False
    
    # Suppress noisy third-party loggers
    logging.getLogger('tensorflow').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('requests').setLevel(logging.WARNING)
    
    # Log startup message
    logger = logging.getLogger(__name__)
    logger.info("=" * 60)
    logger.info("AirWatch AI - Logging System Initialized")
    logger.info(f"Startup Time: {datetime.now().isoformat()}")
    logger.info(f"Log Directory: {log_dir}")
    logger.info("=" * 60)

def get_logger(name):
    """Get a logger instance with the given name"""
    return logging.getLogger(name)

def log_api_access(method, endpoint, status_code, response_time, user_agent=None):
    """Log API access for monitoring and analytics"""
    api_logger = logging.getLogger('api_access')
    api_logger.info(
        f"{method} {endpoint} - Status: {status_code} - "
        f"Response Time: {response_time}ms - User Agent: {user_agent or 'Unknown'}"
    )

def log_ai_model_performance(model_name, accuracy, response_time, features_count):
    """Log AI model performance metrics"""
    ai_logger = logging.getLogger('ai_models')
    ai_logger.info(
        f"Model: {model_name} - Accuracy: {accuracy:.2f}% - "
        f"Response Time: {response_time}ms - Features: {features_count}"
    )

def log_data_source_status(source_name, status, response_time, data_quality):
    """Log real-time data source status"""
    rt_logger = logging.getLogger('realtime_data')
    rt_logger.info(
        f"Source: {source_name} - Status: {status} - "
        f"Response Time: {response_time}ms - Quality: {data_quality}"
    )

def log_error(error, context=None):
    """Log errors with context"""
    logger = logging.getLogger(__name__)
    error_msg = f"Error: {str(error)}"
    if context:
        error_msg += f" - Context: {context}"
    logger.error(error_msg, exc_info=True)
