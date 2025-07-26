# StudySpot MVP - 技術実装ガイド

## 1. 技術スタック（最小構成）

### 1.1 フロントエンド
- **Framework**: React Native 0.73+
- **Navigation**: React Navigation 6
- **State Management**: React Context API（Redux不要）
- **Maps**: react-native-maps + Google Maps API
- **UI Components**: React Native Elements

### 1.2 バックエンド
- **BaaS**: Firebase（完全サーバーレス）
  - Firestore: データベース
  - Auth: 認証
  - Storage: 画像保存
  - Hosting: 管理画面ホスティング

### 1.3 外部サービス
- **Google Maps API**: 地図表示・位置情報・ジオコーディング
- **Google Places API**: 場所の基本情報取得

## 2. データベース設計（Firestore）

### 2.1 コレクション構造
```
studyspot-mvp/
├── users/               # ユーザー情報
├── locations/           # 学習場所情報
├── reviews/            # レビュー・評価
└── categories/         # カテゴリマスタ
```

### 2.2 ドキュメント設計

#### Users Collection
```javascript
// users/{userId}
{
  uid: "firebase_uid",
  email: "user@example.com",
  displayName: "田中太郎",
  createdAt: timestamp,
  preferences: {
    searchRadius: 2000, // meters
    showOnlyFree: false
  }
}
```

#### Locations Collection
```javascript
// locations/{locationId}
{
  id: "auto_generated_id",
  name: "○○図書館",
  category: "library", // library, cafe, study_room, coworking
  address: "東京都新宿区...",
  coordinates: {
    latitude: 35.6895,
    longitude: 139.6917
  },
  basicInfo: {
    openingHours: {
      monday: "09:00-21:00",
      tuesday: "09:00-21:00",
      // ... 他の曜日
      sunday: "10:00-18:00"
    },
    pricing: {
      type: "free", // free, hourly, daily
      hourlyRate: 0,
      dailyRate: 0
    },
    contact: {
      phone: "03-1234-5678",
      website: "https://example.com"
    }
  },
  facilities: {
    wifi: true,
    power: true,
    food: false,
    quiet: true
  },
  stats: {
    averageRating: 4.2,
    reviewCount: 15,
    tags: {
      "静か": 12,
      "Wi-Fi良好": 10,
      "電源あり": 14
    }
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: true
}
```

#### Reviews Collection
```javascript
// reviews/{reviewId}
{
  id: "auto_generated_id",
  userId: "firebase_uid",
  locationId: "location_id",
  rating: 4, // 1-5
  comment: "静かで集中できます。電源も豊富でした。",
  tags: ["静か", "電源あり", "Wi-Fi良好"],
  visitDate: "2025-07-20",
  createdAt: timestamp,
  helpful: 0 // いいね数（将来機能）
}
```

## 3. React Native アプリ構成

### 3.1 プロジェクト構造
```
src/
├── components/          # 共通コンポーネント
│   ├── LocationCard.js
│   ├── MapView.js
│   ├── ReviewCard.js
│   └── FilterBar.js
├── screens/            # 画面コンポーネント
│   ├── MapScreen.js
│   ├── ListScreen.js
│   ├── LocationDetailScreen.js
│   ├── ReviewFormScreen.js
│   └── SettingsScreen.js
├── services/           # Firebase/API通信
│   ├── firebase.js
│   ├── locationService.js
│   └── reviewService.js
├── utils/              # ユーティリティ
│   ├── distance.js
│   └── datetime.js
└── constants/          # 定数
    ├── categories.js
    └── tags.js
```

### 3.2 主要コンポーネント実装例

#### MapScreen.js（メイン画面）
```javascript
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { getLocationsNearby } from '../services/locationService';
import FilterBar from '../components/FilterBar';

const MapScreen = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    radius: 2000,
    onlyFree: false,
    onlyOpen: true
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadNearbyLocations();
    }
  }, [userLocation, filters]);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const loadNearbyLocations = async () => {
    try {
      const nearbyLocations = await getLocationsNearby(userLocation, filters);
      setLocations(nearbyLocations);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      <MapView
        style={styles.map}
        region={{
          ...userLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            coordinate={location.coordinates}
            title={location.name}
            description={location.category}
            onCalloutPress={() => 
              navigation.navigate('LocationDetail', { locationId: location.id })
            }
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default MapScreen;
```

