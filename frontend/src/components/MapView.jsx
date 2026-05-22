import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView({ selectedLocation, onMapClick }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Initialize map once on mount
  useEffect(() => {
    if (mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { center: [20, 0], zoom: 2 });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      onMapClick({ lat: parseFloat(lat.toFixed(4)), lon: parseFloat(lng.toFixed(4)) });
    });

    mapInstanceRef.current = map;
  }, []);

  // Re-bind click handler when callback reference changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.off("click");
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      onMapClick({ lat: parseFloat(lat.toFixed(4)), lon: parseFloat(lng.toFixed(4)) });
    });
  }, [onMapClick]);

  // Move marker when location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedLocation) return;
    const { lat, lon } = selectedLocation;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    } else {
      markerRef.current = L.marker([lat, lon]).addTo(map);
    }
    map.flyTo([lat, lon], Math.max(map.getZoom(), 8), { duration: 1 });
  }, [selectedLocation]);

  return <div ref={mapRef} className="map-container" aria-label="Interactive map" />;
}
