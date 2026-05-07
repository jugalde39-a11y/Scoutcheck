import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Reemplazar con las credenciales reales de tu proyecto "ScoutCheck" en Firebase.
// Estas credenciales las encuentras en la consola de Firebase: 
// Configuración del proyecto > General > Mis apps (sección web/app).
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar la instancia de Firestore para usarla en los componentes
export const db = getFirestore(app);
