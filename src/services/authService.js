import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    sendPasswordResetEmail
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

/**
 * Registra un nuevo usuario en Firebase Auth y crea su documento en Firestore.
 * @param {string} email 
 * @param {string} password 
 * @param {string} nombre 
 * @param {string} perfil Ej: "Dirigente", "Rover", "Tropa"
 */
export const registrarUsuario = async (email, password, nombre, perfil) => {
    try {
        // 1. Crear usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Crear el documento del usuario en Firestore
        const userDocRef = doc(db, 'usuarios', user.uid);
        
        const userData = {
            nombre: nombre,
            perfil: perfil,
            email: email,
            fotoUrl: "", // Por defecto vacío
            fechaRegistro: serverTimestamp()
        };

        await setDoc(userDocRef, userData);
        
        return { user, userData };
    } catch (error) {
        console.error("Error en registrarUsuario:", error);
        throw error; // Lanzamos el error para manejarlo en la UI
    }
};

/**
 * Inicia sesión con correo y contraseña.
 * @param {string} email 
 * @param {string} password 
 */
export const loginUsuario = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error en loginUsuario:", error);
        throw error;
    }
};

/**
 * Envía un correo de recuperación de contraseña.
 * @param {string} email 
 */
export const recuperarPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Error en recuperarPassword:", error);
        throw error;
    }
};

/**
 * Obtiene los datos del perfil de un usuario desde Firestore.
 * @param {string} uid El ID del usuario
 */
export const obtenerDatosUsuario = async (uid) => {
    try {
        const userDocRef = doc(db, 'usuarios', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            console.log("No se encontró el documento del usuario!");
            return null;
        }
    } catch (error) {
        console.error("Error en obtenerDatosUsuario:", error);
        throw error;
    }
};

/**
 * Cierra la sesión activa.
 */
export const cerrarSesion = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error en cerrarSesion:", error);
        throw error;
    }
};
