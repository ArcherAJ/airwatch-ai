# Map API Setup Guide for AirWatch AI

This guide will help you set up API keys for better satellite imagery in the Delhi map section.

## 🗺️ Supported Map Services

### 1. Google Maps API (Recommended)
**Best quality satellite imagery**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Maps Static API**
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Copy the API key

**Setup:**
```javascript
// In frontend/js/map-config.js
googleMapsApiKey: 'YOUR_ACTUAL_GOOGLE_API_KEY_HERE'
```

### 2. Mapbox API (Alternative)
**Good satellite imagery with free tier**

1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Sign up for a free account
3. Go to [Access Tokens](https://account.mapbox.com/access-tokens/)
4. Copy your default public token

**Setup:**
```javascript
// In frontend/js/map-config.js
mapboxApiKey: 'pk.your_actual_mapbox_token_here'
```

### 3. OpenStreetMap (No API Key Required)
**Free but lower quality**

No setup required - works out of the box!

## 🔧 Configuration Steps

### Step 1: Edit the Configuration File
Open `frontend/js/map-config.js` and replace the placeholder keys:

```javascript
const MapConfig = {
    // Replace with your actual Google Maps API key
    googleMapsApiKey: 'YOUR_ACTUAL_GOOGLE_API_KEY_HERE',
    
    // Replace with your actual Mapbox token
    mapboxApiKey: 'pk.your_actual_mapbox_token_here',
    
    // Other settings...
};
```

### Step 2: Test the Setup
1. Start the Flask server: `python app.py`
2. Open `http://localhost:5000`
3. Navigate to the Hyperlocal section
4. Check if the satellite map loads correctly

### Step 3: Troubleshooting

**If satellite images don't load:**
1. Check browser console for error messages
2. Verify API key is correct
3. Ensure API is enabled in your service dashboard
4. Check API quotas and billing

**Fallback behavior:**
- If all APIs fail, the map will show a styled gradient background
- AQI markers will still work correctly
- The system gracefully degrades without breaking

## 🎯 API Usage Limits

### Google Maps Static API
- **Free tier**: 25,000 requests per day
- **Cost**: $2 per 1,000 requests after free tier

### Mapbox
- **Free tier**: 50,000 requests per month
- **Cost**: $0.50 per 1,000 requests after free tier

### OpenStreetMap
- **Free**: No limits (but please be respectful)
- **Quality**: Lower resolution satellite imagery

## 🔒 Security Best Practices

1. **Restrict API Keys**: Limit to your domain only
2. **Monitor Usage**: Set up billing alerts
3. **Rotate Keys**: Regularly update your API keys
4. **Environment Variables**: Don't commit API keys to version control

## 📍 Delhi Map Coordinates

The map is centered on Delhi with these coordinates:
- **Center**: 28.6139°N, 77.2090°E
- **Zoom Level**: 10 (city view)
- **Map Size**: 600x400 pixels

## 🚀 Advanced Configuration

### Custom Map Styles
You can customize the map appearance by modifying the API endpoints:

```javascript
// Custom Google Maps style
endpoints: {
    googleMaps: (lat, lon, zoom, size) => 
        `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=${zoom}&size=${size}&maptype=satellite&style=element:geometry%7Ccolor:0x212121&key=${MapConfig.googleMapsApiKey}`
}
```

### Multiple Fallback Options
The system automatically tries multiple APIs in order:
1. Mapbox Satellite
2. ArcGIS Satellite
3. OpenStreetMap
4. Styled gradient fallback

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API keys are correct
3. Ensure APIs are enabled in your service dashboards
4. Check your internet connection

The system is designed to work even without API keys, so your AirWatch AI application will function normally!
