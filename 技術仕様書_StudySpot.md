# StudySpot - 技術仕様書

## 1. システム構成

### 1.1 アーキテクチャ概要
```
[フロントエンド]
├── iOS App (React Native)
├── Android App (React Native)
└── Web App (Next.js)
    ↓
[API Gateway] (AWS API Gateway)
    ↓
[バックエンドサービス]
├── User Service (Node.js + Express)
├── Location Service (Node.js + Express)
├── Booking Service (Node.js + Express)
├── Review Service (Node.js + Express)
├── Notification Service (Node.js + Express)
└── AI Service (Python + FastAPI)
    ↓
[データベース]
├── PostgreSQL (ユーザー・予約・レビューデータ)
├── Redis (キャッシュ・セッション)
└── Elasticsearch (検索・ログ)
    ↓
[外部サービス]
├── Google Maps API
├── Firebase (認証・プッシュ通知)
├── Stripe (決済)
└── AWS S3 (画像・ファイル保存)
```

## 2. データベース設計

### 2.1 主要テーブル構成

#### Users（ユーザー）
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    birth_date DATE,
    school_name VARCHAR(255),
    grade INTEGER,
    phone_number VARCHAR(20),
    avatar_url VARCHAR(500),
    study_goals TEXT[],
    preferences JSONB,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Locations（学習場所）
```sql
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'library', 'cafe', 'coworking', etc.
    is_free BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10, 2),
    daily_rate DECIMAL(10, 2),
    opening_hours JSONB, -- {"monday": "09:00-21:00", ...}
    facilities JSONB, -- {"wifi": true, "power": true, "silent": true, ...}
    capacity INTEGER,
    images VARCHAR(500)[],
    contact_info JSONB,
    owner_id INTEGER REFERENCES users(id),
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'pending'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 位置情報検索用のインデックス
CREATE INDEX idx_locations_coordinates ON locations USING GIST (ll_to_earth(latitude, longitude));
```

#### Real_Time_Status（リアルタイム状況）
```sql
CREATE TABLE real_time_status (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id),
    current_occupancy INTEGER NOT NULL,
    noise_level INTEGER, -- 1-10 scale
    temperature DECIMAL(4, 2),
    humidity DECIMAL(5, 2),
    wifi_speed DECIMAL(8, 2), -- Mbps
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reported_by INTEGER REFERENCES users(id)
);
```

