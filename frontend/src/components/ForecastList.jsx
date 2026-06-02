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
};

const FORECAST_DETAILS = [
  { key: "humidity", label: "Humidity", formatter: (v) => `${v}%` },
  { key: "wind", label: "Wind", formatter: (v, units) => `${v} ${units === "metric" ? "m/s" : "mph"}` },
  { key: "wind_gust", label: "Gust", formatter: (v, units) => `${v} ${units === "metric" ? "m/s" : "mph"}` },
  { key: "pressure", label: "Pressure", formatter: (v) => `${v} hPa` },
  { key: "visibility", label: "Visibility", formatter: (v) => `${(v / 1000).toFixed(1)} km` },
  { key: "cloudiness", label: "Clouds", formatter: (v) => `${v}%` },
  { key: "pop", label: "Rain chance", formatter: (v) => `${v}%` },
  { key: "rain_3h", label: "Rain 3h", formatter: (v) => `${v} mm` },
  { key: "snow_3h", label: "Snow 3h", formatter: (v) => `${v} mm` },
];

export default function ForecastList({ forecast, units }) {
  const unit = units === "metric" ? "°C" : "°F";

  return (
    <section className="forecast-list">
      <h3 className="forecast-title">5-Day Forecast</h3>
      <div className="forecast-cards">
        {forecast.map((day, i) => (
          <article key={i} className="forecast-card">
            <div className="forecast-head">
              <div className="forecast-day">{day.day}</div>
              <div className="forecast-date">{day.date}</div>
            </div>
            <div className="forecast-icon animate-icon">{CONDITION_EMOJI[day.condition] || "🌡️"}</div>
            <div className="forecast-temp-row">
              <div className="forecast-temp">{day.temp}{unit}</div>
              {day.temp_min !== null && day.temp_max !== null && (
                <div className="forecast-minmax">
                  <span>H {day.temp_max}{unit}</span>
                  <span>L {day.temp_min}{unit}</span>
                </div>
              )}
            </div>
            <div className="forecast-desc">{day.description}</div>
            <div className="forecast-meta-grid">
              {FORECAST_DETAILS.filter((item) => day[item.key] !== null && day[item.key] !== undefined).map((item) => (
                <div key={item.key} className="forecast-meta-item">
                  <span className="forecast-meta-label">{item.label}</span>
                  <span className="forecast-meta-value">{item.formatter(day[item.key], units)}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
