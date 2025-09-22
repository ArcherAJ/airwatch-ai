from flask import Flask, jsonify, send_from_directory
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
import os

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(overview_bp, url_prefix='/api/overview')
app.register_blueprint(source_analysis_bp, url_prefix='/api/source-analysis')
app.register_blueprint(forecasting_bp, url_prefix='/api/forecasting')
app.register_blueprint(citizen_portal_bp, url_prefix='/api/citizen-portal')
app.register_blueprint(policy_dashboard_bp, url_prefix='/api/policy-dashboard')
app.register_blueprint(modern_api_bp, url_prefix='/api/modern')
app.register_blueprint(advanced_features_bp, url_prefix='/api/advanced')
app.register_blueprint(advanced_features_enhanced_bp, url_prefix='/api/advanced')
app.register_blueprint(comprehensive_bp, url_prefix='/api/comprehensive')
app.register_blueprint(realtime_bp, url_prefix='/api/realtime')

# Serve frontend files
@app.route('/')
def serve_frontend():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory('../frontend', path)

if __name__ == '__main__':
    print("Starting AirWatch AI Flask server...")
    print("Server will be available at http://localhost:5000")
    app.run(debug=True, port=5000, host='0.0.0.0')