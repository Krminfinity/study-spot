// 型定義
export interface StudyLocation {
  id: string;
  name: string;
  category: 'library' | 'cafe' | 'study_room' | 'coworking' | 'public';
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  basicInfo: {
    openingHours: {
      [key: string]: string;
    };
    pricing: {
      type: 'free' | 'hourly' | 'daily';
      hourlyRate?: number;
      dailyRate?: number;
    };
    contact?: {
      phone?: string;
      website?: string;
    };
  };
  facilities: {
    wifi: boolean;
    power: boolean;
    food: boolean;
    quiet: boolean;
  };
  stats: {
    averageRating: number;
    reviewCount: number;
    tags: { [key: string]: number };
  };
  createdAt: Date;
  isActive: boolean;
  // カーリル図書館情報（図書館のみ）
  calilInfo?: {
    systemid: string;
    systemname: string;
    libkey: string;
    category: 'SMALL' | 'MEDIUM' | 'LARGE' | 'UNIV' | 'SPECIAL' | 'BM';
    distance?: number;
  };
}

export interface Review {
  id: string;
  userId: string;
  locationId: string;
  rating: number; // 1-5
  comment: string;
  tags: string[];
  visitDate: string;
  createdAt: Date;
  helpful: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  preferences: {
    searchRadius: number;
    showOnlyFree: boolean;
  };
}
