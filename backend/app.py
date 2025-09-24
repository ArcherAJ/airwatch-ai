from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from routes.overview import overview_bp
from routes.source_analysis import source_analysis_bp
from routes.forecasting import forecasting_bp
from routes.citizen_portal import citizen_portal_bp
from routes.policy_dashboard import policy_dashboard_bp
from routes.modern_api import modern_api_bp
from routes.advanced_features import advanced_features_bp
from routes.advanced_features_enhanced import advanced_features_enhanced_bp
from routes.comprehensive_analysis import comprehensive_bp
from routes.realtime_data import realtime_bp
from routes.enhanced_api import enhanced_api_bp
import os
import time
import logging
from datetime import datetime

# Setup logging
from config.logging_config import setup_logging, log_api_access
setup_logging()

app = Flask(__name__)
CORS(app)

# Request logging middleware
@app.before_request
def log_request():
    request.start_time = time.time()

@app.after_request
def log_response(response):
    if hasattr(request, 'start_time'):
        response_time = (time.time() - request.start_time) * 1000  # Convert to milliseconds
        log_api_access(
            request.method,
            request.path,
            response.status_code,
            round(response_time, 2),
            request.headers.get('User-Agent')
        )
    return response

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found', 'message': 'The requested endpoint does not exist'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'message': 'An unexpected error occurred'}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    logging.getLogger(__name__).error(f"Unhandled exception: {str(e)}", exc_info=True)
    return jsonify({'error': 'Internal server error', 'message': 'An unexpected error occurred'}), 500

# Register blueprints
app.register_blueprint(overview_bp, url_prefix='/api/overview')
app.register_blueprint(source_analysis_bp, url_prefix='/api/source-analysis')
app.register_blueprint(forecasting_bp, url_prefix='/api/forecasting')
app.register_blueprint(citizen_portal_bp, url_prefix='/api/citizen-portal')
app.register_blueprint(policy_dashboard_bp, url_prefix='/api/policy-dashboard')
app.register_blueprint(modern_api_bp, url_prefix='/api/modern')
app.register_blueprint(advanced_features_bp, url_prefix='/api/advanced')
app.register_blueprint(advanced_features_enhanced_bp, url_prefix='/api/advanced-enhanced')
app.register_blueprint(comprehensive_bp, url_prefix='/api/comprehensive')
app.register_blueprint(realtime_bp, url_prefix='/api/realtime')
app.register_blueprint(enhanced_api_bp, url_prefix='/api/v2')

# Serve frontend files
@app.route('/')
def serve_frontend():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory('../frontend', path)

# Health check endpoint
@app.route('/health')
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0',
        'features': {
            'real_time_data': True,
            'enhanced_ai': True,
            'mobile_app': True,
            'policy_enforcement': True
        }
    })

# System status endpoint
@app.route('/api/status')
def system_status():
    """System status endpoint"""
    try:
        # Check if enhanced modules are available
        from utils.enhanced_ai_models import enhanced_forecaster
        from utils.real_time_integration import real_time_integrator
        from utils.advanced_source_identifier import advanced_source_identifier
        from utils.policy_enforcement import policy_enforcement_engine
        
        return jsonify({
            'status': 'operational',
            'timestamp': datetime.now().isoformat(),
            'modules': {
                'enhanced_ai_models': 'available',
                'real_time_integration': 'available',
                'advanced_source_identifier': 'available',
                'policy_enforcement': 'available'
            },
            'api_endpoints': {
                'v1': '/api/',
                'v2': '/api/v2/',
                'health': '/health'
            },
            'features': {
                'real_time_data': True,
                'enhanced_forecasting': True,
                'source_identification': True,
                'policy_enforcement': True,
                'mobile_app': True,
                'pwa_features': True
            }
        })
    except Exception as e:
        logging.getLogger(__name__).error(f"Error checking system status: {e}")
        return jsonify({
            'status': 'degraded',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting AirWatch AI Flask server...")
    print("Server will be available at http://localhost:5000")
    app.run(debug=True, port=5000, host='0.0.0.0')