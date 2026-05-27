import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function ScanToSearchScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanned, setScanned] = useState(false);

    if (!permission) {
        return <View style={styles.container}><ActivityIndicator size="large" color="#10b981" /></View>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.text}>Necesitamos tu permiso para usar la cámara</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Otorgar Permiso</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarcodeScanned = async ({ type, data }) => {
        if (scanned || isProcessing) return;
        setScanned(true);
        setIsProcessing(true);

        try {
            const inventoryRef = collection(db, 'inventario');
            const q = query(inventoryRef, where("qrCode", "==", data));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const itemDoc = querySnapshot.docs[0];
                const itemData = itemDoc.data();
                
                // En lugar de una simple alerta, redirigimos a la Ficha Técnica para gestionar todo desde allí
                navigation.replace('ItemDetail', { itemId: itemDoc.id, itemData: itemData });
            } else {
                Alert.alert(
                    "❌ No Encontrado",
                    "Este código no está vinculado a ningún artículo en tu inventario.",
                    [
                        { text: "Reintentar", onPress: () => { setScanned(false); setIsProcessing(false); } },
                        { text: "Añadir Nuevo", onPress: () => navigation.replace('AddEquipment') }
                    ]
                );
            }
        } catch (error) {
            console.error("Error buscando QR:", error);
            Alert.alert("Error", "Hubo un problema al consultar la base de datos.");
            setScanned(false);
            setIsProcessing(false);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "ean8", "pdf417", "code128"] }}
            />
            <View style={styles.overlay}>
                <Text style={styles.instructionText}>Apunta a un código para ver sus detalles</Text>
                {isProcessing && <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />}
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>Cancelar Búsqueda</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    text: { color: '#333', fontSize: 16, marginBottom: 20, textAlign: 'center' },
    button: { backgroundColor: '#10b981', padding: 15, borderRadius: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 40, justifyContent: 'center' },
    instructionText: { color: '#fff', fontSize: 18, textAlign: 'center', fontWeight: 'bold', marginTop: 40 },
    cancelButton: { backgroundColor: '#ef4444', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
    cancelText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});