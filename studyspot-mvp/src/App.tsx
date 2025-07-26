import React, { useState, useEffect } from 'react';
import LocationCard from './components/LocationCard';
import LibraryExplorer from './components/LibraryExplorer';
import CalilLibraryExplorer from './components/CalilLibraryExplorer';
import { StudyLocation } from './types';
import { sampleLocations } from './sampleData';
import { calculateDistance } from './utils';

const App: React.FC = () => {
  const [locations, setLocations] = useState<StudyLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<StudyLocation[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<StudyLocation | null>(null);
  const [currentView, setCurrentView] = useState<'search' | 'libraries' | 'calil'>('search');
  
  console.log('App currentView:', currentView);
  const [filters, setFilters] = useState({
    distance: 5000, // meters
    onlyFree: false,
    onlyOpen: false,
    category: 'all'
  });

  // 初期データ読み込み
  useEffect(() => {
    setLocations(sampleLocations);
    setFilteredLocations(sampleLocations);
  }, []);

  // 位置情報取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log('位置情報の取得に失敗しました:', error);
          // デフォルト位置（新宿駅）を設定
          setUserLocation({
            latitude: 35.6896,
            longitude: 139.7006
          });
        }
      );
    }
  }, []);

  // フィルター適用
  useEffect(() => {
    let filtered = [...locations];

    // 距離フィルター
    if (userLocation) {
      filtered = filtered.filter(location => {
        const distance = calculateDistance(userLocation, location.coordinates);
        return distance <= filters.distance / 1000;
      });
    }

    // 無料フィルター
    if (filters.onlyFree) {
      filtered = filtered.filter(location => location.basicInfo.pricing.type === 'free');
    }

    // カテゴリフィルター
    if (filters.category !== 'all') {
      filtered = filtered.filter(location => location.category === filters.category);
    }

    // 距離順でソート（位置情報がある場合）
    if (userLocation) {
      filtered.sort((a, b) => {
        const distanceA = calculateDistance(userLocation, a.coordinates);
        const distanceB = calculateDistance(userLocation, b.coordinates);
        return distanceA - distanceB;
      });
    }

    setFilteredLocations(filtered);
  }, [locations, userLocation, filters]);

  const handleLocationClick = (location: StudyLocation) => {
    setSelectedLocation(location);
  };

  const handleBackToList = () => {
    setSelectedLocation(null);
  };

  // 詳細画面
  if (selectedLocation) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <button 
          onClick={handleBackToList}
          style={{
            backgroundColor: '#007AFF',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            marginBottom: '20px',
            cursor: 'pointer'
          }}
        >
          ← 検索結果に戻る
        </button>
        
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h1 style={{ margin: '0 0 16px 0' }}>{selectedLocation.name}</h1>
          
          <div style={{ marginBottom: '16px' }}>
            <span style={{ 
              backgroundColor: '#007AFF', 
              color: 'white', 
              padding: '4px 12px', 
              borderRadius: '12px', 
              fontSize: '14px' 
            }}>
              {selectedLocation.category === 'library' ? '図書館' : 
               selectedLocation.category === 'cafe' ? 'カフェ' :
               selectedLocation.category === 'study_room' ? '自習室' :
               selectedLocation.category === 'coworking' ? 'コワーキングスペース' : '公共施設'}
            </span>
          </div>

          <p style={{ marginBottom: '16px', color: '#666' }}>
            📍 {selectedLocation.address}
          </p>

          <div style={{ marginBottom: '20px' }}>
            <h3>営業時間</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {Object.entries(selectedLocation.basicInfo.openingHours).map(([day, hours]) => {
                const dayLabels: { [key: string]: string } = {
                  monday: '月曜日',
                  tuesday: '火曜日',
                  wednesday: '水曜日',
                  thursday: '木曜日',
                  friday: '金曜日',
                  saturday: '土曜日',
                  sunday: '日曜日'
                };
                return (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>{dayLabels[day]}:</span>
                    <span>{hours}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>料金</h3>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#007AFF' }}>
              {selectedLocation.basicInfo.pricing.type === 'free' ? '無料' :
               selectedLocation.basicInfo.pricing.type === 'hourly' ? `${selectedLocation.basicInfo.pricing.hourlyRate}円/時間` :
               `${selectedLocation.basicInfo.pricing.dailyRate}円/日`}
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>設備・環境</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{selectedLocation.facilities.wifi ? '✅' : '❌'}</span>
                <span>Wi-Fi</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{selectedLocation.facilities.power ? '✅' : '❌'}</span>
                <span>電源</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{selectedLocation.facilities.quiet ? '✅' : '❌'}</span>
                <span>静かな環境</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{selectedLocation.facilities.food ? '✅' : '❌'}</span>
                <span>飲食可能</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>評価・レビュー</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '24px' }}>
                {'★'.repeat(Math.round(selectedLocation.stats.averageRating))}
                {'☆'.repeat(5 - Math.round(selectedLocation.stats.averageRating))}
              </div>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {selectedLocation.stats.averageRating}
              </span>
              <span style={{ color: '#666' }}>
                ({selectedLocation.stats.reviewCount}件のレビュー)
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(selectedLocation.stats.tags).map(([tag, count]) => (
                <span key={tag} style={{ 
                  backgroundColor: '#E3F2FD', 
                  color: '#1976D2', 
                  padding: '4px 8px', 
                  borderRadius: '16px', 
                  fontSize: '14px' 
                }}>
                  #{tag} ({count})
                </span>
              ))}
            </div>
          </div>

          {selectedLocation.basicInfo.contact && (
            <div>
              <h3>お問い合わせ</h3>
              {selectedLocation.basicInfo.contact.phone && (
                <p>📞 {selectedLocation.basicInfo.contact.phone}</p>
              )}
              {selectedLocation.basicInfo.contact.website && (
                <p>🌐 <a href={selectedLocation.basicInfo.contact.website} target="_blank" rel="noopener noreferrer">
                  ウェブサイト
                </a></p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 一覧画面
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* ヘッダー */}
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ color: '#007AFF', fontSize: '32px', margin: '0 0 8px 0' }}>
          📚 StudySpot
        </h1>
        <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
          あなたに最適な学習場所を見つけよう
        </p>
      </header>

      {/* ナビゲーションタブ */}
      <div style={{ 
        display: 'flex',
        backgroundColor: '#fff',
        borderRadius: '8px',
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => setCurrentView('search')}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: 'none',
            backgroundColor: currentView === 'search' ? '#007AFF' : '#fff',
            color: currentView === 'search' ? '#fff' : '#333',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🔍 場所検索
        </button>
        <button
          onClick={() => setCurrentView('libraries')}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: 'none',
            backgroundColor: currentView === 'libraries' ? '#007AFF' : '#fff',
            color: currentView === 'libraries' ? '#fff' : '#333',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📚 図書館状況
        </button>
        <button
          onClick={() => setCurrentView('calil')}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: 'none',
            backgroundColor: currentView === 'calil' ? '#007AFF' : '#fff',
            color: currentView === 'calil' ? '#fff' : '#333',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🗾 全国図書館
        </button>
      </div>

      {/* コンテンツエリア */}
      {currentView === 'search' && (
        <>
          {/* フィルター */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>フィルター</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              距離
            </label>
            <select 
              value={filters.distance}
              onChange={(e) => setFilters({...filters, distance: Number(e.target.value)})}
              style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value={500}>500m以内</option>
              <option value={1000}>1km以内</option>
              <option value={2000}>2km以内</option>
              <option value={5000}>5km以内</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              カテゴリ
            </label>
            <select 
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="all">すべて</option>
              <option value="library">図書館</option>
              <option value="cafe">カフェ</option>
              <option value="study_room">自習室</option>
              <option value="coworking">コワーキングスペース</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input 
                type="checkbox"
                checked={filters.onlyFree}
                onChange={(e) => setFilters({...filters, onlyFree: e.target.checked})}
              />
              無料のみ
            </label>
          </div>
        </div>
      </div>

      {/* 結果表示 */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>
          検索結果 ({filteredLocations.length}件)
        </h2>
        {userLocation && (
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            現在地から近い順に表示しています
          </p>
        )}
      </div>

      {/* 場所一覧 */}
      <div>
        {filteredLocations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <h3>該当する場所が見つかりませんでした</h3>
            <p>フィルター条件を変更してみてください</p>
          </div>
        ) : (
          filteredLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              userLocation={userLocation}
              onClick={() => handleLocationClick(location)}
            />
          ))
        )}
      </div>
        </>
      )}

      {currentView === 'libraries' && (
        <LibraryExplorer
          userLocation={userLocation}
          onLibrarySelect={(library) => {
            setSelectedLocation(library);
            setCurrentView('search');
          }}
        />
      )}

      {currentView === 'calil' && <CalilLibraryExplorer />}
    </div>
  );
};

export default App;
