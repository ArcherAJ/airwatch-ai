# Free API Keys Setup for AirWatch AI Real-Time Data

## 🌟 **FREE APIs Available (No Credit Card Required)**

### **1. OpenWeatherMap (Recommended)**
- **Website**: https://openweathermap.org/api
- **Free Tier**: 1,000 calls/day
- **Data**: Air quality, weather, forecasts
- **Signup**: Email verification only
- **API Key**: Get immediately after signup

### **2. AirVisual (IQAir)**
- **Website**: https://www.iqair.com/us/air-pollution-data-api
- **Free Tier**: 500 calls/day
- **Data**: Global air quality, city-level data
- **Signup**: Email verification only
- **API Key**: Get immediately after signup

### **3. World Air Quality Index (WAQI)**
- **Website**: https://aqicn.org/api/
- **Free Tier**: 1,000 calls/day
- **Data**: Global air quality, no API key required for basic usage
- **Signup**: Optional (for higher limits)
- **API Key**: Optional but recommended

## 🚀 **Quick Setup Instructions**

### **Step 1: Get OpenWeatherMap API Key**
1. Go to https://openweathermap.org/api
2. Click "Sign Up" (free)
3. Verify your email
4. Go to "API Keys" section
5. Copy your API key

### **Step 2: Get AirVisual API Key**
1. Go to https://www.iqair.com/us/air-pollution-data-api
2. Click "Get Started" (free)
3. Sign up with email
4. Verify your email
5. Copy your API key from dashboard

### **Step 3: Set Environment Variables**
Create a `.env` file in the backend directory:

```bash
# .env file
OPENWEATHER_API_KEY=your_openweather_api_key_here
AIRVISUAL_API_KEY=your_airvisual_api_key_here
WAQI_API_KEY=your_waqi_api_key_here
```

### **Step 4: Install Required Packages**
```bash
pip install requests python-dotenv
```

## 📊 **What You Get with Real-Time Data**

### **Real-Time Air Quality:**
- **PM2.5, PM10**: Fine particulate matter levels
- **SO2, NO2**: Sulfur and nitrogen dioxide
- **CO, O3**: Carbon monoxide and ozone
- **AQI**: Air Quality Index with categories
- **Update Frequency**: Every 10-15 minutes

### **Weather Data:**
- **Temperature**: Current temperature
- **Humidity**: Relative humidity
- **Wind**: Speed and direction
- **Pressure**: Atmospheric pressure

### **Coverage:**
- **10 Delhi Stations**: Central, East, West, South, North Delhi
- **Major Landmarks**: ITO Junction, CP Metro, India Gate
- **Industrial Areas**: Mayapuri Industrial Area
- **Residential Areas**: Dwarka

## 🔧 **API Usage Limits (Free Tiers)**

### **OpenWeatherMap:**
- **Calls per day**: 1,000
- **Calls per minute**: 60
- **Data retention**: 5 days
- **Perfect for**: Real-time monitoring

### **AirVisual:**
- **Calls per day**: 500
- **Calls per minute**: 30
- **Data retention**: 7 days
- **Perfect for**: City-level data

### **WAQI:**
- **Calls per day**: 1,000
- **Calls per minute**: 100
- **Data retention**: 30 days
- **Perfect for**: Global coverage

## 💡 **Smart Usage Tips**

### **1. Caching Strategy:**
- Cache data for 10-15 minutes
- Reduce API calls by 90%
- Still get near real-time updates

### **2. Fallback System:**
- Use mock data when APIs fail
- Multiple API sources for redundancy
- Graceful degradation

### **3. Rate Limiting:**
- Implement delays between calls
- Monitor usage statistics
- Alert when approaching limits

## 🎯 **Expected Results**

### **With Real-Time Data:**
- ✅ **Actual Delhi air quality** (not simulated)
- ✅ **Live weather conditions**
- ✅ **Real pollution patterns**
- ✅ **Accurate health advisories**
- ✅ **Genuine forecasting**

### **Performance:**
- **Response Time**: 2-5 seconds
- **Data Freshness**: 10-15 minutes
- **Reliability**: 95%+ uptime
- **Accuracy**: Real measurements

## 🚨 **Important Notes**

### **Rate Limiting:**
- Free APIs have daily limits
- Implement caching to stay within limits
- Monitor usage to avoid hitting limits

### **Data Quality:**
- Real data may have gaps
- Some stations may be offline
- Weather affects accuracy

### **Cost:**
- **Free tier**: Sufficient for development/demo
- **Paid tiers**: Required for production scale
- **Typical cost**: $10-50/month for production

## 🔄 **Migration from Mock to Real Data**

### **Current State:**
- Mock data for all stations
- Simulated patterns
- No API dependencies

### **With Real APIs:**
- Real measurements from Delhi
- Actual weather conditions
- Live pollution patterns
- Genuine forecasting

### **Hybrid Approach:**
- Use real data when available
- Fall back to mock data when APIs fail
- Best of both worlds

## 📈 **Next Steps**

1. **Get API Keys** (5 minutes)
2. **Set Environment Variables** (2 minutes)
3. **Test Real-Time Data** (1 minute)
4. **Deploy with Real Data** (Ready!)

The system is designed to work with or without real APIs, so you can start with mock data and add real APIs when ready!
