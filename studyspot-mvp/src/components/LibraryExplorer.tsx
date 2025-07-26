import React, { useState, useEffect } from 'react';
import LibraryStatusCard from '../components/LibraryStatusCard';
import { MAJOR_LIBRARIES, searchNearbyLibraries, convertLibraryToStudyLocation, LibraryStatus } from '../services/libraryService';
import { StudyLocation } from '../types';

interface LibraryExplorerProps {
  userLocation?: { latitude: number; longitude: number } | null;
  onLibrarySelect?: (library: StudyLocation) => void;
}

const LibraryExplorer: React.FC<LibraryExplorerProps> = ({ userLocation, onLibrarySelect }) => {
  const [nearbyLibraries, setNearbyLibraries] = useState<typeof MAJOR_LIBRARIES>([]);
  const [allLibraries, setAllLibraries] = useState<typeof MAJOR_LIBRARIES>(MAJOR_LIBRARIES);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('all');
  const [searchRadius, setSearchRadius] = useState<number>(10000); // 10km
  const [libraryStatuses, setLibraryStatuses] = useState<Record<string, LibraryStatus>>({});

  useEffect(() => {
    if (userLocation) {
      const nearby = searchNearbyLibraries(userLocation, searchRadius);
      setNearbyLibraries(nearby);
    }
  }, [userLocation, searchRadius]);

  const handleLibraryStatusUpdate = (libraryId: string, status: LibraryStatus) => {
    setLibraryStatuses(prev => ({
      ...prev,
      [libraryId]: status
    }));
  };

  const handleLibraryClick = (library: typeof MAJOR_LIBRARIES[0]) => {
    const studyLocation = convertLibraryToStudyLocation(library);
    onLibrarySelect?.(studyLocation);
  };

  const prefectures = ['all', ...Array.from(new Set(MAJOR_LIBRARIES.map(lib => lib.prefecture)))];

  const filteredLibraries = selectedPrefecture === 'all' 
    ? allLibraries 
    : allLibraries.filter(lib => lib.prefecture === selectedPrefecture);

  const openLibrariesCount = Object.values(libraryStatuses).filter(status => status.isOpen).length;
  const totalCheckedLibraries = Object.keys(libraryStatuses).length;

  return (
    <div style={{ padding: '16px' }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#007AFF' }}>
          📚 図書館営業状況
        </h2>
        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 16px 0' }}>
          全国の主要図書館の営業状況をリアルタイムで確認できます
        </p>
        
        {totalCheckedLibraries > 0 && (
          <div style={{
            backgroundColor: '#E3F2FD',
            border: '1px solid #BBDEFB',
            borderRadius: '6px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>📊</span>
            <span style={{ fontSize: '14px' }}>
              確認済み {totalCheckedLibraries} 館中 <strong>{openLibrariesCount} 館が開館中</strong>
            </span>
          </div>
        )}
      </div>

      {/* フィルター */}
      <div style={{
        backgroundColor: '#fff',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', marginRight: '8px' }}>
              都道府県:
            </label>
            <select
              value={selectedPrefecture}
              onChange={(e) => setSelectedPrefecture(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              {prefectures.map(pref => (
                <option key={pref} value={pref}>
                  {pref === 'all' ? '全て' : pref}
                </option>
              ))}
            </select>
          </div>

          {userLocation && (
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', marginRight: '8px' }}>
                検索範囲:
              </label>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value={5000}>5km以内</option>
                <option value={10000}>10km以内</option>
                <option value={20000}>20km以内</option>
                <option value={50000}>50km以内</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 近隣図書館 */}
      {userLocation && nearbyLibraries.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📍 近隣の図書館 ({nearbyLibraries.length}館)
          </h3>
          {nearbyLibraries.map(library => (
            <div key={library.id} style={{ marginBottom: '8px' }}>
              <LibraryStatusCard
                libraryId={library.id}
                libraryName={library.name}
                onStatusUpdate={(status) => handleLibraryStatusUpdate(library.id, status)}
              />
              <button
                onClick={() => handleLibraryClick(library)}
                style={{
                  backgroundColor: '#007AFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  width: '100%'
                }}
              >
                📍 この図書館を詳しく見る
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 全図書館リスト */}
      <div>
        <h3 style={{ 
          fontSize: '18px', 
          margin: '0 0 12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📋 {selectedPrefecture === 'all' ? '全国' : selectedPrefecture}の図書館 ({filteredLibraries.length}館)
        </h3>
        
        {filteredLibraries.map(library => (
          <div key={library.id} style={{ marginBottom: '8px' }}>
            <LibraryStatusCard
              libraryId={library.id}
              libraryName={`${library.name} (${library.city})`}
              onStatusUpdate={(status) => handleLibraryStatusUpdate(library.id, status)}
            />
            <button
              onClick={() => handleLibraryClick(library)}
              style={{
                backgroundColor: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '8px',
                width: '100%'
              }}
            >
              📍 この図書館を詳しく見る
            </button>
          </div>
        ))}
      </div>

      {/* フッター情報 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        marginTop: '24px',
        fontSize: '13px',
        color: '#666'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>📋 データについて</h4>
        <ul style={{ margin: 0, paddingLeft: '16px' }}>
          <li>営業時間は各図書館の標準営業時間です</li>
          <li>特別な休館日やイベント情報は定期的に更新されます</li>
          <li>正確な情報は各図書館の公式サイトでご確認ください</li>
          <li>データに誤りがございましたら、お知らせください</li>
        </ul>
      </div>
    </div>
  );
};

export default LibraryExplorer;
