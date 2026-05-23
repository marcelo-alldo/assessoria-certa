import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDPQu3DX8TZ2DsU13qzvuvuKF9xAa5gtME',
  authDomain: 'alldo-assistente.firebaseapp.com',
  projectId: 'alldo-assistente',
  storageBucket: 'alldo-assistente.firebasestorage.app',
  messagingSenderId: '1078050170904',
  appId: '1:1078050170904:web:e9aef190187fb5a2733b6d',
  measurementId: 'G-E70SD9BENS',
};

// Garante que só inicializa uma vez
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
