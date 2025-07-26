import React, { useState, useEffect } from 'react';
import { CalilLibraryService, CalilLibrary, convertCalilToStudyLocation } from '../services/calilService';
import { StudyLocation } from '../types';

interface CalilLibraryExplorerProps {
  userLocation?: { latitude: number; longitude: number } | null;
  onLibrarySelect?: (library: StudyLocation) => void;
}

const CalilLibraryExplorer: React.FC<CalilLibraryExplorerProps> = ({ 
  userLocation, 
  onLibrarySelect 
}) => {
  console.log('CalilLibraryExplorer コンポーネントがレンダリングされました');
  
  const [libraries, setLibraries] = useState<CalilLibrary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'nearby' | 'prefecture' | 'city'>('prefecture');
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('東京都');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [limit, setLimit] = useState<number>(20);
  const [error, setError] = useState<string>('');

  const calilService = new CalilLibraryService();

  // 日本の都道府県リスト
  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  // 都道府県での検索を初期実行
  useEffect(() => {
    if (searchType === 'prefecture') {
      searchByPrefecture();
    }
  }, [selectedPrefecture]);

  const searchNearbyLibraries = async () => {
    if (!userLocation) {
      setError('位置情報が取得できません');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await calilService.searchNearby(
        userLocation.latitude,
        userLocation.longitude,
        5000, // 5km radius
        limit
      );
      setLibraries(result);
    } catch (error) {
      setError('近隣図書館の検索に失敗しました');
      console.error('Nearby search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchByPrefecture = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await calilService.searchByPrefecture(selectedPrefecture, limit);
      setLibraries(result);
    } catch (error) {
      setError('都道府県での検索に失敗しました');
      console.error('Prefecture search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchByCity = async () => {
    if (!selectedCity.trim()) {
      setError('市区町村を入力してください');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await calilService.searchByCity(selectedPrefecture, selectedCity, limit);
      setLibraries(result);
    } catch (error) {
      setError('市区町村での検索に失敗しました');
      console.error('City search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    switch (searchType) {
      case 'nearby':
        await searchNearbyLibraries();
        break;
      case 'prefecture':
        await searchByPrefecture();
        break;
      case 'city':
        await searchByCity();
        break;
    }
  };

  const handleLibrarySelect = (library: CalilLibrary) => {
    if (onLibrarySelect) {
      const studyLocation = convertCalilToStudyLocation(library);
      onLibrarySelect(studyLocation);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'SMALL': '小規模図書館',
      'MEDIUM': '中規模図書館', 
      'LARGE': '大規模図書館',
      'UNIV': '大学図書館',
      'SPECIAL': '専門図書館',
      'BM': '移動図書館'
    };
    return labels[category] || '図書館';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>🗾 全国図書館検索（カーリルAPI）</h2>
      
      {/* 検索タイプ選択 */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>検索タイプ</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="radio"
              value="nearby"
              checked={searchType === 'nearby'}
              onChange={(e) => setSearchType(e.target.value as any)}
              disabled={!userLocation}
            />
            <span>📍 近隣検索 {!userLocation && '(位置情報必要)'}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="radio"
              value="prefecture"
              checked={searchType === 'prefecture'}
              onChange={(e) => setSearchType(e.target.value as any)}
            />
            <span>🗾 都道府県で検索</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="radio"
              value="city"
              checked={searchType === 'city'}
              onChange={(e) => setSearchType(e.target.value as any)}
            />
            <span>🏙️ 市区町村で検索</span>
          </label>
        </div>
      </div>

      {/* 検索オプション */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>検索オプション</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {(searchType === 'prefecture' || searchType === 'city') && (
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                都道府県
              </label>
              <select
                value={selectedPrefecture}
                onChange={(e) => setSelectedPrefecture(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {prefectures.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>
          )}
          
          {searchType === 'city' && (
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                市区町村
              </label>
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                placeholder="例: 新宿区、渋谷区"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              表示件数
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value={10}>10件</option>
              <option value={20}>20件</option>
              <option value={50}>50件</option>
              <option value={100}>100件</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            marginTop: '16px',
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? '🔍 検索中...' : '🔍 検索'}
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #ffeaa7'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* 検索結果 */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
          検索結果 {!loading && libraries.length > 0 && `(${libraries.length}件)`}
        </h3>
        
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            backgroundColor: '#fff',
            borderRadius: '8px'
          }}>
            🔍 検索中...
          </div>
        )}
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {libraries.map((library) => (
            <div
              key={library.systemid}
              style={{
                backgroundColor: '#fff',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                border: '1px solid #eee'
              }}
              onClick={() => handleLibrarySelect(library)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
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
              
              {library.tel && (
                <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                  📞 {library.tel}
                </p>
              )}
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                <span style={{
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {getCategoryLabel(library.category)}
                </span>
                
                <span style={{
                  backgroundColor: '#f3e5f5',
                  color: '#7b1fa2',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {library.pref}
                </span>
                
                {library.geocode && (
                  <span style={{
                    backgroundColor: '#e8f5e8',
                    color: '#2e7d32',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    位置情報あり
                  </span>
                )}
                
                {library.url_pc && (
                  <span style={{
                    backgroundColor: '#fff3e0',
                    color: '#f57c00',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    Webサイトあり
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {!loading && libraries.length === 0 && !error && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            backgroundColor: '#fff',
            borderRadius: '8px'
          }}>
            📚 図書館が見つかりませんでした。検索条件を変更してみてください。
          </div>
        )}
      </div>
    </div>
  );
};

export default CalilLibraryExplorer;