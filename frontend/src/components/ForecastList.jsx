const CONDITION_EMOJI = {
  Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
  Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️", Haze: "🌫️",
};

export default function ForecastList({ forecast, units }) {
  const unit = units === "metric" ? "°C" : "°F";
  const windUnit = units === "metric" ? "m/s" : "mph";
  

  return (
    <div className="forecast-list">
      <h3 className="forecast-title">5-Day Forecast</h3>
      <div className="forecast-cards">
        {forecast.map((day, i) => (
          <div key={i} className="forecast-card">
            <div className="forecast-day">{day.day}</div>
            <div className="forecast-date">{day.date}</div>
            <div className="forecast-icon animate-icon">{CONDITION_EMOJI[day.condition] || "🌡️"}</div>
            <div className="forecast-temp">{day.temp}{unit}</div>
            <div className="forecast-desc">{day.description}</div>
            <div className="forecast-meta">
              <span>💧 {day.humidity}%</span>
              <span>💨 {day.wind} {windUnit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
