import { useState } from "react";
import { geocodeLocation } from "../services/api";

export default function SearchBar({ onLocationSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const data = await geocodeLocation(query.trim());
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Location not found.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(result) {
    onLocationSelect({ lat: result.lat, lon: result.lon, name: `${result.name}, ${result.country}` });
    setResults([]);
    setQuery(result.name);
  }

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a location..."
          className="search-input"
          aria-label="Search location"
        />
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? "..." : "Search"}
        </button>
      </form>
      {error && <p className="search-error">{error}</p>}
      {results.length > 0 && (
        <ul className="search-results" role="listbox">
          {results.map((r, i) => (
            <li
              key={i}
              onClick={() => handleSelect(r)}
              role="option"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleSelect(r)}
            >
              {r.name}{r.state ? `, ${r.state}` : ""}, {r.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
