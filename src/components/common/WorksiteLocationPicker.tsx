import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface WorksiteLocationPickerProps {
  lat: number;
  lng: number;
  onLocationSelect: (lat: number, lng: number, address?: string, city?: string) => void;
  isDarkMode?: boolean;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    county?: string;
    state?: string;
  };
}

export const WorksiteLocationPicker: React.FC<WorksiteLocationPickerProps> = ({
  lat,
  lng,
  onLocationSelect,
  isDarkMode = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Fix default Leaflet marker assets in bundler
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([lat, lng], 13);

      const tileUrl = isDarkMode
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

      const handleReverseGeocode = async (targetLat: number, targetLng: number) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${targetLat}&lon=${targetLng}&addressdetails=1`,
            { headers: { 'Accept-Language': 'de' } }
          );
          if (res.ok) {
            const data: NominatimResult = await res.json();
            const fullAddress = data.display_name || `${targetLat.toFixed(5)}, ${targetLng.toFixed(5)}`;
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.suburb ||
              data.address?.county ||
              '';
            onLocationSelect(targetLat, targetLng, fullAddress, city);
          } else {
            onLocationSelect(targetLat, targetLng);
          }
        } catch {
          onLocationSelect(targetLat, targetLng);
        }
      };

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handleReverseGeocode(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        handleReverseGeocode(clickLat, clickLng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    } else {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }
  }, [lat, lng, isDarkMode]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Search Address via OpenStreetMap Nominatim
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const query = encodeURIComponent(searchQuery.trim());
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5&countrycodes=de`,
        { headers: { 'Accept-Language': 'de' } }
      );
      if (res.ok) {
        const data: NominatimResult[] = await res.json();
        setSearchResults(data);
        setShowResults(true);
      }
    } catch (err) {
      console.error('Nominatim search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item: NominatimResult) => {
    const itemLat = parseFloat(item.lat);
    const itemLng = parseFloat(item.lon);

    const city =
      item.address?.city ||
      item.address?.town ||
      item.address?.village ||
      item.address?.suburb ||
      item.address?.county ||
      '';

    onLocationSelect(itemLat, itemLng, item.display_name, city);

    if (mapRef.current) {
      mapRef.current.setView([itemLat, itemLng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([itemLat, itemLng]);
      }
    }

    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-2">
      {/* Search Input Bar */}
      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--wood-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ort oder Adresse suchen (z.B. Parkallee Potsdam, Berlin Mitte)..."
              className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs border font-medium transition-colors ${
                isDarkMode
                  ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] focus:border-[var(--wood-info)]'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-colors ${
              isDarkMode
                ? 'bg-[var(--wood-base)] border-[var(--wood-border)] text-[var(--wood-text-primary)] hover:bg-[var(--wood-raised)]'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
            }`}
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Suchen</span>}
          </button>
        </form>

        {/* Autocomplete dropdown results */}
        {showResults && searchResults.length > 0 && (
          <div
            className={`absolute left-0 right-0 top-11 z-[500] rounded-xl border shadow-xl max-h-48 overflow-y-auto p-1.5 space-y-1 ${
              isDarkMode
                ? 'bg-[var(--wood-panel)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {searchResults.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => selectSearchResult(item)}
                className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start gap-2 ${
                  isDarkMode
                    ? 'hover:bg-[var(--wood-raised)] text-[var(--wood-text-secondary)] hover:text-white'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <MapPin className="w-4 h-4 text-[var(--wood-moss)] shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-tight">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Display */}
      <div className="relative w-full h-52 rounded-xl overflow-hidden border border-[var(--wood-border)] shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        <div className="absolute bottom-2 right-2 z-[400] bg-black/80 text-white text-[10px] px-2.5 py-1 rounded-md backdrop-blur-xs font-mono border border-white/10 flex items-center gap-1.5 shadow-md">
          <MapPin className="w-3 h-3 text-[var(--wood-moss)]" />
          <span>Klicken oder Marker ziehen zum Positionieren</span>
        </div>
      </div>
    </div>
  );
};
