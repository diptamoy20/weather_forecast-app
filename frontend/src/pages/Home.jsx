import { useState, useCallback, useEffect } from "react";
import MapView from "../components/MapView";
import SearchBar from "../components/SearchBar";
import WeatherCard from "../components/WeatherCard";
import ForecastList from "../components/ForecastList";
import Spinner from "../components/Spinner";
import { fetchWeather } from "../services/api";

const STORAGE_KEY = "weather_last_location";

export default function Home({ darkMode, toggleDark }) {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [units, setUnits] = useState("metric");
  const [activeTab, setActiveTab] = useState("today");

  const loadWeather = useCallback(async (lat, lon, u) => {
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
  }, []);

  // Keep weather synced with selected city and preferred unit.
  useEffect(() => {
    if (selectedLocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadWeather(selectedLocation.lat, selectedLocation.lon, units);
    }
  }, [selectedLocation, units, loadWeather]);

  const handleMapClick = useCallback(({ lat, lon }) => {
    const loc = { lat, lon };
    setSelectedLocation(loc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  }, []);

  const handleSearchSelect = useCallback(({ lat, lon, name }) => {
    const loc = { lat, lon, name };
    setSelectedLocation(loc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  }, []);

  return (
    <div className="home">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <span className="app-logo">☁️</span>
          <h1 className="app-title">WeatherApp</h1>
        </div>
        <div className="header-location">
          {weatherData?.location || selectedLocation?.name || "Search a location"}
        </div>
        <div className="header-controls">
          <div className="unit-toggle-group" role="group" aria-label="Temperature unit">
            <button
              className={`unit-toggle ${units === "metric" ? "active" : ""}`}
              onClick={() => setUnits("metric")}
              aria-pressed={units === "metric"}
            >
              °C
            </button>
            <button
              className={`unit-toggle ${units === "imperial" ? "active" : ""}`}
              onClick={() => setUnits("imperial")}
              aria-pressed={units === "imperial"}
            >
              °F
            </button>
          </div>
          <button className="dark-toggle" onClick={toggleDark}>
            {darkMode ? "☀" : "🌙"}
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="search-section">
        <SearchBar onLocationSelect={handleSearchSelect} />
        <p className="map-hint">Search or click anywhere on the map to pin your city.</p>
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
            <div className="weather-tabs">
              <button
                className={`weather-tab ${activeTab === "today" ? "active" : ""}`}
                onClick={() => setActiveTab("today")}
              >
                Today
              </button>
              <button
                className={`weather-tab ${activeTab === "week" ? "active" : ""}`}
                onClick={() => setActiveTab("week")}
              >
                Week
              </button>
            </div>

            {(activeTab === "today" || activeTab === "week") && (
              <WeatherCard data={weatherData} units={units} />
            )}
            {(activeTab === "week" || activeTab === "today") && (
              <ForecastList forecast={weatherData.forecast} units={units} />
            )}
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
