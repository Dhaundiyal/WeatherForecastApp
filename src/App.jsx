import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

 
  // Fetch Coordinates using Open-Meteo Geocoding API
  const fetchWeather = async () => {
    try {
      setError(""); // Reset error message
      const geoResponse = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&format=json`
      );

      if (!geoResponse.data.results) {
        setError("City not found!");
        return;
      }

      const { latitude, longitude, name, country } = geoResponse.data.results[0];

      // Fetch Weather & Forecast Data
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      setWeather({
        city: name,
        country: country,
        temperature: weatherResponse.data.current_weather.temperature,
        windSpeed: weatherResponse.data.current_weather.windspeed,
      });



      // Extract 5-day forecast data
      const dailyForecast = weatherResponse.data.daily;
      const forecastData = dailyForecast.time.map((date, index) => ({
        date,
        maxTemp: dailyForecast.temperature_2m_max[index],
        minTemp: dailyForecast.temperature_2m_min[index],
      }));

      setForecast(forecastData);
    } catch (err) {
      setError("Error fetching data. Please try again.");
    }
  };

  return (
    <div className="weather-container">
      <h1>Weather App</h1>
      <input
        type="text"
        placeholder="Enter city name..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="city-input"
      />
      <button onClick={fetchWeather} className="search-button">
        Get Weather
      </button>

      {error && <p className="error-message">{error}</p>}

      {weather && (
        <div className="weather-details">
          <h2>
            {weather.city}, {weather.country}
          </h2>
          <p className="temperature">{weather.temperature}°C</p>
          <p className="wind">Wind Speed: {weather.windSpeed} km/h</p>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast-container">
          <h3>5-Day Forecast</h3>
          <div className="forecast-grid">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-day">
                <p className="forecast-date">{day.date}</p>
                <p>Max: {day.maxTemp}°C</p>
                <p>Min: {day.minTemp}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
