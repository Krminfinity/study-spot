// 駅情報サービス
export interface Station {
  id: string;
  name: string;
  prefecture: string;
  line: string;
  latitude: number;
  longitude: number;
  operator: string; // 運営会社
}

export interface StationSearchResult {
  station: Station;
  distance: number; // メートル
}

// 主要駅のサンプルデータ（神奈川県周辺）
const SAMPLE_STATIONS: Station[] = [
  // 横浜エリア
  { id: 'yokohama', name: '横浜', prefecture: '神奈川県', line: 'JR東海道本線', latitude: 35.4657, longitude: 139.6224, operator: 'JR東日本' },
  { id: 'shimbashi', name: '新橋', prefecture: '東京都', line: 'JR東海道本線', latitude: 35.6659, longitude: 139.7589, operator: 'JR東日本' },
  { id: 'shinagawa', name: '品川', prefecture: '東京都', line: 'JR東海道本線', latitude: 35.6284, longitude: 139.7387, operator: 'JR東日本' },
  { id: 'kawasaki', name: '川崎', prefecture: '神奈川県', line: 'JR東海道本線', latitude: 35.5308, longitude: 139.6979, operator: 'JR東日本' },
  { id: 'tsurumi', name: '鶴見', prefecture: '神奈川県', line: 'JR東海道本線', latitude: 35.5070, longitude: 139.6764, operator: 'JR東日本' },
  
  // 小田急線
  { id: 'shinjuku', name: '新宿', prefecture: '東京都', line: '小田急小田原線', latitude: 35.6896, longitude: 139.7006, operator: '小田急電鉄' },
  { id: 'machida', name: '町田', prefecture: '東京都', line: '小田急小田原線', latitude: 35.5424, longitude: 139.4267, operator: '小田急電鉄' },
  { id: 'sagamiono', name: '相模大野', prefecture: '神奈川県', line: '小田急小田原線', latitude: 35.5295, longitude: 139.4442, operator: '小田急電鉄' },
  { id: 'fujisawa', name: '藤沢', prefecture: '神奈川県', line: '小田急江ノ島線', latitude: 35.3409, longitude: 139.4839, operator: '小田急電鉄' },
  
  // 東急線
  { id: 'shibuya', name: '渋谷', prefecture: '東京都', line: '東急東横線', latitude: 35.6580, longitude: 139.7016, operator: '東急電鉄' },
  { id: 'jiyugaoka', name: '自由が丘', prefecture: '東京都', line: '東急東横線', latitude: 35.6084, longitude: 139.6686, operator: '東急電鉄' },
  { id: 'musashikosugi', name: '武蔵小杉', prefecture: '神奈川県', line: '東急東横線', latitude: 35.5781, longitude: 139.6565, operator: '東急電鉄' },
  { id: 'kikuna', name: '菊名', prefecture: '神奈川県', line: '東急東横線', latitude: 35.5037, longitude: 139.6344, operator: '東急電鉄' },
  
  // 京急線
  { id: 'keikyu-kamata', name: '京急蒲田', prefecture: '東京都', line: '京急本線', latitude: 35.5616, longitude: 139.7164, operator: '京急電鉄' },
  { id: 'kanazawa-bunko', name: '金沢文庫', prefecture: '神奈川県', line: '京急本線', latitude: 35.3425, longitude: 139.6188, operator: '京急電鉄' },
  { id: 'kanazawa-hakkei', name: '金沢八景', prefecture: '神奈川県', line: '京急本線', latitude: 35.3388, longitude: 139.6308, operator: '京急電鉄' },
  
  // 相鉄線
  { id: 'nippori', name: '日暮里', prefecture: '東京都', line: 'JR山手線', latitude: 35.7278, longitude: 139.7706, operator: 'JR東日本' },
  { id: 'yokohama-sotetsu', name: '横浜', prefecture: '神奈川県', line: '相鉄本線', latitude: 35.4657, longitude: 139.6224, operator: '相模鉄道' },
  { id: 'nishiya', name: '西谷', prefecture: '神奈川県', line: '相鉄本線', latitude: 35.4776, longitude: 139.5915, operator: '相模鉄道' },
  
  // JR横須賀線・東海道線
  { id: 'totsuka', name: '戸塚', prefecture: '神奈川県', line: 'JR東海道本線', latitude: 35.3998, longitude: 139.5340, operator: 'JR東日本' },
  { id: 'ofuna', name: '大船', prefecture: '神奈川県', line: 'JR東海道本線', latitude: 35.3534, longitude: 139.5328, operator: 'JR東日本' },
  { id: 'kamakura', name: '鎌倉', prefecture: '神奈川県', line: 'JR横須賀線', latitude: 35.3192, longitude: 139.5502, operator: 'JR東日本' },
  { id: 'zushi', name: '逗子', prefecture: '神奈川県', line: 'JR横須賀線', latitude: 35.2947, longitude: 139.5784, operator: 'JR東日本' },
  { id: 'yokosuka', name: '横須賀', prefecture: '神奈川県', line: 'JR横須賀線', latitude: 35.2806, longitude: 139.6725, operator: 'JR東日本' },
  
  // 小田原・湘南エリア
  { id: 'odawara', name: '小田原', prefecture: '神奈川県', line: 'JR東海道本線', latitude: 35.2560, longitude: 139.1566, operator: 'JR東日本' },
  { id: 'hiratsuka', name: '平塚', prefecture: '神奈川県', line: 'JR東海道本線', latitude: 35.3276, longitude: 139.3473, operator: 'JR東日本' },
  { id: 'chigasaki', name: '茅ヶ崎', prefecture: '神奈川県', line: 'JR東海道本線', latitude: 35.3347, longitude: 139.4041, operator: 'JR東日本' },
  
  // 横浜市営地下鉄
  { id: 'center-kita', name: 'センター北', prefecture: '神奈川県', line: '横浜市営地下鉄ブルーライン', latitude: 35.5541, longitude: 139.5738, operator: '横浜市交通局' },
  { id: 'center-minami', name: 'センター南', prefecture: '神奈川県', line: '横浜市営地下鉄ブルーライン', latitude: 35.5485, longitude: 139.5674, operator: '横浜市交通局' },
  { id: 'azamino', name: 'あざみ野', prefecture: '神奈川県', line: '横浜市営地下鉄ブルーライン', latitude: 35.5627, longitude: 139.5539, operator: '横浜市交通局' },
];

