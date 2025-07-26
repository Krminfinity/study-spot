// カーリル図書館API統合サービス
export interface CalilLibrary {
  systemid: string;
  systemname: string;
  libkey: string;
  libid: string;
  short: string;
  formal: string;
  url_pc?: string;
  address: string;
  pref: string;
  city: string;
  post?: string;
  tel?: string;
  geocode: string;
  category: 'SMALL' | 'MEDIUM' | 'LARGE' | 'UNIV' | 'SPECIAL' | 'BM';
  image?: string;
  distance?: number;
}

// カーリルAPIは直接配列を返すため、配列型として定義
export type CalilResponse = CalilLibrary[];

// カーリルAPIキー
const CALIL_API_KEY = '61e5a886bcf815c7a044269ed80b6f64';
const CALIL_API_BASE = 'https://api.calil.jp';

// 図書館検索クラス
export class CalilLibraryService {
  private apiKey: string;

  constructor() {
    this.apiKey = CALIL_API_KEY;
  }

    // 都道府県で図書館を検索
  async searchByPrefecture(prefecture: string, limit?: number): Promise<CalilLibrary[]> {
    try {
      const url = new URL(`${CALIL_API_BASE}/library`);
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('pref', prefecture);
      url.searchParams.append('format', 'json');
      url.searchParams.append('callback', 'no');
      if (limit) {
        url.searchParams.append('limit', limit.toString());
      }

      console.log('Requesting URL:', url.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`カーリルAPI エラー: ${response.status}`);
      }

      const data = await response.text();
      console.log('Raw response preview:', data.substring(0, 500));
      
      // JSONPのコールバックが含まれている場合は除去、そうでなければそのまま使用
      const jsonData = data.startsWith('callback(') || data.startsWith('no(') 
        ? data.replace(/^[a-zA-Z_]+\(/, '').replace(/\);?$/, '')
        : data;
      console.log('Cleaned JSON preview:', jsonData.substring(0, 500));
      
      const parsed: CalilResponse = JSON.parse(jsonData);
      console.log('Parsed response structure:', {
        isArray: Array.isArray(parsed),
        libraryCount: Array.isArray(parsed) ? parsed.length : 0,
        firstLibrary: Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null
      });

      return this.normalizeLibraryData(parsed);
    } catch (error) {
      console.error('図書館検索エラー:', error);
      return [];
    }
  }

  // 市区町村で図書館を検索
  async searchByCity(prefecture: string, city: string, limit?: number): Promise<CalilLibrary[]> {
    try {
      const url = new URL(`${CALIL_API_BASE}/library`);
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('pref', prefecture);
      url.searchParams.append('city', city);
      url.searchParams.append('format', 'json');
      url.searchParams.append('callback', 'no');
      if (limit) {
        url.searchParams.append('limit', limit.toString());
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`カーリルAPI エラー: ${response.status}`);
      }

      const data = await response.text();
      const jsonData = data.startsWith('no(')
        ? data.replace(/^no\(/, '').replace(/\);?$/, '')
        : data;
      const parsed: CalilResponse = JSON.parse(jsonData);

      return this.normalizeLibraryData(parsed);
    } catch (error) {
      console.error('市区町村検索エラー:', error);
      return [];
    }
  }

  // 位置情報で近隣図書館を検索（エイリアス）
  async searchNearby(
    latitude: number, 
    longitude: number, 
    radius: number = 5000,
    limit: number = 20
  ): Promise<CalilLibrary[]> {
    return this.searchByLocation(latitude, longitude, radius, limit);
  }

  // 位置情報で近隣図書館を検索
  async searchByLocation(
    latitude: number, 
    longitude: number, 
    radius: number = 5000,
    limit: number = 20
  ): Promise<CalilLibrary[]> {
    try {
      const url = new URL(`${CALIL_API_BASE}/library`);
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('geocode', `${longitude},${latitude}`);
      url.searchParams.append('format', 'json');
      url.searchParams.append('callback', 'no');
      url.searchParams.append('limit', limit.toString());

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`カーリルAPI エラー: ${response.status}`);
      }

      const data = await response.text();
      const jsonData = data.startsWith('no(')
        ? data.replace(/^no\(/, '').replace(/\);?$/, '')
        : data;
      const parsed: CalilResponse = JSON.parse(jsonData);

      return this.normalizeLibraryData(parsed);
    } catch (error) {
      console.error('近隣図書館検索エラー:', error);
      return [];
    }
  }

  // システムIDで図書館を検索
  async searchBySystemId(systemId: string): Promise<CalilLibrary[]> {
    try {
      const url = new URL(`${CALIL_API_BASE}/library`);
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('systemid', systemId);
      url.searchParams.append('format', 'json');
      url.searchParams.append('callback', 'no');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`カーリルAPI エラー: ${response.status}`);
      }

      const data = await response.text();
      const jsonData = data.startsWith('no(')
        ? data.replace(/^no\(/, '').replace(/\);?$/, '')
        : data;
      const parsed: CalilResponse = JSON.parse(jsonData);

      return this.normalizeLibraryData(parsed);
    } catch (error) {
      console.error('システムID検索エラー:', error);
      return [];
    }
  }

  // レスポンスデータの正規化
  private normalizeLibraryData(response: CalilResponse): CalilLibrary[] {
    console.log('normalizeLibraryData called with response:', response);
    
    if (!Array.isArray(response) || response.length === 0) {
      console.log('Response is not an array or is empty');
      return [];
    }

    console.log('Found libraries:', response.length);
    console.log('First library sample:', response[0]);

    return response.map(lib => ({
      systemid: lib.systemid,
      systemname: lib.systemname,
      libkey: lib.libkey,
      libid: lib.libid,
      short: lib.short,
      formal: lib.formal,
      url_pc: lib.url_pc,
      address: lib.address,
      pref: lib.pref,
      city: lib.city,
      post: lib.post,
      tel: lib.tel,
      geocode: lib.geocode,
      category: lib.category,
      image: lib.image,
      distance: lib.distance
    }));
  }

  // カテゴリの日本語表示
  getCategoryLabel(category: string): string {
    const categoryLabels: { [key: string]: string } = {
      SMALL: '図書室・公民館',
      MEDIUM: '図書館(地域)',
      LARGE: '図書館(広域)',
      UNIV: '大学図書館',
      SPECIAL: '専門図書館',
      BM: '移動図書館'
    };
    return categoryLabels[category] || '図書館';
  }

  // カテゴリのアイコン
  getCategoryIcon(category: string): string {
    const categoryIcons: { [key: string]: string } = {
      SMALL: '🏢',
      MEDIUM: '📚',
      LARGE: '🏛️',
      UNIV: '🎓',
      SPECIAL: '📖',
      BM: '🚐'
    };
    return categoryIcons[category] || '📚';
  }

  // カーリルへのリンク生成
  generateCalilBookLink(isbn: string): string {
    return `https://calil.jp/book/${isbn}`;
  }

  generateCalilLibraryLink(libid: string, libraryName: string): string {
    return `https://calil.jp/library/${libid}/${encodeURIComponent(libraryName)}`;
  }

  generateCalilLibrarySearchLink(systemId: string, libkey: string): string {
    return `https://calil.jp/library/search?s=${systemId}&k=${encodeURIComponent(libkey)}`;
  }
}

