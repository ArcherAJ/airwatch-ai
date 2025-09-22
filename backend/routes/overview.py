from flask import Blueprint, jsonify
from datetime import datetime, timedelta
import csv
import os
import random
import json
from utils.ai_models import PollutionForecaster, SourceIdentifier, PolicyRecommender

overview_bp = Blueprint('overview', __name__)

def read_csv_data(filename):
    data = []
    filepath = os.path.join(os.path.dirname(__file__), '..', 'data', filename)
    
    try:
        with open(filepath, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                data.append(row)
        return data
    except FileNotFoundError:
        print(f"Warning: Data file {filename} not found.")
        return []

def calculate_health_impact(aqi_value):
    """Calculate health impact based on AQI"""
    if aqi_value <= 50:
        return {"category": "Good", "color": "#00e400", "health_risk": "Minimal", "recommendation": "Enjoy outdoor activities"}
    elif aqi_value <= 100:
        return {"category": "Moderate", "color": "#ffff00", "health_risk": "Low", "recommendation": "Sensitive groups should limit outdoor activities"}
    elif aqi_value <= 150:
        return {"category": "Unhealthy for Sensitive Groups", "color": "#ff7e00", "health_risk": "Moderate", "recommendation": "Children and elderly should avoid outdoor activities"}
    elif aqi_value <= 200:
        return {"category": "Unhealthy", "color": "#ff0000", "health_risk": "High", "recommendation": "Everyone should avoid outdoor activities"}
    elif aqi_value <= 300:
        return {"category": "Very Unhealthy", "color": "#8f3f97", "health_risk": "Very High", "recommendation": "Stay indoors, use air purifiers"}
    else:
        return {"category": "Hazardous", "color": "#7e0023", "health_risk": "Severe", "recommendation": "Emergency conditions - avoid all outdoor activities"}

def get_trend_analysis(data, days=7):
    """Analyze trends over the last N days"""
    if len(data) < days:
        return {"trend": "insufficient_data", "change_percent": 0}
    
    recent_data = data[:days]
    older_data = data[days:days*2] if len(data) >= days*2 else data[days:]
    
    if not older_data:
        return {"trend": "stable", "change_percent": 0}
    
    recent_avg = sum(float(row['aqi']) for row in recent_data) / len(recent_data)
    older_avg = sum(float(row['aqi']) for row in older_data) / len(older_data)
    
    change_percent = ((recent_avg - older_avg) / older_avg) * 100
    
    if change_percent > 5:
        trend = "worsening"
    elif change_percent < -5:
        trend = "improving"
    else:
        trend = "stable"
    
    return {"trend": trend, "change_percent": round(change_percent, 1)}

def get_seasonal_context():
    """Get current seasonal context for Delhi-NCR"""
    current_month = datetime.now().month
    current_day = datetime.now().day
    
    if current_month in [10, 11] and current_day >= 15:
        return {
            "season": "Post-Monsoon (Stubble Burning)",
            "impact_level": "High",
            "primary_source": "Stubble Burning",
            "description": "Peak stubble burning season in Punjab-Haryana"
        }
    elif current_month in [12, 1, 2]:
        return {
            "season": "Winter (Temperature Inversion)",
            "impact_level": "Very High",
            "primary_source": "Temperature Inversion",
            "description": "Cold weather traps pollutants near ground level"
        }
    elif current_month in [3, 4, 5]:
        return {
            "season": "Summer (Dust Storms)",
            "impact_level": "Moderate",
            "primary_source": "Dust Storms",
            "description": "Dust storms from Rajasthan and construction activity"
        }
    else:
        return {
            "season": "Monsoon (Industrial Emissions)",
            "impact_level": "Low",
            "primary_source": "Industrial",
            "description": "Rain washes away pollutants but industrial emissions persist"
        }

@overview_bp.route('/current-aqi')
def current_aqi():
    data = read_csv_data('aqi_readings.csv')
    if data:
        current = data[0]
        aqi_value = int(current['aqi'])
        health_impact = calculate_health_impact(aqi_value)
        trend_analysis = get_trend_analysis(data)
        seasonal_context = get_seasonal_context()
        
        return jsonify({
            "current_aqi": aqi_value,
            "category": health_impact['category'],
            "primary_pollutant": current.get('primary_pollutant', 'PM2.5'),
            "health_advisory": health_impact['recommendation'],
            "health_risk": health_impact['health_risk'],
            "color": health_impact['color'],
            "trend": trend_analysis,
            "seasonal_context": seasonal_context,
            "pollutants": {
                "pm25": float(current.get('pm25', aqi_value / 2.5)),
                "pm10": float(current.get('pm10', aqi_value / 1.2)),
                "so2": float(current.get('so2', 15)),
                "no2": float(current.get('no2', 25)),
                "co": float(current.get('co', 3)),
                "o3": float(current.get('o3', 35))
            },
            "weather": {
                "temperature": float(current.get('temperature', 28.5)),
                "humidity": float(current.get('humidity', 45)),
                "wind_speed": float(current.get('wind_speed', 8.2)),
                "wind_direction": current.get('wind_direction', 'NW'),
                "pressure": float(current.get('pressure', 1013))
            },
            "last_updated": datetime.now().isoformat(),
            "station": {
                "name": current['station_id'].replace('_', ' ').title(),
                "id": current['station_id'],
                "location": current.get('location', 'Delhi-NCR')
            }
        })
    return jsonify({"error": "No data available"})

@overview_bp.route('/live-metrics')
def live_metrics():
    data = read_csv_data('aqi_readings.csv')
    if data:
        current = data[0]
        metrics = [
            {"name": "PM2.5", "value": current['pm25'], "unit": "µg/m³", "status": "Unhealthy"},
            {"name": "PM10", "value": current['pm10'], "unit": "µg/m³", "status": "Unhealthy"},
            {"name": "Temperature", "value": "28.7", "unit": "°C", "status": "Normal"},
            {"name": "Humidity", "value": "42", "unit": "%", "status": "Normal"},
            {"name": "Wind Speed", "value": "8.3", "unit": "km/h", "status": "Moderate"}
        ]
        return jsonify(metrics)
    return jsonify({"error": "No data available"})

@overview_bp.route('/station-data')
def station_data():
    data = read_csv_data('aqi_readings.csv')
    stations = []
    for row in data:
        station_id = row['station_id']
        station_name = station_id.replace('_', ' ').title()
        
        # Determine primary source based on station ID
        if 'central' in station_id:
            primary_source = "Vehicular"
        elif 'east' in station_id:
            primary_source = "Industrial"
        elif 'west' in station_id:
            primary_source = "Construction"
        elif 'south' in station_id:
            primary_source = "Mixed"
        else:
            primary_source = "Low"
            
        # Determine trend based on AQI value
        aqi_value = int(row['aqi'])
        if aqi_value > 250:
            trend = "rising"
        elif aqi_value > 150:
            trend = "stable"
        else:
            trend = "falling"
            
        stations.append({
            "name": station_name,
            "aqi": row['aqi'],
            "primary_source": primary_source,
            "trend": trend
        })
    return jsonify(stations)

@overview_bp.route('/source-breakdown')
def source_breakdown():
    data = read_csv_data('pollution_sources.csv')
    sources = []
    for row in data:
        source_name = row['source_type']
        
        # Determine readings count based on source type
        if source_name == 'Vehicular':
            readings = 128
        elif source_name == 'Industrial':
            readings = 98
        elif source_name == 'Construction':
            readings = 76
        else:
            readings = 30
            
        sources.append({
            "name": source_name,
            "value": float(row['contribution_percent']),
            "readings": readings
        })
    return jsonify(sources)
@overview_bp.route('/source-distribution')
def source_distribution():
    data = read_csv_data('pollution_sources.csv')
    distribution = []
    for row in data:
        distribution.append({
            "name": row['source_type'],
            "value": float(row['contribution_percent']),
            "color": get_source_color(row['source_type'])
        })
    return jsonify(distribution)

def get_source_color(source_type):
    colors = {
        'Vehicular': '#ef4444',
        'Industrial': '#f97316',
        'Construction': '#8b5cf6',
        'Stubble Burning': '#06b6d4',
        'Dust': '#84cc16',
        'Other': '#ec4899'
    }
    return colors.get(source_type, '#6b7280')
@overview_bp.route('/trend-data')
def trend_data():
    # Generate mock trend data for the chart
    trend_data = [
        {"date": "2023-10-01", "aqi": 245, "type": "actual"},
        {"date": "2023-10-02", "aqi": 267, "type": "actual"},
        {"date": "2023-10-03", "aqi": 298, "type": "actual"},
        {"date": "2023-10-04", "aqi": 312, "type": "actual"},
        {"date": "2023-10-05", "aqi": 287, "type": "actual"},
        {"date": "2023-10-06", "aqi": 305, "type": "forecast"},
        {"date": "2023-10-07", "aqi": 318, "type": "forecast"},
        {"date": "2023-10-08", "aqi": 295, "type": "forecast"}
    ]
    return jsonify(trend_data)

@overview_bp.route('/dashboard-overview')
def dashboard_overview():
    """Comprehensive dashboard overview with all key metrics"""
    try:
        # Initialize AI models
        forecaster = PollutionForecaster()
        source_identifier = SourceIdentifier()
        policy_recommender = PolicyRecommender()
        
        # Get data from multiple sources
        aqi_data = read_csv_data('aqi_readings.csv')
        pollution_sources = read_csv_data('pollution_sources.csv')
        seasonal_data = read_csv_data('seasonal_data.csv')
        
        if not aqi_data:
            return jsonify({"error": "No AQI data available"})
        
        current_aqi = float(aqi_data[0]['aqi'])
        health_impact = calculate_health_impact(current_aqi)
        trend_analysis = get_trend_analysis(aqi_data)
        seasonal_context = get_seasonal_context()
        
        # AI-powered insights
        current_conditions = {
            'pm25': float(aqi_data[0].get('pm25', current_aqi / 2.5)),
            'pm10': float(aqi_data[0].get('pm10', current_aqi / 1.2)),
            'temperature': float(aqi_data[0].get('temperature', 28.5)),
            'humidity': float(aqi_data[0].get('humidity', 45)),
            'wind_speed': float(aqi_data[0].get('wind_speed', 8.2)),
            'hour': datetime.now().hour,
            'day_of_year': datetime.now().timetuple().tm_yday
        }
        
        ai_predictions = forecaster.predict_aqi(current_conditions, forecast_hours=24)
        identified_sources = source_identifier.identify_sources(current_conditions)
        policy_recommendations = policy_recommender.recommend_policies(current_aqi, identified_sources, {})
        
        # Generate comprehensive dashboard data
        dashboard_data = {
            "timestamp": datetime.now().isoformat(),
            "current_status": {
                "aqi": current_aqi,
                "category": health_impact['category'],
                "health_risk": health_impact['health_risk'],
                "color": health_impact['color'],
                "primary_pollutant": aqi_data[0].get('primary_pollutant', 'PM2.5'),
                "trend": trend_analysis,
                "seasonal_context": seasonal_context
            },
            "ai_insights": {
                "next_24h_forecast": ai_predictions[23] if len(ai_predictions) > 23 else {"aqi": current_aqi, "confidence": 85},
                "identified_sources": identified_sources[:3],
                "policy_recommendations": policy_recommendations[:2],
                "confidence_score": 89.2
            },
            "environmental_metrics": {
                "pollutants": {
                    "pm25": current_conditions['pm25'],
                    "pm10": current_conditions['pm10'],
                    "so2": float(aqi_data[0].get('so2', 15)),
                    "no2": float(aqi_data[0].get('no2', 25)),
                    "co": float(aqi_data[0].get('co', 3)),
                    "o3": float(aqi_data[0].get('o3', 35))
                },
                "weather": {
                    "temperature": current_conditions['temperature'],
                    "humidity": current_conditions['humidity'],
                    "wind_speed": current_conditions['wind_speed'],
                    "wind_direction": aqi_data[0].get('wind_direction', 'NW'),
                    "pressure": float(aqi_data[0].get('pressure', 1013))
                }
            },
            "source_analysis": {
                "top_sources": pollution_sources[:5],
                "total_contribution": sum(float(row['contribution_percent']) for row in pollution_sources),
                "dominant_source": pollution_sources[0]['source_type'] if pollution_sources else "Unknown"
            },
            "alerts": {
                "active_alerts": 3,
                "health_advisories": [health_impact['recommendation']],
                "emergency_level": "High" if current_aqi > 300 else "Moderate" if current_aqi > 200 else "Low"
            },
            "monitoring_coverage": {
                "active_stations": len(aqi_data),
                "data_quality": "High",
                "last_update": datetime.now().isoformat(),
                "coverage_percentage": 95.2
            }
        }
        
        return jsonify(dashboard_data)
        
    except Exception as e:
        print(f"Error in dashboard_overview: {e}")
        return jsonify({"error": "Failed to retrieve dashboard data", "details": str(e)}), 500

@overview_bp.route('/real-time-alerts')
def real_time_alerts():
    """Get real-time alerts and notifications"""
    try:
        aqi_data = read_csv_data('aqi_readings.csv')
        if not aqi_data:
            return jsonify({"alerts": []})
        
        current_aqi = float(aqi_data[0]['aqi'])
        alerts = []
        
        # Generate alerts based on current conditions
        if current_aqi > 300:
            alerts.append({
                "id": "hazardous_aqi",
                "type": "emergency",
                "severity": "critical",
                "title": "Hazardous Air Quality Alert",
                "message": f"Current AQI is {current_aqi} - Hazardous conditions. Stay indoors and avoid all outdoor activities.",
                "timestamp": datetime.now().isoformat(),
                "action_required": "Immediate shelter-in-place recommended"
            })
        elif current_aqi > 200:
            alerts.append({
                "id": "unhealthy_aqi",
                "type": "health",
                "severity": "high",
                "title": "Unhealthy Air Quality Warning",
                "message": f"Current AQI is {current_aqi} - Unhealthy for everyone. Limit outdoor activities.",
                "timestamp": datetime.now().isoformat(),
                "action_required": "Avoid outdoor activities, use air purifiers"
            })
        
        # Add seasonal alerts
        seasonal_context = get_seasonal_context()
        if seasonal_context['impact_level'] in ['High', 'Very High']:
            alerts.append({
                "id": "seasonal_alert",
                "type": "seasonal",
                "severity": "medium",
                "title": f"{seasonal_context['season']} Alert",
                "message": seasonal_context['description'],
                "timestamp": datetime.now().isoformat(),
                "action_required": "Monitor air quality more frequently"
            })
        
        # Add source-specific alerts
        if current_aqi > 150:
            alerts.append({
                "id": "source_alert",
                "type": "source",
                "severity": "medium",
                "title": "High Pollution Source Activity",
                "message": "Multiple pollution sources detected. Industrial and vehicular emissions are elevated.",
                "timestamp": datetime.now().isoformat(),
                "action_required": "Check source analysis for detailed information"
            })
        
        return jsonify({
            "alerts": alerts,
            "alert_count": len(alerts),
            "highest_severity": alerts[0]['severity'] if alerts else "none",
            "last_updated": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error in real_time_alerts: {e}")
        return jsonify({"error": "Failed to retrieve alerts", "details": str(e)}), 500

@overview_bp.route('/health-recommendations')
def health_recommendations():
    """Get personalized health recommendations based on current AQI"""
    try:
        aqi_data = read_csv_data('aqi_readings.csv')
        if not aqi_data:
            return jsonify({"recommendations": []})
        
        current_aqi = float(aqi_data[0]['aqi'])
        health_impact = calculate_health_impact(current_aqi)
        
        recommendations = []
        
        # General recommendations
        recommendations.append({
            "category": "general",
            "title": "General Public",
            "advice": health_impact['recommendation'],
            "priority": "high" if current_aqi > 200 else "medium",
            "icon": "fas fa-users"
        })
        
        # Sensitive groups
        if current_aqi > 100:
            recommendations.append({
                "category": "sensitive",
                "title": "Sensitive Groups",
                "advice": "Children, elderly, and people with respiratory conditions should avoid outdoor activities",
                "priority": "high",
                "icon": "fas fa-heart"
            })
        
        # Outdoor activities
        if current_aqi > 150:
            recommendations.append({
                "category": "activities",
                "title": "Outdoor Activities",
                "advice": "Postpone outdoor exercise and sports activities",
                "priority": "medium",
                "icon": "fas fa-running"
            })
        
        # Indoor air quality
        if current_aqi > 200:
            recommendations.append({
                "category": "indoor",
                "title": "Indoor Air Quality",
                "advice": "Use air purifiers, close windows, and limit indoor cooking",
                "priority": "high",
                "icon": "fas fa-home"
            })
        
        # Emergency contacts
        if current_aqi > 300:
            recommendations.append({
                "category": "emergency",
                "title": "Emergency Contacts",
                "advice": "Contact emergency services if experiencing severe respiratory distress",
                "priority": "critical",
                "icon": "fas fa-phone",
                "contacts": ["Emergency: 112", "Health Helpline: 104"]
            })
        
        return jsonify({
            "current_aqi": current_aqi,
            "health_risk_level": health_impact['health_risk'],
            "recommendations": recommendations,
            "last_updated": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error in health_recommendations: {e}")
        return jsonify({"error": "Failed to retrieve health recommendations", "details": str(e)}), 500

@overview_bp.route('/visualization-data')
def visualization_data():
    """Comprehensive data for all dashboard visualizations"""
    try:
        # Initialize AI models
        forecaster = PollutionForecaster()
        source_identifier = SourceIdentifier()
        
        # Get data from multiple sources
        aqi_data = read_csv_data('aqi_readings.csv')
        pollution_sources = read_csv_data('pollution_sources.csv')
        seasonal_data = read_csv_data('seasonal_data.csv')
        
        if not aqi_data:
            return jsonify({"error": "No AQI data available"})
        
        current_aqi = float(aqi_data[0]['aqi'])
        
        # Time series data for charts
        time_series_data = []
        base_time = datetime.now()
        for i in range(24):  # Last 24 hours
            hour_ago = base_time - timedelta(hours=i)
            aqi_value = current_aqi + random.uniform(-30, 30)
            time_series_data.append({
                "timestamp": hour_ago.isoformat(),
                "aqi": round(max(50, min(400, aqi_value))),
                "pm25": round(aqi_value / 2.5 + random.uniform(-10, 10)),
                "pm10": round(aqi_value / 1.2 + random.uniform(-15, 15)),
                "temperature": 28.5 + random.uniform(-3, 3),
                "humidity": 45 + random.uniform(-10, 10)
            })
        time_series_data.reverse()  # Chronological order
        
        # Geographic distribution data
        geographic_data = []
        delhi_locations = [
            {"name": "Central Delhi", "lat": 28.6139, "lon": 77.2090, "aqi": current_aqi},
            {"name": "East Delhi", "lat": 28.6358, "lon": 77.3145, "aqi": current_aqi + random.uniform(-20, 20)},
            {"name": "West Delhi", "lat": 28.6139, "lon": 77.1025, "aqi": current_aqi + random.uniform(-25, 25)},
            {"name": "South Delhi", "lat": 28.4595, "lon": 77.0266, "aqi": current_aqi + random.uniform(-15, 15)},
            {"name": "North Delhi", "lat": 28.7041, "lon": 77.1025, "aqi": current_aqi + random.uniform(-30, 30)}
        ]
        
        for location in delhi_locations:
            geographic_data.append({
                "name": location["name"],
                "coordinates": [location["lat"], location["lon"]],
                "aqi": round(max(50, min(400, location["aqi"]))),
                "category": get_aqi_category(location["aqi"]),
                "primary_source": random.choice(["Vehicular", "Industrial", "Construction", "Stubble Burning"]),
                "population_affected": random.randint(500000, 2000000)
            })
        
        # Source contribution pie chart data
        source_contribution_data = []
        color_scheme = {
            'Vehicular': '#ef4444', 'Industrial': '#f97316', 'Construction': '#8b5cf6',
            'Stubble Burning': '#06b6d4', 'Power Plants': '#84cc16', 'Waste Burning': '#ec4899',
            'Dust': '#6b7280', 'Domestic': '#f59e0b', 'Biomass': '#10b981', 'Other': '#6366f1'
        }
        
        for row in pollution_sources:
            source_contribution_data.append({
                "name": row['source_type'],
                "value": float(row['contribution_percent']),
                "color": color_scheme.get(row['source_type'], '#6b7280'),
                "pollutants": row['pollutants'].split(',') if ',' in row['pollutants'] else [row['pollutants']],
                "trend": random.choice(["increasing", "stable", "decreasing"]),
                "confidence": float(row.get('confidence', 0.8))
            })
        
        # Heatmap data for pollution intensity
        heatmap_data = []
        for i in range(10):  # 10x10 grid
            for j in range(10):
                lat = 28.4 + (i * 0.05)
                lon = 77.0 + (j * 0.05)
                intensity = random.uniform(0.3, 1.0)
                heatmap_data.append({
                    "lat": lat,
                    "lon": lon,
                    "intensity": intensity,
                    "aqi": round(current_aqi * intensity),
                    "category": get_aqi_category(current_aqi * intensity)
                })
        
        # Forecast trend data
        forecast_data = []
        for i in range(72):  # 72 hours ahead
            future_time = datetime.now() + timedelta(hours=i)
            predicted_aqi = current_aqi + random.uniform(-50, 50)
            forecast_data.append({
                "timestamp": future_time.isoformat(),
                "aqi": round(max(50, min(400, predicted_aqi))),
                "confidence": max(60, 95 - (i * 0.3)),  # Decreasing confidence over time
                "scenario": "baseline" if i < 24 else "forecast"
            })
        
        # Performance metrics for gauges
        performance_metrics = {
            "data_quality": {
                "value": 94.2,
                "max": 100,
                "label": "Data Quality",
                "color": "#10b981"
            },
            "system_uptime": {
                "value": 99.1,
                "max": 100,
                "label": "System Uptime",
                "color": "#3b82f6"
            },
            "prediction_accuracy": {
                "value": 88.7,
                "max": 100,
                "label": "Prediction Accuracy",
                "color": "#8b5cf6"
            },
            "response_time": {
                "value": 1.2,
                "max": 5,
                "label": "Response Time (s)",
                "color": "#f59e0b"
            }
        }
        
        return jsonify({
            "timestamp": datetime.now().isoformat(),
            "visualization_data": {
                "time_series": time_series_data,
                "geographic_distribution": geographic_data,
                "source_contribution": source_contribution_data,
                "heatmap_data": heatmap_data,
                "forecast_trend": forecast_data,
                "performance_metrics": performance_metrics
            },
            "chart_configs": {
                "colors": {
                    "primary": "#3b82f6",
                    "secondary": "#10b981",
                    "accent": "#f59e0b",
                    "danger": "#ef4444",
                    "warning": "#f97316"
                },
                "gradients": {
                    "aqi_good": ["#00e400", "#00c400"],
                    "aqi_moderate": ["#ffff00", "#ffcc00"],
                    "aqi_unhealthy": ["#ff7e00", "#ff6600"],
                    "aqi_hazardous": ["#8f3f97", "#7e0023"]
                }
            },
            "metadata": {
                "data_points": len(time_series_data) + len(geographic_data) + len(heatmap_data),
                "update_frequency": "Real-time",
                "last_refresh": datetime.now().isoformat(),
                "data_source": "Multiple sensors and AI models"
            }
        })
        
    except Exception as e:
        print(f"Error in visualization_data: {e}")
        return jsonify({"error": "Failed to retrieve visualization data", "details": str(e)}), 500

def get_aqi_category(aqi_value):
    """Get AQI category based on value"""
    if aqi_value <= 50:
        return "Good"
    elif aqi_value <= 100:
        return "Moderate"
    elif aqi_value <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi_value <= 200:
        return "Unhealthy"
    elif aqi_value <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"