export class StationService {
  // 駅名で検索（部分一致）
  searchByName(query: string): Station[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];
    
    return SAMPLE_STATIONS.filter(station => 
      station.name.toLowerCase().includes(normalizedQuery) ||
      station.name.includes(query)
    );
  }

  // 都道府県で絞り込み
  searchByPrefecture(prefecture: string): Station[] {
    return SAMPLE_STATIONS.filter(station => 
      station.prefecture === prefecture
    );
  }

  // 運営会社で絞り込み
  searchByOperator(operator: string): Station[] {
    return SAMPLE_STATIONS.filter(station => 
      station.operator.includes(operator)
    );
  }

  // 駅IDで取得
  getById(stationId: string): Station | null {
    return SAMPLE_STATIONS.find(station => station.id === stationId) || null;
  }

  // 複数の駅IDで取得
  getByIds(stationIds: string[]): Station[] {
    return SAMPLE_STATIONS.filter(station => 
      stationIds.includes(station.id)
    );
  }

  // 指定した座標から指定した距離内の駅を検索
  searchNearbyStations(
    latitude: number, 
    longitude: number, 
    radiusMeters: number = 1000
  ): StationSearchResult[] {
    return SAMPLE_STATIONS
      .map(station => ({
        station,
        distance: this.calculateDistance(latitude, longitude, station.latitude, station.longitude)
      }))
      .filter(result => result.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  }

  // 2点間の距離を計算（ハバーサイン公式）- 公開メソッド
  calculateDistanceBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
    return this.calculateDistance(lat1, lon1, lat2, lon2);
  }

  // 2点間の距離を計算（ハバーサイン公式）
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // 地球の半径（メートル）
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // 駅から徒歩圏内の図書館を検索するためのヘルパー
  getWalkingDistanceFilter(maxWalkingMinutes: number = 5): number {
    // 徒歩1分 = 約80メートル で計算
    return maxWalkingMinutes * 80;
  }

  // 駅の候補をグループ化（路線別）
  getStationsByLine(): { [line: string]: Station[] } {
    const stationsByLine: { [line: string]: Station[] } = {};
    
    SAMPLE_STATIONS.forEach(station => {
      if (!stationsByLine[station.line]) {
        stationsByLine[station.line] = [];
      }
      stationsByLine[station.line].push(station);
    });
    
    return stationsByLine;
  }

  // 人気の駅トップ10（利用頻度の高い駅）
  getPopularStations(): Station[] {
    const popularStationIds = [
      'yokohama', 'shinjuku', 'shibuya', 'kawasaki', 'fujisawa',
      'machida', 'musashikosugi', 'ofuna', 'totsuka', 'odawara'
    ];
    
    return this.getByIds(popularStationIds);
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

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
