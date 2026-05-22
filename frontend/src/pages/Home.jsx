import { useState, useCallback, useEffect } from "react";
import MapView from "../components/MapView";
import SearchBar from "../components/SearchBar";
import WeatherCard from "../components/WeatherCard";
import ForecastList from "../components/ForecastList";
import Spinner from "../components/Spinner";
import { fetchWeather } from "../services/api";

const STORAGE_KEY = "weather_last_location";

export default function Home({ darkMode, toggleDark }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [units, setUnits] = useState("metric");

  // Restore last searched location on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const loc = JSON.parse(saved);
        setSelectedLocation(loc);
        loadWeather(loc.lat, loc.lon, "metric");
      } catch (_) {}
    }
  }, []);

  async function loadWeather(lat, lon, u = units) {
    setLoading(true);
    setError("");
    setWeatherData(null);
    try {
      const data = await fetchWeather(lat, lon, u);
      setWeatherData(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch weather. Check your API key or try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleMapClick = useCallback(({ lat, lon }) => {
    const loc = { lat, lon };
    setSelectedLocation(loc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    loadWeather(lat, lon);
  }, [units]);

  function handleSearchSelect({ lat, lon, name }) {
    const loc = { lat, lon, name };
    setSelectedLocation(loc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    loadWeather(lat, lon);
  }

  function handleUnitToggle() {
    const newUnits = units === "metric" ? "imperial" : "metric";
    setUnits(newUnits);
    if (selectedLocation) {
      loadWeather(selectedLocation.lat, selectedLocation.lon, newUnits);
    }
  }

  return (
    <div className="home">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <span className="app-logo">⛅</span>
          <h1 className="app-title">WeatherMap</h1>
        </div>
        <div className="header-controls">
          <button className="unit-toggle" onClick={handleUnitToggle}>
            {units === "metric" ? "°C → °F" : "°F → °C"}
          </button>
          <button className="dark-toggle" onClick={toggleDark}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="search-section">
        <SearchBar onLocationSelect={handleSearchSelect} />
        <p className="map-hint">or click anywhere on the map</p>
      </div>

      {/* Map */}
      <div className="map-section">
        <MapView selectedLocation={selectedLocation} onMapClick={handleMapClick} />
      </div>

      {/* Weather output */}
      <div className="weather-section">
        {loading && <Spinner />}
        {error && <div className="error-box" role="alert">⚠️ {error}</div>}
        {!loading && !error && weatherData && (
          <>
            <WeatherCard data={weatherData} units={units} />
            <ForecastList forecast={weatherData.forecast} units={units} />
          </>
        )}
        {!loading && !error && !weatherData && (
          <div className="empty-state">
            <span>🗺️</span>
            <p>Select a location on the map or search for a city to see the weather.</p>
          </div>
        )}
      </div>
    </div>
  );
}
