import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    TouchableOpacity, 
    Alert, 
    KeyboardAvoidingView, 
    ScrollView, 
    Platform,
    Modal,
    Image,
    ActivityIndicator
} from 'react-native';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function AddEquipmentScreen() {
    // Estados del formulario
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Campamento'); // Default category
    const [status, setStatus] = useState('Nuevo'); // Default status
    const [quantity, setQuantity] = useState('');
    
    // Estados para la cámara
    const [permission, requestPermission] = useCameraPermissions();
    const [isScanning, setIsScanning] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    // Función principal para guardar los datos en Firestore
    const handleSave = async () => {
        // Validación básica de campos requeridos
        if (!name.trim() || !category.trim() || !status || !quantity.trim()) {
            Alert.alert('Error', 'Por favor completa todos los campos del formulario.');
            return;
        }

        try {
            // Referencia a la colección 'inventario' en la BD
            const inventoryCollection = collection(db, 'inventario');

            // Validar si el código QR ya está registrado en la base de datos
            if (qrCode) {
                const q = query(inventoryCollection, where("qrCode", "==", qrCode));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    Alert.alert(
                        'Código Duplicado', 
                        'Este código QR ya está asignado a otro equipo en el inventario. Por favor, remuévelo o escanea uno diferente.'
                    );
                    return; // Detenemos la ejecución para no guardar duplicados
                }
            }
            
            // Añadir el nuevo documento
            await addDoc(inventoryCollection, {
                nombre: name.trim(),
                categoria: category.trim(),
                estado: status,
                cantidad: parseInt(quantity, 10),
                qrCode: qrCode, // Guarda el código escaneado (si lo hay)
                fechaRegistro: new Date()
            });

            // Mostrar mensaje de éxito
            Alert.alert('Éxito', 'El equipo se ha registrado correctamente en el inventario.');
            
            // Limpiar el formulario luego de guardar exitosamente
            setName('');
            setCategory('');
            setStatus('Nuevo');
            setQuantity('');
            setQrCode('');

        } catch (error) {
            console.error("Error al guardar en Firestore: ", error);
            Alert.alert('Error de conexión', 'Hubo un problema al guardar la información. Intenta de nuevo.');
        }
    };

    // Evento para abrir el escáner QR
    const handleScanQR = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para poder escanear el QR.');
                return;
            }
        }
        setIsScanning(true);
    };

    // Generar un código QR único y automático para nuevos artículos en bodega
    const handleGenerateQR = () => {
        const uniqueCode = `BODEGA-${Date.now()}`;
        setQrCode(uniqueCode);
    };

    // Descargar y compartir el QR
    const handleShareQR = async () => {
        try {
            setIsSharing(true);
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${qrCode}`;
            const fileUri = FileSystem.documentDirectory + `QR-${qrCode}.png`;
            
            // Descargar imagen temporal
            const { uri } = await FileSystem.downloadAsync(qrUrl, fileUri);
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'image/png',
                    dialogTitle: 'Imprimir/Compartir Código QR',
                });
            } else {
                Alert.alert("Error", "El uso compartido no está disponible en este dispositivo.");
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo preparar el código QR para compartir.");
        } finally {
            setIsSharing(false);
        }
    };

    // Evento al detectar un código
    const handleBarcodeScanned = ({ type, data }) => {
        setQrCode(data);
        setIsScanning(false);
        Alert.alert('Código Vinculado', `Se ha asociado el código exitosamente.`);
    };

    // Componente auxiliar para elegir el estado (Nuevo, Usado, Dañado) como botones (Clean UI)
    const StatusOption = ({ label }) => {
        const isSelected = status === label;
        return (
            <TouchableOpacity 
                style={[styles.statusOption, isSelected && styles.statusOptionSelected]}
                onPress={() => setStatus(label)}
            >
                <Text style={[styles.statusText, isSelected && styles.statusTextSelected]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    // Componente auxiliar para elegir Categoría reciclando los mismos estilos (DRY principle)
    const CategoryOption = ({ label }) => {
        const isSelected = category === label;
        return (
            <TouchableOpacity 
                style={[styles.statusOption, isSelected && styles.statusOptionSelected]}
                onPress={() => setCategory(label)}
            >
                <Text style={[styles.statusText, isSelected && styles.statusTextSelected]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <Text style={styles.headerTitle}>Ingreso a Bodega</Text>
                <Text style={styles.subtitle}>Añade un nuevo artículo y genérale un código QR.</Text>

                {/* Campo: Nombre del artículo */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre del artículo</Text>
                    <TextInput 
                        style={styles.textInput}
                        placeholder="Ej: Tienda de campaña 4 personas"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* Campo: Categoría - Refactorizado a UI Selector para consistencia en la BD */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Categoría</Text>
                    <View style={styles.statusRow}>
                        <CategoryOption label="Campamento" />
                        <CategoryOption label="Cocina" />
                        <CategoryOption label="Botiquín" />
                    </View>
                </View>

                {/* Campo: Cantidad */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Cantidad</Text>
                    <TextInput 
                        style={styles.textInput}
                        placeholder="Ej: 2"
                        keyboardType="numeric"
                        value={quantity}
                        onChangeText={setQuantity}
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* Campo: Estado */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Estado del artículo</Text>
                    <View style={styles.statusRow}>
                        <StatusOption label="Nuevo" />
                        <StatusOption label="Usado" />
                        <StatusOption label="Dañado" />
                    </View>
                </View>

                {/* Botón QR */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Código QR/Barras</Text>
                    {qrCode ? (
                        <View style={styles.qrResultContainer}>
                            <Image 
                                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrCode}` }} 
                                style={styles.qrImage} 
                            />
                            <View style={styles.qrSuccessBox}>
                                <Text style={styles.qrSuccessText}>✅ Código: {qrCode}</Text>
                                <TouchableOpacity onPress={() => setQrCode('')}><Text style={styles.clearQrText}>Quitar</Text></TouchableOpacity>
                            </View>
                            <View style={styles.qrSuccessBoxShare}>
                                <TouchableOpacity style={styles.shareButton} onPress={handleShareQR} disabled={isSharing}>
                                    {isSharing ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.shareButtonText}>📤 Compartir / Imprimir</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.qrActionButtons}>
                            <TouchableOpacity style={styles.qrButton} onPress={handleScanQR}>
                                <Text style={styles.qrButtonText}>📷 Escanear Existente</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.generateButton} onPress={handleGenerateQR}>
                                <Text style={styles.generateButtonText}>✨ Generar Nuevo QR</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Botón Guardar */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Guardar Equipo</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Modal para la Cámara */}
            <Modal visible={isScanning} animationType="slide" transparent={false}>
                <View style={styles.cameraContainer}>
                    {isScanning && (
                        <CameraView
                            style={StyleSheet.absoluteFillObject}
                            facing="back"
                            onBarcodeScanned={handleBarcodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr", "ean13", "ean8", "pdf417", "code128"],
                            }}
                        />
                    )}
                    <View style={styles.cameraOverlay}>
                        <Text style={styles.cameraText}>Apunta al código QR o de barras</Text>
                        <TouchableOpacity style={styles.cancelScanButton} onPress={() => setIsScanning(false)}>
                            <Text style={styles.cancelScanText}>Cancelar Escaneo</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb', // Fondo muy suave y limpio
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        marginTop: 20, // Espacio superior en caso de que no haya un header nativo
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1f2937',
        // Sombras sutiles
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    statusOption: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
        paddingVertical: 14,
        borderRadius: 10,
        marginHorizontal: 3,
        alignItems: 'center',
         // Sombras sutiles
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statusOptionSelected: {
        backgroundColor: '#6366f1', // Tono indigo muy Scout/Tech
        borderColor: '#6366f1',
    },
    statusText: {
        color: '#6b7280',
        fontWeight: '600',
        fontSize: 14,
    },
    statusTextSelected: {
        color: '#ffffff',
    },
    qrActionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    qrButton: {
        flex: 1,
        backgroundColor: '#e0e7ff', // Indigo claro
        borderWidth: 1,
        borderColor: '#c7d2fe',
        borderStyle: 'dashed', // Estilo distintivo para el QR
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginRight: 6,
    },
    generateButton: {
        flex: 1,
        backgroundColor: '#f3e8ff', // Purpura claro
        borderWidth: 1,
        borderColor: '#e9d5ff',
        borderStyle: 'dashed',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginLeft: 6,
    },
    generateButtonText: {
        color: '#7e22ce',
        fontWeight: '700',
        fontSize: 14,
    },
    qrButtonText: {
        color: '#4338ca',
        fontWeight: '700',
        fontSize: 14,
    },
    qrResultContainer: {
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    qrImage: {
        width: 150,
        height: 150,
        marginBottom: 16,
    },
    qrSuccessBox: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', width: '100%'
    },
    qrSuccessText: { color: '#065f46', fontWeight: '600', fontSize: 14, flex: 1 },
    clearQrText: { color: '#ef4444', fontWeight: 'bold' },
    qrSuccessBoxShare: {
        width: '100%',
        marginTop: 12,
    },
    shareButton: {
        backgroundColor: '#4338ca',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    shareButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#10b981', // Verde acción principal
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Estilos de la cámara
    cameraContainer: { flex: 1, backgroundColor: '#000' },
    cameraOverlay: {
        flex: 1, justifyContent: 'space-between', padding: 40,
        backgroundColor: 'rgba(0,0,0,0.4)', // Oscurecer los bordes
    },
    cameraText: { color: '#fff', fontSize: 18, textAlign: 'center', fontWeight: 'bold', marginTop: 40 },
    cancelScanButton: { backgroundColor: '#ef4444', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
    cancelScanText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
