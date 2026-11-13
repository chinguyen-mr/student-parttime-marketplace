import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Trash2, Loader2 } from 'lucide-react';

const VN_CENTER = [16.05, 106.5]; // khung nhìn ban đầu khi chưa ghim (không lưu)
const inVietnam = (lat, lng) => lat >= 8 && lat <= 24 && lng >= 102 && lng <= 110;

/**
 * Ghim vị trí trụ sở trên bản đồ (Leaflet + OpenStreetMap).
 * value: { latitude, longitude } hoặc null; onChange(lat, lng) / onChange(null, null) để bỏ ghim.
 */
export default function LocationPicker({ latitude, longitude, address, onChange }) {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const leafletRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState(address || '');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const hasPin = latitude !== null && latitude !== undefined && latitude !== '';

  // Tải Leaflet khi cần (không làm nặng các trang khác)
  useEffect(() => {
    let alive = true;
    Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')])
      .then(([mod]) => {
        if (!alive || !boxRef.current) return;
        const L = mod.default || mod;
        leafletRef.current = L;
        const map = L.map(boxRef.current, { scrollWheelZoom: false }).setView(VN_CENTER, 5);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
        map.on('click', (e) => onChangeRef.current(e.latlng.lat, e.latlng.lng));
        mapRef.current = map;
        setReady(true);
      })
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Đồng bộ marker với giá trị đang chọn
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;
    if (!hasPin) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    const pos = [Number(latitude), Number(longitude)];
    if (!markerRef.current) {
      markerRef.current = L.circleMarker(pos, { radius: 10, color: '#ffffff', weight: 3, fillColor: '#EA4335', fillOpacity: 1 }).addTo(map);
      map.setView(pos, Math.max(map.getZoom(), 17));
    } else {
      markerRef.current.setLatLng(pos);
    }
  }, [ready, hasPin, latitude, longitude]);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=vn&q=${encodeURIComponent(query.trim())}`;
      const list = await (await fetch(url, { headers: { 'Accept-Language': 'vi' } })).json();
      setResults(Array.isArray(list) ? list : []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const pickResult = (r) => {
    const lat = Number(r.lat);
    const lng = Number(r.lon);
    mapRef.current?.setView([lat, lng], 18);
    setResults(null);
    // Không tự ghim: kết quả tìm kiếm thường chỉ tới đoạn đường → người dùng bấm đúng tòa nhà/cổng
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); search(); } }}
          placeholder="Tìm khu vực, tên đường…"
          aria-label="Tìm vị trí trên bản đồ"
          style={{ flex: 1, minWidth: 200, padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--color-border, #E2E8F0)', fontSize: 13.5 }}
        />
        <button type="button" onClick={search} disabled={searching || !ready}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #7565A8', background: '#fff', color: '#7565A8', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
          {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Tìm
        </button>
        {hasPin && (
          <button type="button" onClick={() => onChange(null, null)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #FECACA', background: '#fff', color: '#DC2626', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
            <Trash2 size={14} /> Bỏ ghim
          </button>
        )}
      </div>

      {results && (
        <div role="listbox" style={{ border: '1px solid #E2E8F0', borderRadius: 8, marginBottom: 8, maxHeight: 180, overflowY: 'auto', background: '#fff' }}>
          {results.length === 0 && <div style={{ padding: 10, fontSize: 12.5, color: '#94A3B8' }}>Không tìm thấy. Hãy thử tên đường hoặc phường/xã mới.</div>}
          {results.map(r => (
            <button key={r.place_id} type="button" role="option" aria-selected="false" onClick={() => pickResult(r)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', borderBottom: '1px solid #F1F5F9', background: '#fff', fontSize: 12.5, cursor: 'pointer' }}>
              {r.display_name}
            </button>
          ))}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <div ref={boxRef} style={{ height: 280, borderRadius: 10, border: '1px solid #E2E8F0', background: '#F1F5F9', zIndex: 0 }} />
        {!ready && !loadError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>
            <Loader2 size={18} className="animate-spin" /> &nbsp;Đang tải bản đồ…
          </div>
        )}
        {loadError && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B91C1C', fontSize: 13 }}>Không tải được bản đồ.</div>}
      </div>

      <div style={{ fontSize: 12, color: hasPin ? '#047857' : '#64748B', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        <MapPin size={13} />
        {hasPin
          ? `Đã ghim: ${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}${inVietnam(Number(latitude), Number(longitude)) ? '' : ' (ngoài Việt Nam — sẽ không lưu được)'}`
          : 'Chưa ghim. Tìm khu vực rồi bấm đúng vị trí tòa nhà/cổng trụ sở trên bản đồ.'}
      </div>
    </div>
  );
}
