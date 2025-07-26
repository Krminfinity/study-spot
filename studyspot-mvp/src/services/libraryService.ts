// 図書館営業状況取得サービス
import { StudyLocation } from '../types';

export interface LibraryStatus {
  isOpen: boolean;
  todayHours: string;
  specialNotice?: string;
  lastUpdated: Date;
}

export interface LibraryCalendarEvent {
  date: string;
  type: 'closed' | 'special_hours' | 'event';
  description: string;
  specialHours?: string;
}

// 全国主要図書館データベース
export const MAJOR_LIBRARIES = [
  // 東京都
  {
    id: 'tokyo_central',
    name: '東京都立中央図書館',
    prefecture: '東京都',
    city: '港区',
    address: '東京都港区南麻布5-7-13',
    coordinates: { latitude: 35.6547, longitude: 139.7389 },
    phone: '03-3442-8451',
    website: 'https://www.library.metro.tokyo.lg.jp/',
    standardHours: {
      monday: '10:00-20:00',
      tuesday: '10:00-20:00',
      wednesday: '10:00-20:00',
      thursday: '10:00-20:00',
      friday: '10:00-20:00',
      saturday: '10:00-17:00',
      sunday: '10:00-17:00'
    },
    regularClosedDays: ['第1・3・5木曜日', '年末年始', '特別整理期間'],
    category: 'prefectural'
  },
  {
    id: 'shinjuku_central',
    name: '新宿区立中央図書館',
    prefecture: '東京都',
    city: '新宿区',
    address: '東京都新宿区大久保3-1-1',
    coordinates: { latitude: 35.7008, longitude: 139.7003 },
    phone: '03-3208-2111',
    website: 'https://www.library.shinjuku.tokyo.jp/',
    standardHours: {
      monday: '09:00-21:30',
      tuesday: '09:00-21:30',
      wednesday: '09:00-21:30',
      thursday: '09:00-21:30',
      friday: '09:00-21:30',
      saturday: '09:00-19:00',
      sunday: '09:00-19:00'
    },
    regularClosedDays: ['第2木曜日', '年末年始', '特別整理期間'],
    category: 'municipal'
  },
  {
    id: 'shibuya_central',
    name: '渋谷区立中央図書館',
    prefecture: '東京都',
    city: '渋谷区',
    address: '東京都渋谷区宇田川町25-1',
    coordinates: { latitude: 35.6598, longitude: 139.6982 },
    phone: '03-3463-1211',
    website: 'https://www.lib.city.shibuya.tokyo.jp/',
    standardHours: {
      monday: '休館',
      tuesday: '10:00-21:00',
      wednesday: '10:00-21:00',
      thursday: '10:00-21:00',
      friday: '10:00-21:00',
      saturday: '10:00-19:00',
      sunday: '10:00-17:00'
    },
    regularClosedDays: ['月曜日', '第2・4木曜日', '年末年始', '特別整理期間'],
    category: 'municipal'
  },
  // 神奈川県
  {
    id: 'kanagawa_prefectural',
    name: '神奈川県立図書館',
    prefecture: '神奈川県',
    city: '横浜市',
    address: '神奈川県横浜市西区紅葉ヶ丘9-2',
    coordinates: { latitude: 35.4437, longitude: 139.6244 },
    phone: '045-263-5900',
    website: 'https://www.klnet.pref.kanagawa.jp/',
    standardHours: {
      monday: '休館',
      tuesday: '09:00-19:00',
      wednesday: '09:00-19:00',
      thursday: '09:00-19:00',
      friday: '09:00-19:00',
      saturday: '09:00-17:00',
      sunday: '09:00-17:00'
    },
    regularClosedDays: ['月曜日', '第2木曜日', '年末年始', '特別整理期間'],
    category: 'prefectural'
  }
];

// 図書館営業状況チェック関数
export const checkLibraryStatus = async (libraryId: string): Promise<LibraryStatus> => {
  const library = MAJOR_LIBRARIES.find(lib => lib.id === libraryId);
  if (!library) {
    throw new Error('図書館が見つかりません');
  }

  const now = new Date();
  const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  // 基本営業時間チェック
  const todayHours = library.standardHours[today as keyof typeof library.standardHours];
  
  if (!todayHours || todayHours === '休館') {
    return {
      isOpen: false,
      todayHours: '本日休館',
      lastUpdated: now
    };
  }

  // 営業時間内チェック
  const [openTime, closeTime] = todayHours.split('-');
  const openTimeInt = parseInt(openTime.replace(':', ''));
  const closeTimeInt = parseInt(closeTime.replace(':', ''));

  const isOpen = currentTime >= openTimeInt && currentTime <= closeTimeInt;

  return {
    isOpen,
    todayHours: `本日 ${todayHours}`,
    lastUpdated: now
  };
};

// 特別休館日・イベント情報取得（将来的にスクレイピングで実装）
export const getLibraryCalendar = async (libraryId: string, month?: number): Promise<LibraryCalendarEvent[]> => {
  // 現在はサンプルデータを返す
  // 将来的には各図書館のカレンダーページをスクレイピングして取得
  const sampleEvents: LibraryCalendarEvent[] = [
    {
      date: '2025-07-29',
      type: 'closed',
      description: '施設点検のため休館'
    },
    {
      date: '2025-08-05',
      type: 'special_hours',
      description: '夏祭りイベント',
      specialHours: '10:00-15:00'
    },
    {
      date: '2025-08-15',
      type: 'closed',
      description: 'お盆休み'
    }
  ];

  return sampleEvents;
};

// 近隣図書館検索
export const searchNearbyLibraries = (
  userLocation: { latitude: number; longitude: number },
  radius: number = 5000 // meters
): typeof MAJOR_LIBRARIES => {
  return MAJOR_LIBRARIES.filter(library => {
    const distance = calculateDistance(userLocation, library.coordinates);
    return distance * 1000 <= radius;
  });
};

// 距離計算（Haversine formula）
const calculateDistance = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number => {
  const R = 6371; // 地球の半径（km）
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// 図書館情報をStudyLocation形式に変換
export const convertLibraryToStudyLocation = (library: typeof MAJOR_LIBRARIES[0]): StudyLocation => {
  return {
    id: library.id,
    name: library.name,
    category: 'library',
    address: library.address,
    coordinates: library.coordinates,
    basicInfo: {
      openingHours: library.standardHours,
      pricing: { type: 'free' },
      contact: {
        phone: library.phone,
        website: library.website
      }
    },
    facilities: {
      wifi: true,
      power: true,
      food: false,
      quiet: true
    },
    stats: {
      averageRating: 4.0,
      reviewCount: 0,
      tags: {
        '静か': 10,
        'Wi-Fi良好': 8,
        '電源あり': 9,
        '無料': 10
      }
    },
    createdAt: new Date(),
    isActive: true
  };
};
