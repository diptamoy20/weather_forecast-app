import httpx
from app.config import settings
from datetime import datetime, timezone

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
    timezone_offset = current.get("timezone", 0)
    coordinates = current.get("coord", {})
    main = current.get("main", {})
    wind = current.get("wind", {})
    clouds = current.get("clouds", {})
    sys = current.get("sys", {})

    sunrise = sys.get("sunrise")
    sunset = sys.get("sunset")

    current_weather = {
        "temp": round(main.get("temp", 0)),
        "feels_like": round(main.get("feels_like", 0)),
        "condition": current["weather"][0]["main"],
        "description": current["weather"][0]["description"].capitalize(),
        "icon": current["weather"][0]["icon"],
        "humidity": main.get("humidity"),
        "wind": round(wind.get("speed", 0)),
        "wind_gust": round(wind["gust"], 1) if wind.get("gust") is not None else None,
        "pressure": main.get("pressure"),
        "sea_level": main.get("sea_level"),
        "ground_level": main.get("grnd_level"),
        "visibility": current.get("visibility"),
        "cloudiness": clouds.get("all"),
        "sunrise": sunrise,
        "sunset": sunset,
        "sunrise_local": _format_unix_local(sunrise, timezone_offset),
        "sunset_local": _format_unix_local(sunset, timezone_offset),
        "rain_1h": current.get("rain", {}).get("1h"),
        "snow_1h": current.get("snow", {}).get("1h"),
    }

    # Group forecast by day, pick the midday reading (or first available)
    days_seen = {}
    for item in forecast["list"]:
        date = item["dt_txt"].split(" ")[0]  # "YYYY-MM-DD"
        hour = item["dt_txt"].split(" ")[1]
        # Prefer 12:00:00 reading for each day
        if date not in days_seen or hour == "12:00:00":
            days_seen[date] = item

    # Skip today, then take up to 7 upcoming days
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    daily_entries = [v for k, v in sorted(days_seen.items()) if k != today][:7]

    forecast_list = []
    for i, entry in enumerate(daily_entries):
        entry_main = entry.get("main", {})
        entry_wind = entry.get("wind", {})
        forecast_list.append({
            "day": f"Day {i + 1}",
            "date": entry["dt_txt"].split(" ")[0],
            "temp": round(entry_main.get("temp", 0)),
            "temp_min": round(entry_main["temp_min"]) if entry_main.get("temp_min") is not None else None,
            "temp_max": round(entry_main["temp_max"]) if entry_main.get("temp_max") is not None else None,
            "condition": entry["weather"][0]["main"],
            "description": entry["weather"][0]["description"].capitalize(),
            "icon": entry["weather"][0]["icon"],
            "humidity": entry_main.get("humidity"),
            "wind": round(entry_wind.get("speed", 0)),
            "wind_gust": round(entry_wind["gust"], 1) if entry_wind.get("gust") is not None else None,
            "pressure": entry_main.get("pressure"),
            "visibility": entry.get("visibility"),
            "cloudiness": entry.get("clouds", {}).get("all"),
            "pop": round(entry.get("pop", 0) * 100),
            "rain_3h": entry.get("rain", {}).get("3h"),
            "snow_3h": entry.get("snow", {}).get("3h"),
        })

    return {
        "location": f"{location}, {country}" if country else location,
        "timezone_offset": timezone_offset,
        "coordinates": {
            "lat": coordinates.get("lat"),
            "lon": coordinates.get("lon"),
        },
        "current": current_weather,
        "forecast": forecast_list,
    }


def _format_unix_local(timestamp: int | None, tz_offset_seconds: int = 0) -> str | None:
    if timestamp is None:
        return None
    local_ts = timestamp + tz_offset_seconds
    return datetime.utcfromtimestamp(local_ts).strftime("%I:%M %p").lstrip("0")
