import axios from 'axios';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export const getCoordinates = async (cityName) => {
  try {
    const response = await axios.get(GEO_URL, {
      params: {
        name: cityName,
        count: 1,
        language: 'en',
        format: 'json'
      }
    });
    
    if (response.data.results && response.data.results.length > 0) {
      return {
        lat: response.data.results[0].latitude,
        lon: response.data.results[0].longitude,
        name: response.data.results[0].name,
        country: response.data.results[0].country
      };
    }
    throw new Error('City not found');
  } catch (error) {
    console.error('Error finding city:', error);
    throw error;
  }
};

export const getWeather = async (lat, lon) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current: ["temperature_2m", "relative_humidity_2m", "weather_code", "wind_speed_10m", "pressure_msl", "is_day"],
        hourly: ["temperature_2m", "weather_code"],
        daily: ["weather_code", "temperature_2m_max", "temperature_2m_min", "sunrise", "sunset"],
        timezone: "auto",
        forecast_days: 7
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting weather:', error);
    throw error;
  }
};

export const getWeatherDescription = (code, isDay = 1) => {
  const numCode = Number(code);
  
  const weatherMap = {
    0: { text: 'Clear sky', icon: 'sun' },
    1: { text: 'Mainly clear', icon: 'sun' },
    2: { text: 'Partly cloudy', icon: 'cloud-sun' },
    3: { text: 'Overcast', icon: 'cloud' },
    45: { text: 'Fog', icon: 'smog' },
    48: { text: 'Rime fog', icon: 'smog' },
    51: { text: 'Light drizzle', icon: 'cloud-rain' },
    53: { text: 'Moderate drizzle', icon: 'cloud-rain' },
    55: { text: 'Dense drizzle', icon: 'cloud-rain' },
    56: { text: 'Light freezing drizzle', icon: 'cloud-rain' },
    57: { text: 'Dense freezing drizzle', icon: 'cloud-rain' },
    61: { text: 'Slight rain', icon: 'cloud-rain' },
    63: { text: 'Moderate rain', icon: 'cloud-rain' },
    65: { text: 'Heavy rain', icon: 'cloud-showers-heavy' },
    66: { text: 'Light freezing rain', icon: 'cloud-rain' },
    67: { text: 'Heavy freezing rain', icon: 'cloud-showers-heavy' },
    71: { text: 'Slight snow', icon: 'snowflake' },
    73: { text: 'Moderate snow', icon: 'snowflake' },
    75: { text: 'Heavy snow', icon: 'snowflake' },
    77: { text: 'Snow grains', icon: 'snowflake' },
    80: { text: 'Slight rain showers', icon: 'cloud-rain' },
    81: { text: 'Moderate rain showers', icon: 'cloud-rain' },
    82: { text: 'Violent rain showers', icon: 'cloud-showers-heavy' },
    85: { text: 'Slight snow showers', icon: 'snowflake' },
    86: { text: 'Heavy snow showers', icon: 'snowflake' },
    95: { text: 'Thunderstorm', icon: 'cloud-bolt' },
    96: { text: 'Thunderstorm with hail', icon: 'cloud-bolt' },
    99: { text: 'Heavy thunderstorm with hail', icon: 'cloud-bolt' }
  };

  const result = weatherMap[numCode];
  
  if (!result) {
    return { text: 'Unknown', icon: 'cloud' };
  }
  
  if (isDay === 0) {
    return {
      text: result.text,
      icon: 'moon'
    };
  }
  
  return result;
};

export const formatTime = (timeString) => {
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const formatDay = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const getDaylightDuration = (sunrise, sunset) => {
  const start = new Date(sunrise);
  const end = new Date(sunset);
  const diffMs = end - start;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHrs}h ${diffMins}m`;
};