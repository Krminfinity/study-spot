// Firebaseの設定
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // 実際のプロジェクトでは環境変数を使用
  apiKey: "demo-key",
  authDomain: "studyspot-mvp.firebaseapp.com",
  projectId: "studyspot-mvp", 
  storageBucket: "studyspot-mvp.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// サービスのエクスポート
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
