const CONDITION_EMOJI = {
  Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
  Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️",
  Haze: "🌫️", Smoke: "🌫️", Dust: "🌪️", Tornado: "🌪️",
};

export default function WeatherCard({ data, units }) {
  const { location, current } = data;
  const emoji = CONDITION_EMOJI[current.condition] || "🌡️";
  const unit = units === "metric" ? "°C" : "°F";
  const windUnit = units === "metric" ? "m/s" : "mph";

  return (
    <div className="weather-card current-card">
      <div className="card-location">{location}</div>
      <div className="card-icon animate-icon">{emoji}</div>
      <div className="card-temp">{current.temp}{unit}</div>
      <div className="card-description">{current.description}</div>
      <div className="card-meta">
        <span>🌡 Feels like {current.feels_like}{unit}</span>
        <span>💧 {current.humidity}%</span>
        <span>💨 {current.wind} {windUnit}</span>
      </div>
    </div>
  );
}
