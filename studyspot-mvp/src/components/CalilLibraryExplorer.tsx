import React, { useState, useEffect } from 'react';
import { fetchStationSuggestions } from '../services/stationService';
import { CalilLibraryService, CalilLibrary } from '../services/calilService';
import { Station } from '../services/stationService';

const CalilLibraryExplorer: React.FC = () => {
  const [libraries, setLibraries] = useState<CalilLibrary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [minutes, setMinutes] = useState<number>(10); // デフォルト10分
  const [stationInput, setStationInput] = useState<string>('');
  const [stationSuggestions, setStationSuggestions] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const calilService = new CalilLibraryService();

  useEffect(() => {
    if (stationInput.length > 1) {
      fetchStationSuggestions(stationInput).then(setStationSuggestions);
    } else {
      setStationSuggestions([]);
    }
  }, [stationInput]);

  // 緯度経度から距離(m)を計算する関数（ハーヴァシン公式）
  function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6378137; // 地球半径[m]
    const toRad = (v: number) => v * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      let result: CalilLibrary[] = [];
      if (selectedStation) {
        // APIから図書館リスト取得（距離制限なし）
        result = await calilService.searchByLocation(selectedStation.latitude, selectedStation.longitude, 100000);
        // 駅座標と図書館座標から距離・徒歩分数を計算し、minutes以内のみ抽出
        result = result
          .map(lib => {
            if (lib.geocode) {
              const [longitude, latitude] = lib.geocode.split(',').map(Number);
              const dist = calcDistance(selectedStation.latitude, selectedStation.longitude, latitude, longitude);
              return { ...lib, distance: dist, walkMinutes: Math.round(dist / 80) };
            }
            return { ...lib, walkMinutes: undefined };
          })
          .filter(lib => lib.walkMinutes !== undefined && lib.walkMinutes <= minutes);
      } else {
        setError('駅を選択してください');
        setLibraries([]);
        setLoading(false);
        return;
      }
      setLibraries(result as any);
    } catch (e: any) {
      setError(e.message || '検索に失敗しました');
    }
    setLoading(false);
  };
  const getCategoryLabel = (category: string) => calilService.getCategoryLabel(category);

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px', background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>駅から図書館検索</h3>
        <div style={{ position: 'relative' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>駅名サジェスト</label><br />
          <input
            type="text"
            value={stationInput}
            onChange={e => setStationInput(e.target.value)}
            placeholder="駅名を入力"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            autoComplete="off"
          />
          {stationSuggestions.length > 0 && (
            <ul style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '48px',
              zIndex: 10,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              maxHeight: 200,
              overflowY: 'auto'
            }}>
              {stationSuggestions.map((s) => (
                <li
                  key={s.id}
                  style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                  onClick={() => {
                    setSelectedStation(s);
                    setStationInput(s.name);
                    setStationSuggestions([]);
                  }}
                >
                  {s.name}（{s.prefecture}）
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ marginTop: '12px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>駅から何分</label><br />
          <select value={minutes} onChange={e => setMinutes(Number(e.target.value))} style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}>
            <option value={5}>5分</option>
            <option value={10}>10分</option>
            <option value={15}>15分</option>
            <option value={20}>20分</option>
            <option value={30}>30分</option>
          </select>
        </div>
        <button onClick={handleSearch} disabled={loading} style={{ marginTop: '16px', padding: '12px 24px', backgroundColor: loading ? '#ccc' : '#007AFF', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}>
          {loading ? '🔍 検索中...' : '🔍 検索'}
        </button>
      </div>
      {error && (
        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '12px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #ffeaa7' }}>
          ⚠️ {error}
        </div>
      )}
      <div>
        <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
          検索結果 {!loading && libraries.length > 0 && `(${libraries.length}件)`}
        </h3>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666', backgroundColor: '#fff', borderRadius: '8px' }}>
            🔍 検索中...
          </div>
        )}
        <div style={{ display: 'grid', gap: '16px' }}>
          {libraries.map((library: any) => (
            <div
              key={library.libid}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; }}
              style={{ marginBottom: '16px', padding: '12px', border: '1px solid #eee', borderRadius: '8px', background: '#fff' }}
            >
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '16px' }}>
                    📚 {library.formal}
                  </h4>
                  <p style={{ margin: '0', color: '#666', fontSize: '13px' }}>
                    {library.systemname}
                  </p>
                </div>
                <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                  📍 {library.address}
                </p>
                {/* 駅から徒歩分数表示（walkMinutesプロパティ） */}
                {library.walkMinutes !== undefined && (
                  <p style={{ margin: '0 0 8px 0', color: '#1976d2', fontSize: '14px' }}>
                    🚶 駅から徒歩{library.walkMinutes}分
                  </p>
                )}
                {library.tel && (
                  <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                    📞 {library.tel}
                  </p>
                )}
                <div>
                  <span style={{ backgroundColor: '#e3f2fd', color: '#1976d2', padding: '2px 6px', borderRadius: '8px', fontSize: '12px' }}>
                    {getCategoryLabel(library.category)}
                  </span>
                  <span style={{ backgroundColor: '#f3e5f5', color: '#6a1b9a', padding: '2px 6px', borderRadius: '8px', fontSize: '12px', marginLeft: '4px' }}>
                    {library.pref}
                  </span>
                  {library.geocode && (
                    <span style={{ backgroundColor: '#e8f5e8', color: '#2e7d32', padding: '2px 6px', borderRadius: '8px', fontSize: '12px', marginLeft: '4px' }}>
                      {library.geocode}
                    </span>
                  )}
                  {library.url_pc && (
                    <span style={{ backgroundColor: '#fff3e0', color: '#f57c00', padding: '2px 6px', borderRadius: '8px', fontSize: '12px', marginLeft: '4px' }}>
                      <a href={library.url_pc} target="_blank" rel="noopener noreferrer">公式サイト</a>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {!loading && libraries.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666', backgroundColor: '#fff', borderRadius: '8px' }}>
            📚 図書館が見つかりませんでした。検索条件を変更してみてください。
          </div>
        )}
      </div>
    </div>
  );
};

export default CalilLibraryExplorer;