// StudyLocation形式への変換
export const convertCalilToStudyLocation = (calilLibrary: CalilLibrary) => {
  const [longitude, latitude] = calilLibrary.geocode.split(',').map(Number);
  
  return {
    id: calilLibrary.libid,
    name: calilLibrary.formal,
    category: 'library' as const,
    address: calilLibrary.address,
    coordinates: {
      latitude,
      longitude
    },
    basicInfo: {
      openingHours: {
        monday: '要確認',
        tuesday: '要確認',
        wednesday: '要確認',
        thursday: '要確認',
        friday: '要確認',
        saturday: '要確認',
        sunday: '要確認'
      },
      pricing: { type: 'free' as const },
      contact: {
        phone: calilLibrary.tel,
        website: calilLibrary.url_pc
      }
    },
    facilities: {
      wifi: true, // 仮定
      power: true, // 仮定
      food: false,
      quiet: true
    },
    stats: {
      averageRating: 4.0,
      reviewCount: 0,
      tags: {
        '静か': 8,
        '無料': 10,
        'アクセス良好': 6
      }
    },
    createdAt: new Date(),
    isActive: true,
    // カーリル固有情報
    calilInfo: {
      systemid: calilLibrary.systemid,
      systemname: calilLibrary.systemname,
      libkey: calilLibrary.libkey,
      category: calilLibrary.category,
      distance: calilLibrary.distance
    }
  };
};
