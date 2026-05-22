import httpx
from app.config import settings

OPENWEATHER_BASE = "https://api.openweathermap.org"

async def get_weather(lat: float, lon: float, units: str = "metric") -> dict:
    """
    Fetches current weather + 5-day/3-hour forecast from OpenWeather API,
    then extracts the next 5 daily summaries.
    """
    api_key = settings.openweather_api_key

    async with httpx.AsyncClient() as client:
        # Current weather
        current_resp = await client.get(
            f"{OPENWEATHER_BASE}/data/2.5/weather",
            params={"lat": lat, "lon": lon, "appid": api_key, "units": units},
            timeout=10,
        )
        current_resp.raise_for_status()
        current_data = current_resp.json()

        # 5-day forecast (3-hour intervals)
        forecast_resp = await client.get(
            f"{OPENWEATHER_BASE}/data/2.5/forecast",
            params={"lat": lat, "lon": lon, "appid": api_key, "units": units},
            timeout=10,
        )
        forecast_resp.raise_for_status()
        forecast_data = forecast_resp.json()

    return _format_response(current_data, forecast_data)


def _format_response(current: dict, forecast: dict) -> dict:
    """Transforms raw API data into a clean response."""
    location = current.get("name", "Unknown")
    country = current.get("sys", {}).get("country", "")

    current_weather = {
        "temp": round(current["main"]["temp"]),
        "feels_like": round(current["main"]["feels_like"]),
        "condition": current["weather"][0]["main"],
        "description": current["weather"][0]["description"].capitalize(),
        "icon": current["weather"][0]["icon"],
        "humidity": current["main"]["humidity"],
        "wind": round(current["wind"]["speed"]),
    }

    # Group forecast by day, pick the midday reading (or first available)
    days_seen = {}
    for item in forecast["list"]:
        date = item["dt_txt"].split(" ")[0]  # "YYYY-MM-DD"
        hour = item["dt_txt"].split(" ")[1]
        # Prefer 12:00:00 reading for each day
        if date not in days_seen or hour == "12:00:00":
            days_seen[date] = item

    # Skip today, take next 3 days
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    daily_entries = [v for k, v in sorted(days_seen.items()) if k != today][:7]

    forecast_list = []
    for i, entry in enumerate(daily_entries):
        forecast_list.append({
            "day": f"Day {i + 1}",
            "date": entry["dt_txt"].split(" ")[0],
            "temp": round(entry["main"]["temp"]),
            "condition": entry["weather"][0]["main"],
            "description": entry["weather"][0]["description"].capitalize(),
            "icon": entry["weather"][0]["icon"],
            "humidity": entry["main"]["humidity"],
            "wind": round(entry["wind"]["speed"]),
        })

    return {
        "location": f"{location}, {country}" if country else location,
        "current": current_weather,
        "forecast": forecast_list,
    }
