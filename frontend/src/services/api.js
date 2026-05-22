import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({ baseURL: BASE_URL });

/**
 * Fetch weather data for given coordinates.
 * @param {number} lat
 * @param {number} lon
 * @param {"metric"|"imperial"} units
 */
export async function fetchWeather(lat, lon, units = "metric") {
  const { data } = await api.get("/weather", { params: { lat, lon, units } });
  return data;
}

/**
 * Geocode a city/address string to lat/lon candidates.
 * @param {string} query
 */
export async function geocodeLocation(query) {
  const { data } = await api.get("/geocode", { params: { q: query } });
  return data;
}
