const CONDITION_EMOJI = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Fog: "🌫️",
  Haze: "🌫️",
  Smoke: "🌫️",
  Dust: "🌪️",
  Tornado: "🌪️",
};

const LABELS = {
  humidity: "Humidity",
  wind: "Wind",
  wind_gust: "Wind Gust",
  pressure: "Pressure",
  sea_level: "Sea Level",
  ground_level: "Ground Level",
  visibility: "Visibility",
  cloudiness: "Cloudiness",
  rain_1h: "Rain (1h)",
  snow_1h: "Snow (1h)",
};

function formatTime(date, timezoneOffsetSeconds = 0) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  const cityNow = new Date(utc + timezoneOffsetSeconds * 1000);
  return cityNow.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date, timezoneOffsetSeconds = 0) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  const cityNow = new Date(utc + timezoneOffsetSeconds * 1000);
  return cityNow.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function formatValue(key, value, units) {
  if (value === null || value === undefined) return null;
  const windUnit = units === "metric" ? "m/s" : "mph";
  switch (key) {
    case "humidity":
    case "cloudiness":
      return `${value}%`;
    case "wind":
    case "wind_gust":
      return `${value} ${windUnit}`;
    case "pressure":
    case "sea_level":
    case "ground_level":
      return `${value} hPa`;
    case "visibility":
      return `${(value / 1000).toFixed(1)} km`;
    case "rain_1h":
    case "snow_1h":
      return `${value} mm`;
    default:
      return String(value);
  }
}

export default function WeatherCard({ data, units }) {
  const { location, current, timezone_offset: timezoneOffset = 0 } = data;
  const emoji = CONDITION_EMOJI[current.condition] || "🌡️";
  const unit = units === "metric" ? "°C" : "°F";
  const now = new Date();
  const detailKeys = Object.keys(LABELS).filter((key) => current[key] !== null && current[key] !== undefined);

  return (
    <section className="today-panel">
      <div className="today-main-card">
        <div className="today-main-left">
          <h2 className="today-city">{location}</h2>
          <div className="today-time">{formatTime(now, timezoneOffset)}</div>
          <div className="today-date">{formatDate(now, timezoneOffset)}</div>
        </div>
        <div className="today-main-center">
          <div className="today-temp">{current.temp}{unit}</div>
          <div className="today-feels">Feels like {current.feels_like}{unit}</div>
          <div className="today-sun-times">
            {current.sunrise_local && <span>Sunrise: {current.sunrise_local}</span>}
            {current.sunset_local && <span>Sunset: {current.sunset_local}</span>}
          </div>
        </div>
        <div className="today-main-right">
          <div className="today-condition-icon animate-icon">{emoji}</div>
          <div className="today-condition-text">{current.description}</div>
        </div>
      </div>

      <div className="today-details-grid">
        {detailKeys.map((key) => (
          <article key={key} className="today-detail-card">
            <span className="detail-label">{LABELS[key]}</span>
            <span className="detail-value">{formatValue(key, current[key], units)}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
