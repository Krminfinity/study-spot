// HeartRails Express APIによる駅名サジェスト
export async function fetchStationSuggestions(query: string): Promise<Station[]> {
  const cleaned = query.trim().replace(/駅$/,'');
  if (!cleaned) return [];
  try {
    const url = `https://express.heartrails.com/api/json?method=getStations&name=${encodeURIComponent(cleaned)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.response || !data.response.station) return [];
    return data.response.station.map((s: any) => ({
      id: `${s.line}-${s.name}`,
      name: s.name,
      prefecture: s.prefecture,
      line: s.line,
      latitude: Number(s.y),
      longitude: Number(s.x),
      operator: s.line || '' // operator情報がないためlineで代用
    }));
  } catch (e) {
    console.error('HeartRails駅サジェストAPI失敗:', e);
    return [];
  }
}
// 駅情報サービス（無料API使用）

// 駅データの型定義
export interface Station {
  id: string;
  name: string;
  prefecture: string;
  line: string;
  latitude: number;
  longitude: number;
  operator: string;
  city?: string;
  postal_code?: string;
}

// 駅検索結果の型定義
export interface StationSearchResult {
  station: Station;
  distance: number; // メートル
}

export class StationService {
  private stationsCache: Station[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeStations();
  }

  // 初期化時に基本的な駅データを読み込み
  private async initializeStations() {
    try {
      // 主要駅のフォールバックデータを設定
      this.stationsCache = this.getFallbackStations();
      this.isInitialized = true;
    } catch (error) {
      console.error('駅データの初期化に失敗:', error);
      this.isInitialized = true; // エラーでも初期化完了とする
    }
  }

  // フォールバックの主要駅データ
  private getFallbackStations(): Station[] {
    return [
      // JR山手線主要駅
      { id: 'tokyo', name: '東京', prefecture: '東京都', line: 'JR山手線', latitude: 35.6812, longitude: 139.7671, operator: 'JR東日本' },
      { id: 'shinjuku', name: '新宿', prefecture: '東京都', line: 'JR山手線', latitude: 35.6896, longitude: 139.7006, operator: 'JR東日本' },
      { id: 'shibuya', name: '渋谷', prefecture: '東京都', line: 'JR山手線', latitude: 35.6580, longitude: 139.7016, operator: 'JR東日本' },
      { id: 'ikebukuro', name: '池袋', prefecture: '東京都', line: 'JR山手線', latitude: 35.7295, longitude: 139.7109, operator: 'JR東日本' },
      { id: 'ueno', name: '上野', prefecture: '東京都', line: 'JR山手線', latitude: 35.7140, longitude: 139.7774, operator: 'JR東日本' },
      { id: 'shinagawa', name: '品川', prefecture: '東京都', line: 'JR山手線', latitude: 35.6284, longitude: 139.7387, operator: 'JR東日本' },
      { id: 'akihabara', name: '秋葉原', prefecture: '東京都', line: 'JR山手線', latitude: 35.6984, longitude: 139.7731, operator: 'JR東日本' },
      { id: 'yurakucho', name: '有楽町', prefecture: '東京都', line: 'JR山手線', latitude: 35.6751, longitude: 139.7634, operator: 'JR東日本' },
      { id: 'ebisu', name: '恵比寿', prefecture: '東京都', line: 'JR山手線', latitude: 35.6465, longitude: 139.7100, operator: 'JR東日本' },
      { id: 'harajuku', name: '原宿', prefecture: '東京都', line: 'JR山手線', latitude: 35.6702, longitude: 139.7026, operator: 'JR東日本' },
      
      // 関東主要駅
      { id: 'yokohama', name: '横浜', prefecture: '神奈川県', line: 'JR東海道本線', latitude: 35.4657, longitude: 139.6224, operator: 'JR東日本' },
      { id: 'kawasaki', name: '川崎', prefecture: '神奈川県', line: 'JR東海道本線', latitude: 35.5308, longitude: 139.6979, operator: 'JR東日本' },
      { id: 'omiya', name: '大宮', prefecture: '埼玉県', line: 'JR東北本線', latitude: 35.9063, longitude: 139.6244, operator: 'JR東日本' },
      { id: 'urawa', name: '浦和', prefecture: '埼玉県', line: 'JR東北本線', latitude: 35.8617, longitude: 139.6565, operator: 'JR東日本' },
      { id: 'chiba', name: '千葉', prefecture: '千葉県', line: 'JR総武本線', latitude: 35.6074, longitude: 140.1060, operator: 'JR東日本' },
      { id: 'funabashi', name: '船橋', prefecture: '千葉県', line: 'JR総武本線', latitude: 35.6952, longitude: 139.9839, operator: 'JR東日本' },
      { id: 'machida', name: '町田', prefecture: '東京都', line: '小田急小田原線', latitude: 35.5424, longitude: 139.4267, operator: '小田急電鉄' },
      { id: 'kichijoji', name: '吉祥寺', prefecture: '東京都', line: 'JR中央線', latitude: 35.7035, longitude: 139.5803, operator: 'JR東日本' },
      { id: 'mitaka', name: '三鷹', prefecture: '東京都', line: 'JR中央線', latitude: 35.6836, longitude: 139.5594, operator: 'JR東日本' },
      { id: 'tachikawa', name: '立川', prefecture: '東京都', line: 'JR中央線', latitude: 35.6986, longitude: 139.4141, operator: 'JR東日本' },
      
      // 関西主要駅
      { id: 'osaka', name: '大阪', prefecture: '大阪府', line: 'JR東海道本線', latitude: 34.7024, longitude: 135.4959, operator: 'JR西日本' },
      { id: 'kyoto', name: '京都', prefecture: '京都府', line: 'JR東海道本線', latitude: 34.9858, longitude: 135.7589, operator: 'JR西日本' },
      { id: 'kobe', name: '神戸', prefecture: '兵庫県', line: 'JR東海道本線', latitude: 34.6913, longitude: 135.1830, operator: 'JR西日本' },
      { id: 'namba', name: '難波', prefecture: '大阪府', line: '南海本線', latitude: 34.6659, longitude: 135.5003, operator: '南海電鉄' },
      { id: 'tennoji', name: '天王寺', prefecture: '大阪府', line: 'JR大阪環状線', latitude: 34.6458, longitude: 135.5144, operator: 'JR西日本' },
      
      // その他主要駅
      { id: 'nagoya', name: '名古屋', prefecture: '愛知県', line: 'JR東海道本線', latitude: 35.1709, longitude: 136.8815, operator: 'JR東海' },
      { id: 'sendai', name: '仙台', prefecture: '宮城県', line: 'JR東北本線', latitude: 38.2606, longitude: 140.8819, operator: 'JR東日本' },
      { id: 'hiroshima', name: '広島', prefecture: '広島県', line: 'JR山陽本線', latitude: 34.3971, longitude: 132.4756, operator: 'JR西日本' },
      { id: 'fukuoka', name: '博多', prefecture: '福岡県', line: 'JR鹿児島本線', latitude: 33.5904, longitude: 130.4208, operator: 'JR九州' },
      { id: 'sapporo', name: '札幌', prefecture: '北海道', line: 'JR函館本線', latitude: 43.0642, longitude: 141.3469, operator: 'JR北海道' },
      
      // 小田急線
      { id: 'sagamiono', name: '相模大野', prefecture: '神奈川県', line: '小田急小田原線', latitude: 35.5295, longitude: 139.4442, operator: '小田急電鉄' },
      { id: 'fujisawa', name: '藤沢', prefecture: '神奈川県', line: '小田急江ノ島線', latitude: 35.3409, longitude: 139.4839, operator: '小田急電鉄' },
      { id: 'shimo-kitazawa', name: '下北沢', prefecture: '東京都', line: '小田急小田原線', latitude: 35.6613, longitude: 139.6681, operator: '小田急電鉄' },
      
      // 東急線
      { id: 'jiyugaoka', name: '自由が丘', prefecture: '東京都', line: '東急東横線', latitude: 35.6084, longitude: 139.6686, operator: '東急電鉄' },
      { id: 'musashikosugi', name: '武蔵小杉', prefecture: '神奈川県', line: '東急東横線', latitude: 35.5781, longitude: 139.6565, operator: '東急電鉄' },
      { id: 'nakameguro', name: '中目黒', prefecture: '東京都', line: '東急東横線', latitude: 35.6444, longitude: 139.6990, operator: '東急電鉄' },
      
      // 京急線
      { id: 'keikyu-kamata', name: '京急蒲田', prefecture: '東京都', line: '京急本線', latitude: 35.5616, longitude: 139.7164, operator: '京急電鉄' },
      { id: 'kanazawa-bunko', name: '金沢文庫', prefecture: '神奈川県', line: '京急本線', latitude: 35.3425, longitude: 139.6188, operator: '京急電鉄' },
      
      // 京王線
      { id: 'chofu', name: '調布', prefecture: '東京都', line: '京王線', latitude: 35.6517, longitude: 139.5418, operator: '京王電鉄' },
      { id: 'takahata-fudo', name: '高幡不動', prefecture: '東京都', line: '京王線', latitude: 35.6597, longitude: 139.4053, operator: '京王電鉄' },
      
      // 神奈川県の追加駅
      { id: 'kamakura', name: '鎌倉', prefecture: '神奈川県', line: 'JR東海道本線', latitude: 35.3190, longitude: 139.5491, operator: 'JR東日本' },
      { id: 'odawara', name: '小田原', prefecture: '神奈川県', line: 'JR東海道本線', latitude: 35.2561, longitude: 139.1564, operator: 'JR東日本' },
      { id: 'koganecho', name: '黄金町', prefecture: '神奈川県', line: '京急本線', latitude: 35.4395, longitude: 139.6186, operator: '京急電鉄' },
      { id: 'hinodecho', name: '日ノ出町', prefecture: '神奈川県', line: '京急本線', latitude: 35.4456, longitude: 139.6234, operator: '京急電鉄' },
      { id: 'koganetcho', name: '黄金町', prefecture: '神奈川県', line: '京急本線', latitude: 35.4395, longitude: 139.6186, operator: '京急電鉄' },
      { id: 'nippori', name: '日暮里', prefecture: '東京都', line: 'JR山手線', latitude: 35.7276, longitude: 139.7710, operator: 'JR東日本' },
      { id: 'tabata', name: '田端', prefecture: '東京都', line: 'JR山手線', latitude: 35.7377, longitude: 139.7608, operator: 'JR東日本' },
      { id: 'komagome', name: '駒込', prefecture: '東京都', line: 'JR山手線', latitude: 35.7364, longitude: 139.7465, operator: 'JR東日本' },
      { id: 'sugamo', name: '巣鴨', prefecture: '東京都', line: 'JR山手線', latitude: 35.7334, longitude: 139.7395, operator: 'JR東日本' },
      { id: 'otsuka', name: '大塚', prefecture: '東京都', line: 'JR山手線', latitude: 35.7314, longitude: 139.7289, operator: 'JR東日本' },
      { id: 'mejiro', name: '目白', prefecture: '東京都', line: 'JR山手線', latitude: 35.7215, longitude: 139.7066, operator: 'JR東日本' },
      { id: 'takadanobaba', name: '高田馬場', prefecture: '東京都', line: 'JR山手線', latitude: 35.7127, longitude: 139.7038, operator: 'JR東日本' },
      { id: 'shimbashi', name: '新橋', prefecture: '東京都', line: 'JR山手線', latitude: 35.6658, longitude: 139.7589, operator: 'JR東日本' },
      { id: 'hamamatsucho', name: '浜松町', prefecture: '東京都', line: 'JR山手線', latitude: 35.6556, longitude: 139.7569, operator: 'JR東日本' },
      { id: 'tamachi', name: '田町', prefecture: '東京都', line: 'JR山手線', latitude: 35.6455, longitude: 139.7479, operator: 'JR東日本' },
      { id: 'osaki', name: '大崎', prefecture: '東京都', line: 'JR山手線', latitude: 35.6197, longitude: 139.7280, operator: 'JR東日本' },
      { id: 'gotanda', name: '五反田', prefecture: '東京都', line: 'JR山手線', latitude: 35.6259, longitude: 139.7237, operator: 'JR東日本' },
      { id: 'meguro', name: '目黒', prefecture: '東京都', line: 'JR山手線', latitude: 35.6340, longitude: 139.7157, operator: 'JR東日本' },
      { id: 'nippori2', name: '日暮里', prefecture: '東京都', line: 'JR山手線', latitude: 35.7276, longitude: 139.7710, operator: 'JR東日本' },
      { id: 'nishi-nippori', name: '西日暮里', prefecture: '東京都', line: 'JR山手線', latitude: 35.7321, longitude: 139.7670, operator: 'JR東日本' },
    ];
  }

  // 駅名で検索（同期版・後方互換性のため）
  searchByName(query: string): Station[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];
    
    const queryPatterns = [
      normalizedQuery,
      query,
      this.convertToHiragana(normalizedQuery),
      this.convertToKatakana(normalizedQuery),
    ];
    
    return this.stationsCache.filter(station => {
      return queryPatterns.some(pattern => 
        station.name.toLowerCase().includes(pattern) ||
        station.name.includes(pattern) ||
        this.getStationReading(station.name).includes(pattern)
      );
    }).slice(0, 50);
  }

  // 簡易的な読み仮名取得（一部の駅のみ）
  private getStationReading(stationName: string): string {
    const readings: { [key: string]: string } = {
      '横浜': 'よこはま',
      '新宿': 'しんじゅく',
      '渋谷': 'しぶや',
      '池袋': 'いけぶくろ',
      '上野': 'うえの',
      '秋葉原': 'あきはばら',
      '品川': 'しながわ',
      '東京': 'とうきょう',
      '大宮': 'おおみや',
      '川口': 'かわぐち',
      '浦和': 'うらわ',
      '船橋': 'ふなばし',
      '柏': 'かしわ',
      '松戸': 'まつど',
      '町田': 'まちだ',
      '吉祥寺': 'きちじょうじ',
      '三鷹': 'みたか',
      '調布': 'ちょうふ',
      '藤沢': 'ふじさわ',
      '大船': 'おおふな',
      '鎌倉': 'かまくら',
      '小田原': 'おだわら'
    };
    return readings[stationName] || stationName.toLowerCase();
  }

  // 簡易的なひらがな変換
  private convertToHiragana(text: string): string {
    // 基本的なローマ字からひらがなへの変換
    const romajiMap: { [key: string]: string } = {
      'yokohama': 'よこはま',
      'shinjuku': 'しんじゅく',
      'shibuya': 'しぶや',
      'ikebukuro': 'いけぶくろ',
      'ueno': 'うえの',
      'akihabara': 'あきはばら',
      'shinagawa': 'しながわ',
      'tokyo': 'とうきょう',
      'omiya': 'おおみや',
      'kawaguchi': 'かわぐち'
    };
    return romajiMap[text] || text;
  }

  // 簡易的なカタカナ変換
  private convertToKatakana(text: string): string {
    // ひらがなをカタカナに変換
    return text.replace(/[\u3041-\u3096]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) + 0x60);
    });
  }

  // 都道府県で絞り込み
  searchByPrefecture(prefecture: string): Station[] {
    return this.stationsCache.filter(station => 
      station.prefecture === prefecture
    );
  }

  // 運営会社で絞り込み
  searchByOperator(operator: string): Station[] {
    return this.stationsCache.filter(station => 
      station.operator.includes(operator)
    );
  }

  // 駅IDで取得
  getById(stationId: string): Station | null {
    return this.stationsCache.find(station => station.id === stationId) || null;
  }

  // 複数の駅IDで取得
  getByIds(stationIds: string[]): Station[] {
    return this.stationsCache.filter(station => 
      stationIds.includes(station.id)
    );
  }

  // 指定した座標から指定した距離内の駅を検索
  searchNearbyStations(
    latitude: number, 
    longitude: number, 
    radiusMeters: number = 1000
  ): StationSearchResult[] {
    return this.stationsCache
      .map(station => ({
        station,
        distance: this.calculateDistance(latitude, longitude, station.latitude, station.longitude)
      }))
      .filter(result => result.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  }

  // 2点間の距離を計算（ハバーサイン公式）
  private calculateDistance(
    lat1: number, lon1: number, 
    lat2: number, lon2: number
  ): number {
    const R = 6371000; // 地球の半径（メートル）
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // 2点間の距離を計算（ハバーサイン公式）- 公開メソッド
  calculateDistanceBetween(
    lat1: number, lon1: number, 
    lat2: number, lon2: number
  ): number {
    return this.calculateDistance(lat1, lon1, lat2, lon2);
  }

  // 度をラジアンに変換
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // 徒歩時間から距離フィルターを取得
  getWalkingDistanceFilter(minutes: number): number {
    return minutes * 80; // 80m/分で計算
  }
}

// 図書館と駅の関連付けサービス
export class LibraryStationService {
  private stationService: StationService;

  constructor() {
    this.stationService = new StationService();
  }

  // 指定した駅から徒歩圏内の図書館を検索
  findLibrariesNearStations(
    stationIds: string[], 
    walkingMinutes: number = 5,
    libraries: any[]
  ): any[] {
    const maxDistance = this.stationService.getWalkingDistanceFilter(walkingMinutes);
    const stations = this.stationService.getByIds(stationIds);
    
    if (stations.length === 0) return [];

    return libraries.filter(library => {
      const [libLon, libLat] = library.geocode.split(',').map(Number);
      
      return stations.some(station => {
        const distance = this.calculateDistance(
          station.latitude, station.longitude,
          libLat, libLon
        );
        return distance <= maxDistance;
      });
    }).map(library => {
      // 最寄り駅の情報を追加
      const [libLon, libLat] = library.geocode.split(',').map(Number);
      const nearestStations = stations
        .map(station => ({
          station,
          distance: this.calculateDistance(
            station.latitude, station.longitude,
            libLat, libLon
          )
        }))
        .filter(result => result.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance);

      return {
        ...library,
        nearestStations: nearestStations.map(result => ({
          ...result.station,
          walkingDistance: result.distance,
          walkingTime: Math.ceil(result.distance / 80) // 徒歩分数
        }))
      };
    });
  }

  // 距離計算（ハバーサイン公式）
  private calculateDistance(
    lat1: number, lon1: number, 
    lat2: number, lon2: number
  ): number {
    const R = 6371000; // 地球の半径（メートル）
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // 度をラジアンに変換
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
