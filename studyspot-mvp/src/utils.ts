// 距離計算のユーティリティ関数
export const calculateDistance = (
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
): number => {
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

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

// カテゴリの日本語表示
export const getCategoryLabel = (category: string): string => {
  const categoryLabels: { [key: string]: string } = {
    library: '図書館',
    cafe: 'カフェ',
    study_room: '自習室',
    coworking: 'コワーキングスペース',
    public: '公共施設'
  };
  return categoryLabels[category] || category;
};

// 営業時間の表示フォーマット
export const formatOpeningHours = (openingHours: { [key: string]: string }): string => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayJP = {
    monday: '月',
    tuesday: '火', 
    wednesday: '水',
    thursday: '木',
    friday: '金',
    saturday: '土',
    sunday: '日'
  }[today];
  
  const todayHours = openingHours[today];
  if (todayHours === '休館' || todayHours === 'closed') {
    return '本日休業';
  }
  
  return `本日（${todayJP}）${todayHours}`;
};

// 料金の表示フォーマット
export const formatPricing = (pricing: { type: string; hourlyRate?: number; dailyRate?: number }): string => {
  if (pricing.type === 'free') {
    return '無料';
  }
  if (pricing.type === 'hourly' && pricing.hourlyRate) {
    return `時間制 ${pricing.hourlyRate}円/時間`;
  }
  if (pricing.type === 'daily' && pricing.dailyRate) {
    return `1日 ${pricing.dailyRate}円`;
  }
  return '料金要確認';
};

// 現在営業中かどうかの判定
export const isCurrentlyOpen = (openingHours: { [key: string]: string }): boolean => {
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.getHours() * 100 + now.getMinutes();
  
  const todayHours = openingHours[today];
  if (!todayHours || todayHours === '休館' || todayHours === 'closed') {
    return false;
  }
  
  const [open, close] = todayHours.split('-');
  if (!open || !close) return false;
  
  const openTime = parseInt(open.replace(':', ''));
  const closeTime = parseInt(close.replace(':', ''));
  
  return currentTime >= openTime && currentTime <= closeTime;
};
