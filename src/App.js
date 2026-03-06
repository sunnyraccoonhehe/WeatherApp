import './App.css';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCloud, 
  faWind, 
  faDroplet, 
  faCompress,
  faSun,
  faMoon,
  faCloudSun,
  faSmog,
  faCloudRain,
  faCloudShowersHeavy,
  faSnowflake,
  faCloudBolt,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import sunriseImage from './pictures/sunrise.png';
import sunsetImage from './pictures/sunset.png';
import SmartSearch from './SmartSearch';
import { 
  getWeather, 
  getWeatherDescription, 
  formatTime, 
  formatDay,
  getDaylightDuration,
} from './WeatherService';

import rainBg from './pictures/rain.jpeg';
import snowBg from './pictures/snow.jpg';
import thunderBg from './pictures/thunder.jpg';
import cloudBg from './pictures/cloud.jpg';
import sunBg from './pictures/sun.jpg';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityInfo, setCityInfo] = useState({ name: 'St Petersburg', country: 'Russia' });
  const [backgroundImage, setBackgroundImage] = useState(cloudBg);

  const getWeatherIcon = (iconType) => {
    const icons = {
      'sun': faSun,
      'moon': faMoon,
      'cloud-sun': faCloudSun,
      'cloud': faCloud,
      'smog': faSmog,
      'cloud-rain': faCloudRain,
      'cloud-showers-heavy': faCloudShowersHeavy,
      'snowflake': faSnowflake,
      'cloud-bolt': faCloudBolt
    };
    
    return icons[iconType] || faCloud;
  };

  const getBackgroundForWeather = (weatherCode) => {
    const code = Number(weatherCode);
    
    if (code >= 95 && code <= 99) {
      return thunderBg;
    }
    
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
      return snowBg;
    }
    
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return rainBg;
    }
    
    if ((code >= 2 && code <= 3) || code === 45 || code === 48) {
      return cloudBg;
    }
    
    if (code >= 0 && code <= 1) {
      return sunBg;
    }
    
    return cloudBg;
  };

  useEffect(() => {
    if (weatherData && weatherData.current) {
      const bgImage = getBackgroundForWeather(weatherData.current.weather_code);
      setBackgroundImage(bgImage);
    }
  }, [weatherData]);

  const handleCitySelect = async (city) => {
    try {
      setLoading(true);
      setError(null);
      setCityInfo({ name: city.name, country: city.country });
      
      setBackgroundImage(cloudBg);
      
      const weather = await getWeather(city.lat, city.lon);
      setWeatherData(weather);
    } catch (err) {
      setError('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const weather = await getWeather(59.9311, 30.3609);
        setWeatherData(weather);
        setError(null);
      } catch (err) {
        setError('Failed to load weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    weekday: 'short' 
  }).replace(',', '');

  const renderWeekdays = () => {
    if (!weatherData) return null;
    
    const daily = weatherData.daily;
    const nextDays = daily.time.slice(1, 7);
    const leftColumn = nextDays.slice(0, 3);
    const rightColumn = nextDays.slice(3, 6);
    
    const result = [];
    
    for (let i = 0; i < 3; i++) {
      if (leftColumn[i]) {
        const leftIndex = i + 1;
        const weatherDesc = getWeatherDescription(daily.weather_code[leftIndex], 1);
        result.push(
          <div key={`left-${i}`} className="weekday">
            <span style={{ marginRight: 'auto' }}>{formatDay(leftColumn[i])}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto' }}>
              <FontAwesomeIcon 
                icon={getWeatherIcon(weatherDesc.icon)} 
                style={{ fontSize: '14px', opacity: 0.8 }}
              />
              <span>
                {Math.round(daily.temperature_2m_min[leftIndex])}°/
                {Math.round(daily.temperature_2m_max[leftIndex])}°
              </span>
            </span>
          </div>
        );
      }
      
      if (rightColumn[i]) {
        const rightIndex = i + 4;
        const weatherDesc = getWeatherDescription(daily.weather_code[rightIndex], 1);
        result.push(
          <div key={`right-${i}`} className="weekday">
            <span style={{ marginRight: 'auto' }}>{formatDay(rightColumn[i])}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto' }}>
              <FontAwesomeIcon 
                icon={getWeatherIcon(weatherDesc.icon)} 
                style={{ fontSize: '14px', opacity: 0.8 }}
              />
              <span>
                {Math.round(daily.temperature_2m_min[rightIndex])}°/
                {Math.round(daily.temperature_2m_max[rightIndex])}°
              </span>
            </span>
          </div>
        );
      }
    }
    
    return result;
  };

  if (loading) {
    return (
      <div className="App" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="panel" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p style={{ marginTop: '20px' }}>Loading weather...</p>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="App" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="panel" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <p>Error: {error || 'No data'}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const currentWeather = weatherData.current;
  const currentWeatherDesc = getWeatherDescription(currentWeather.weather_code, currentWeather.is_day);
  const daily = weatherData.daily;

  return (
    <div className="App" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="panel">
        <p className="logo">WEATHER</p>
        
        <div className="todayis">{cityInfo.name}, {formattedDate}</div>
        
        <div className="params">
          <div className="Param" id="frst-param">
            <FontAwesomeIcon icon={faDroplet} size="2x" />
            <p>{currentWeather.relative_humidity_2m}%</p>
          </div>
          <div className="Param" id="scnd-param">
            <FontAwesomeIcon icon={faWind} size="2x" />
            <p>{Math.round(currentWeather.wind_speed_10m)} m/s</p>
          </div>
          <div className="Param" id="thrd-param">
            <FontAwesomeIcon icon={faCompress} size="2x" />
            <p>{Math.round(currentWeather.pressure_msl)} hPa</p>
          </div>
        </div>
        
        <div className="sun-day">
          <div className="Param">
            <img className="fa-icon" src={sunriseImage} alt="sunrise" />
            <p>{formatTime(daily.sunrise[0])}</p>
          </div>
          <div className="Param">
            <img className="fa-icon" src={sunsetImage} alt="sunset" />
            <p>{formatTime(daily.sunset[0])}</p>
          </div>
        </div>
        
        <p className="dur">
          daylight: {getDaylightDuration(daily.sunrise[0], daily.sunset[0])}
        </p>
      </div>
      
      <div className="information">
        <div className="frst-part">
          <div className="search-wrapper">
            <SmartSearch onCitySelect={handleCitySelect} />
          </div>

          <div className="weather-center">
            <div className="weather-now">
              <div className="icon-now">
                <FontAwesomeIcon icon={getWeatherIcon(currentWeatherDesc.icon)} />
              </div>
              <div className="degrees-now">
                <p className="number">{Math.round(currentWeather.temperature_2m)}°C</p>
              </div>
            </div>
          </div>
        </div>
        
        <p className="wether-now-text">{currentWeatherDesc.text}</p>
        
        <div className="scnd-part">
          {renderWeekdays()}
        </div>
      </div>
    </div>
  );
}

export default App;
