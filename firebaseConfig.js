import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCgoiVMLZAIqvfmvjSWg4o7-oSAt6ds19w",
  authDomain: "scoutcheck-e4534.firebaseapp.com",
  projectId: "scoutcheck-e4534",
  storageBucket: "scoutcheck-e4534.firebasestorage.app",
  messagingSenderId: "590160595313",
  appId: "1:590160595313:web:96ac5645f74ec443d90ed0",
  measurementId: "G-QGX5YNXBZ1"
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar la instancia de Firestore para usarla en los componentes
export const db = getFirestore(app);

// Inicializar y exportar Auth con persistencia para React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
