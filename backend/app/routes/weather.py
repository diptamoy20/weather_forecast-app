from fastapi import APIRouter, HTTPException, Query
from app.services.weather import get_weather
import httpx

router = APIRouter()

@router.get("/weather")
async def weather(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    units: str = Query("metric", pattern="^(metric|imperial)$"),
):
    """
    Returns current weather and 3-day forecast for given coordinates.
    units: 'metric' (°C) or 'imperial' (°F)
    """
    try:
        data = await get_weather(lat, lon, units)
        return data
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid OpenWeather API key.")
        raise HTTPException(status_code=502, detail="Failed to fetch weather data.")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Weather service unreachable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/geocode")
async def geocode(q: str = Query(..., min_length=2, description="City or address")):
    """
    Geocodes a city/address string to lat/lon using OpenWeather Geocoding API.
    """
    from app.config import settings
    import httpx

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.openweathermap.org/geo/1.0/direct",
                params={"q": q, "limit": 5, "appid": settings.openweather_api_key},
                timeout=10,
            )
            resp.raise_for_status()
            results = resp.json()

        if not results:
            raise HTTPException(status_code=404, detail="Location not found.")

        return [
            {
                "name": r.get("name"),
                "country": r.get("country"),
                "state": r.get("state", ""),
                "lat": r["lat"],
                "lon": r["lon"],
            }
            for r in results
        ]
    except HTTPException:
        raise
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid OpenWeather API key.")
        raise HTTPException(status_code=502, detail="Geocoding service error.")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Geocoding service unreachable.")