#### Bookings（予約）
```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    location_id INTEGER REFERENCES locations(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    seat_number VARCHAR(20),
    total_amount DECIMAL(10, 2),
    payment_status VARCHAR(50) DEFAULT 'pending',
    booking_status VARCHAR(50) DEFAULT 'confirmed',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Reviews（レビュー）
```sql
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    location_id INTEGER REFERENCES locations(id),
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    quietness_rating INTEGER CHECK (quietness_rating >= 1 AND quietness_rating <= 5),
    wifi_rating INTEGER CHECK (wifi_rating >= 1 AND wifi_rating <= 5),
    comfort_rating INTEGER CHECK (comfort_rating >= 1 AND comfort_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    comment TEXT,
    images VARCHAR(500)[],
    tags VARCHAR(100)[],
    visit_date DATE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Study_Sessions（学習セッション）
```sql
CREATE TABLE study_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    location_id INTEGER REFERENCES locations(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    subject VARCHAR(255),
    productivity_rating INTEGER CHECK (productivity_rating >= 1 AND productivity_rating <= 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 3. API設計

### 3.1 認証・ユーザー管理
```
POST   /api/v1/auth/register        - ユーザー登録
POST   /api/v1/auth/login           - ログイン
POST   /api/v1/auth/logout          - ログアウト
POST   /api/v1/auth/refresh         - トークン更新
GET    /api/v1/users/profile        - プロフィール取得
PUT    /api/v1/users/profile        - プロフィール更新
POST   /api/v1/users/upload-avatar  - アバター画像アップロード
```

### 3.2 場所検索・管理
```
GET    /api/v1/locations/search     - 場所検索
GET    /api/v1/locations/:id        - 場所詳細取得
POST   /api/v1/locations            - 場所登録
PUT    /api/v1/locations/:id        - 場所情報更新
DELETE /api/v1/locations/:id        - 場所削除
GET    /api/v1/locations/:id/status - リアルタイム状況取得
POST   /api/v1/locations/:id/status - 状況報告
```

### 3.3 予約管理
```
GET    /api/v1/bookings             - 予約一覧取得
POST   /api/v1/bookings             - 予約作成
GET    /api/v1/bookings/:id         - 予約詳細取得
PUT    /api/v1/bookings/:id         - 予約変更
DELETE /api/v1/bookings/:id         - 予約キャンセル
GET    /api/v1/locations/:id/availability - 空き状況確認
```

### 3.4 レビュー・評価
```
GET    /api/v1/locations/:id/reviews - レビュー一覧取得
POST   /api/v1/reviews               - レビュー投稿
PUT    /api/v1/reviews/:id           - レビュー更新
DELETE /api/v1/reviews/:id           - レビュー削除
POST   /api/v1/reviews/:id/helpful   - 役立つボタン
```

### 3.5 AI・推薦
```
GET    /api/v1/recommendations      - おすすめ場所取得
GET    /api/v1/predictions/crowding - 混雑予測
POST   /api/v1/ai/preferences       - 学習設定の最適化
GET    /api/v1/analytics/personal   - 個人学習分析
```

## 4. フロントエンド設計

### 4.1 React Native アプリ構成
```
src/
├── components/           # 共通コンポーネント
│   ├── common/
│   ├── forms/
│   └── maps/
├── screens/             # 画面コンポーネント
│   ├── auth/
│   ├── search/
│   ├── booking/
│   ├── profile/
│   └── reviews/
├── navigation/          # ナビゲーション設定
├── services/           # API通信
├── store/              # 状態管理（Redux Toolkit）
├── utils/              # ユーティリティ
└── constants/          # 定数定義
```

### 4.2 主要画面設計

#### 検索画面
- 地図表示（Google Maps）
- フィルター機能（距離、料金、設備等）
- リスト/マップ切り替え
- リアルタイム混雑表示

#### 場所詳細画面
- 写真ギャラリー
- 基本情報（営業時間、料金、設備）
- リアルタイム状況
- レビュー表示
- 予約ボタン

#### 予約画面
- カレンダー選択
- 時間選択
- 席タイプ選択
- 決済フロー

## 5. セキュリティ設計

### 5.1 認証・認可
- JWT（JSON Web Token）による認証
- リフレッシュトークンローテーション
- OAuth 2.0（Google, Apple, LINE）対応
- 多要素認証（SMS、アプリ）

### 5.2 データ保護
- パスワードハッシュ化（bcrypt）
- 個人情報暗号化（AES-256）
- HTTPS通信強制
- SQL インジェクション対策

### 5.3 位置情報保護
- 正確な位置情報の匿名化
- 位置履歴の自動削除
- ユーザー同意に基づく収集

## 6. パフォーマンス設計

### 6.1 キャッシュ戦略
- Redis によるセッション管理
- CDN（CloudFront）による画像配信
- API レスポンスキャッシュ
- 地図データのローカルキャッシュ

### 6.2 データベース最適化
- インデックス設計
- パーティショニング（日付別）
- 読み書き分離
- コネクションプーリング

### 6.3 スケーラビリティ
- マイクロサービス分割
- Auto Scaling設定
- Load Balancer配置
- 非同期処理（Queue）

## 7. 監視・ログ設計

### 7.1 監視項目
- API レスポンス時間
- エラー率
- データベース性能
- インフラリソース使用状況

### 7.2 ログ管理
- 構造化ログ（JSON形式）
- ログレベル分離
- セキュリティログ
- パフォーマンスログ

### 7.3 ツール
- Application監視: New Relic
- インフラ監視: CloudWatch
- ログ分析: Elasticsearch + Kibana
- エラー追跡: Sentry

## 8. CI/CD・デプロイ

### 8.1 開発フロー
```
開発 → テスト → ステージング → 本番
   ↓      ↓        ↓         ↓
 GitHub → CI      → AWS      → AWS
         (Actions)  (ECS)     (ECS)
```

### 8.2 テスト戦略
- 単体テスト（Jest）
- 統合テスト（Supertest）
- E2Eテスト（Detox）
- 性能テスト（Artillery）

### 8.3 デプロイメント
- Blue-Green デプロイメント
- カナリアリリース
- 自動ロールバック機能
- ゼロダウンタイム更新

## 9. 開発スケジュール

### Phase 1（3ヶ月）
- Week 1-2: 環境構築・基盤設計
- Week 3-6: 認証・ユーザー管理機能
- Week 7-10: 基本検索・地図機能
- Week 11-12: レビュー機能・MVP完成

### Phase 2（3ヶ月）
- Week 13-16: リアルタイム機能
- Week 17-20: 予約・決済機能
- Week 21-24: AI推薦エンジン

### Phase 3（6ヶ月）
- Month 7-8: 高度なAI機能
- Month 9-10: 管理者機能
- Month 11-12: 運営ツール・分析機能

## 10. 運用・保守

### 10.1 定期メンテナンス
- データベースバックアップ（日次）
- セキュリティアップデート（月次）
- 性能チューニング（四半期）

### 10.2 障害対応
- 24時間監視体制
- 自動復旧システム
- エスカレーション手順
- 障害報告書作成

### 10.3 データ管理
- 個人情報保護方針の遵守
- データ保存期間の管理
- GDPR対応（削除権等）
- 定期的なデータクリーニング
