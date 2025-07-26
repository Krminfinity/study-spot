// サンプルデータ
import { StudyLocation } from './types';

export const sampleLocations: StudyLocation[] = [
  {
    id: '1',
    name: '新宿区立中央図書館',
    category: 'library',
    address: '東京都新宿区大久保3-1-1',
    coordinates: {
      latitude: 35.7008,
      longitude: 139.7003
    },
    basicInfo: {
      openingHours: {
        monday: '09:00-20:00',
        tuesday: '09:00-20:00',
        wednesday: '09:00-20:00',
        thursday: '09:00-20:00',
        friday: '09:00-20:00',
        saturday: '09:00-17:00',
        sunday: '09:00-17:00'
      },
      pricing: {
        type: 'free'
      },
      contact: {
        phone: '03-3208-2111',
        website: 'https://www.library.shinjuku.tokyo.jp/'
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
        '静か': 12,
        'Wi-Fi良好': 10,
        '電源あり': 14,
        '長時間OK': 8
      }
    },
    createdAt: new Date(),
    isActive: true
  },
  {
    id: '2',
    name: 'ドトールコーヒー 新宿東口店',
    category: 'cafe',
    address: '東京都新宿区新宿3-24-3',
    coordinates: {
      latitude: 35.6895,
      longitude: 139.7006
    },
    basicInfo: {
      openingHours: {
        monday: '07:00-22:00',
        tuesday: '07:00-22:00',
        wednesday: '07:00-22:00',
        thursday: '07:00-22:00',
        friday: '07:00-22:00',
        saturday: '07:00-22:00',
        sunday: '07:00-21:00'
      },
      pricing: {
        type: 'hourly',
        hourlyRate: 300
      },
      contact: {
        phone: '03-3123-4567'
      }
    },
    facilities: {
      wifi: true,
      power: false,
      food: true,
      quiet: false
    },
    stats: {
      averageRating: 3.8,
      reviewCount: 23,
      tags: {
        'Wi-Fi良好': 18,
        'アクセス良好': 20,
        '安い': 15,
        '電源あり': 5
      }
    },
    createdAt: new Date(),
    isActive: true
  },
  {
    id: '3',
    name: 'スタディルームLEAF 新宿店',
    category: 'study_room',
    address: '東京都新宿区西新宿1-1-8',
    coordinates: {
      latitude: 35.6896,
      longitude: 139.6917
    },
    basicInfo: {
      openingHours: {
        monday: '08:00-23:00',
        tuesday: '08:00-23:00',
        wednesday: '08:00-23:00',
        thursday: '08:00-23:00',
        friday: '08:00-23:00',
        saturday: '08:00-23:00',
        sunday: '08:00-22:00'
      },
      pricing: {
        type: 'hourly',
        hourlyRate: 500,
        dailyRate: 1500
      },
      contact: {
        phone: '03-5321-1234',
        website: 'https://studyroom-leaf.com/'
      }
    },
    facilities: {
      wifi: true,
      power: true,
      food: false,
      quiet: true
    },
    stats: {
      averageRating: 4.5,
      reviewCount: 8,
      tags: {
        '静か': 8,
        'Wi-Fi良好': 7,
        '電源あり': 8,
        '長時間OK': 6
      }
    },
    createdAt: new Date(),
    isActive: true
  },
  {
    id: '4',
    name: '渋谷区立中央図書館',
    category: 'library', 
    address: '東京都渋谷区宇田川町25-1',
    coordinates: {
      latitude: 35.6598,
      longitude: 139.6982
    },
    basicInfo: {
      openingHours: {
        monday: '休館',
        tuesday: '10:00-21:00',
        wednesday: '10:00-21:00',
        thursday: '10:00-21:00',
        friday: '10:00-21:00',
        saturday: '10:00-19:00',
        sunday: '10:00-17:00'
      },
      pricing: {
        type: 'free'
      },
      contact: {
        phone: '03-3463-1211'
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
      reviewCount: 12,
      tags: {
        '静か': 10,
        'Wi-Fi良好': 8,
        '電源あり': 11,
        'アクセス良好': 9
      }
    },
    createdAt: new Date(),
    isActive: true
  }
];