#### LocationCard.js（場所カード）
```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Rating } from 'react-native-elements';
import { calculateDistance } from '../utils/distance';

const LocationCard = ({ location, userLocation, onPress }) => {
  const distance = calculateDistance(userLocation, location.coordinates);
  
  return (
    <TouchableOpacity onPress={onPress}>
      <Card containerStyle={styles.card}>
        <View style={styles.header}>
          <Text style={styles.name}>{location.name}</Text>
          <Text style={styles.distance}>{distance}km</Text>
        </View>
        
        <View style={styles.info}>
          <Text style={styles.category}>{location.category}</Text>
          <Text style={styles.address}>{location.address}</Text>
        </View>
        
        <View style={styles.rating}>
          <Rating
            imageSize={16}
            readonly
            startingValue={location.stats.averageRating}
          />
          <Text style={styles.reviewCount}>
            ({location.stats.reviewCount}件)
          </Text>
        </View>
        
        <View style={styles.tags}>
          {Object.entries(location.stats.tags)
            .slice(0, 3)
            .map(([tag, count]) => (
              <Text key={tag} style={styles.tag}>#{tag}</Text>
            ))}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { margin: 8, borderRadius: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: 'bold' },
  distance: { color: '#666' },
  info: { marginVertical: 8 },
  category: { color: '#007AFF', fontWeight: '500' },
  address: { color: '#666', fontSize: 12 },
  rating: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  reviewCount: { marginLeft: 8, color: '#666' },
  tags: { flexDirection: 'row', marginTop: 8 },
  tag: { 
    backgroundColor: '#E3F2FD', 
    color: '#1976D2', 
    padding: 4, 
    borderRadius: 4, 
    marginRight: 4,
    fontSize: 12 
  },
});

export default LocationCard;
```

## 4. Firebase サービス実装

### 4.1 firebase.js（設定）
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Firebase設定
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 4.2 locationService.js
```javascript
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { db } from './firebase';
import { calculateDistance } from '../utils/distance';

export const getLocationsNearby = async (userLocation, filters) => {
  try {
    // Firestoreクエリ（簡易版）
    const locationsRef = collection(db, 'locations');
    let q = query(
      locationsRef,
      where('isActive', '==', true),
      orderBy('name'),
      limit(50)
    );

    // 料金フィルタ
    if (filters.onlyFree) {
      q = query(q, where('basicInfo.pricing.type', '==', 'free'));
    }

    const querySnapshot = await getDocs(q);
    let locations = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const distance = calculateDistance(userLocation, data.coordinates);
      
      // 距離フィルタ（クライアントサイド）
      if (distance <= filters.radius / 1000) {
        locations.push({
          id: doc.id,
          ...data,
          distance
        });
      }
    });

    // 距離順でソート
    locations.sort((a, b) => a.distance - b.distance);
    
    return locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

export const getLocationById = async (locationId) => {
  try {
    const locationDoc = await getDoc(doc(db, 'locations', locationId));
    if (locationDoc.exists()) {
      return { id: locationDoc.id, ...locationDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching location:', error);
    throw error;
  }
};
```

### 4.3 reviewService.js
```javascript
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

export const addReview = async (reviewData) => {
  try {
    // レビューを追加
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: new Date(),
      helpful: 0
    });

    // 場所の統計を更新
    await updateLocationStats(reviewData.locationId, reviewData.rating, reviewData.tags);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const getLocationReviews = async (locationId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('locationId', '==', locationId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const reviews = [];

    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    return reviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

const updateLocationStats = async (locationId, newRating, newTags) => {
  const locationRef = doc(db, 'locations', locationId);
  
  // 新しいレビューでカウントを更新
  const updates = {
    'stats.reviewCount': increment(1)
  };

  // タグカウントを更新
  newTags.forEach(tag => {
    updates[`stats.tags.${tag}`] = increment(1);
  });

  await updateDoc(locationRef, updates);
  
  // 平均評価の再計算は複雑なので、Cloud Functionsで実装することを推奨
};
```

## 5. ユーティリティ関数

### 5.1 distance.js
```javascript
export const calculateDistance = (coord1, coord2) => {
  const R = 6371; // 地球の半径（km）
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // 小数点第1位まで
};

const toRad = (value) => {
  return value * Math.PI / 180;
};
```

## 6. デプロイメント

### 6.1 Firebase設定
1. Firebase プロジェクト作成
2. Firestore データベース有効化
3. Authentication 有効化（Email、Google）
4. Google Maps API キー取得・設定

### 6.2 アプリビルド
```bash
# iOS
cd ios && pod install
npx react-native run-ios

# Android
npx react-native run-android

# リリースビルド
npx react-native build-android --variant=release
```

### 6.3 ストア申請
- App Store Connect（iOS）
- Google Play Console（Android）

## 7. 初期データ投入

### 7.1 場所データの準備
```javascript
// scripts/seedData.js
const locations = [
  {
    name: "国立国会図書館",
    category: "library",
    address: "東京都千代田区永田町1-10-1",
    coordinates: { latitude: 35.6762, longitude: 139.7425 },
    basicInfo: {
      openingHours: {
        monday: "09:30-19:00",
        tuesday: "09:30-19:00",
        // ...
      },
      pricing: { type: "free", hourlyRate: 0, dailyRate: 0 }
    },
    facilities: { wifi: true, power: true, food: false, quiet: true },
    isActive: true
  },
  // 他の場所データ...
];

// Firestoreにデータを投入するスクリプト
```

## 8. 運用・監視

### 8.1 Firebase Analytics
- ユーザー行動の追跡
- 画面遷移の分析
- クラッシュレポート

### 8.2 パフォーマンス監視
- API レスポンス時間
- 地図表示速度
- 検索結果表示時間

この技術実装ガイドにより、3ヶ月でMVPを開発・リリースすることが可能になります。
