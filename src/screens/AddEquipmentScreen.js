import React, { useState, useRef } from 'react';
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
import { db, auth } from '../../firebaseConfig';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useA11y } from './A11yContext';
import SelectOption from '../components/SelectOption';
import QRCode from 'react-native-qrcode-svg';

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
    
    // Permisos de Galería
    const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
    const { theme, textScale, isHighContrast } = useA11y();
    const qrRef = useRef();

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
                ownerId: auth.currentUser.uid, // <-- Asigna el dueño del equipo
                disponibilidad: 'Disponible', // Atributo inicial para módulo de préstamos
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
    const handleShareQR = () => {
        if (!qrRef.current) return;
        setIsSharing(true);
        
        qrRef.current.toDataURL(async (data) => {
            try {
                const fileUri = FileSystem.documentDirectory + `QR-${qrCode}.png`;
                
                // Guardar la imagen base64 localmente
                await FileSystem.writeAsStringAsync(fileUri, data, { encoding: FileSystem.EncodingType.Base64 });
                
                Alert.alert(
                    "Código QR Listo",
                    "¿Qué deseas hacer con el código QR generado?",
                    [
                        {
                            text: "Guardar en Galería",
                            onPress: async () => {
                                if (mediaPermission?.status !== 'granted') {
                                    const p = await requestMediaPermission();
                                    if (!p.granted) {
                                        Alert.alert("Permiso denegado", "Necesitamos acceso para guardar la imagen.");
                                        return;
                                    }
                                }
                                await MediaLibrary.saveToLibraryAsync(fileUri);
                                Alert.alert("¡Guardado!", "El código QR se ha guardado en tus fotos.");
                            }
                        },
                        {
                            text: "Compartir...",
                            onPress: async () => {
                                if (await Sharing.isAvailableAsync()) {
                                    await Sharing.shareAsync(fileUri, {
                                        mimeType: 'image/png',
                                        dialogTitle: 'Imprimir/Compartir Código QR',
                                    });
                                } else {
                                    Alert.alert("Error", "El uso compartido no está disponible.");
                                }
                            }
                        },
                        { text: "Cancelar", style: "cancel" }
                    ]
                );
            } catch (error) {
                Alert.alert("Error", "No se pudo preparar el código QR para compartir.");
            } finally {
                setIsSharing(false);
            }
        });
    };

    // Evento al detectar un código
    const handleBarcodeScanned = ({ type, data }) => {
        setQrCode(data);
        setIsScanning(false);
        Alert.alert('Código Vinculado', `Se ha asociado el código exitosamente.`);
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.bg }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <Text style={[styles.headerTitle, { color: theme.textMain, fontSize: 28 * textScale, fontFamily: theme.font }]}>Ingreso a Bodega</Text>
                <Text style={[styles.subtitle, { color: theme.textSub, fontSize: 16 * textScale, fontFamily: theme.font }]}>Añade un nuevo artículo y genérale un código QR.</Text>

                {/* Campo: Nombre del artículo */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.textMain, fontFamily: theme.font }]}>Nombre del artículo</Text>
                    <TextInput 
                        style={[styles.textInput, { backgroundColor: theme.card, color: theme.textMain, borderColor: theme.border, fontFamily: theme.font }]}
                        placeholder="Ej: Tienda de campaña 4 personas"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor={theme.textSub}
                    />
                </View>

                {/* Campo: Categoría - Refactorizado a UI Selector para consistencia en la BD */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.textMain, fontFamily: theme.font }]}>Categoría</Text>
                    <View style={styles.statusRow}>
                        <SelectOption label="Campamento" currentValue={category} onSelect={setCategory} />
                        <SelectOption label="Cocina" currentValue={category} onSelect={setCategory} />
                        <SelectOption label="Botiquín" currentValue={category} onSelect={setCategory} />
                    </View>
                </View>

                {/* Campo: Cantidad */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.textMain, fontFamily: theme.font }]}>Cantidad</Text>
                    <TextInput 
                        style={[styles.textInput, { backgroundColor: theme.card, color: theme.textMain, borderColor: theme.border, fontFamily: theme.font }]}
                        placeholder="Ej: 2"
                        keyboardType="numeric"
                        value={quantity}
                        onChangeText={setQuantity}
                        placeholderTextColor={theme.textSub}
                    />
                </View>

                {/* Campo: Estado */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.textMain, fontFamily: theme.font }]}>Estado del artículo</Text>
                    <View style={styles.statusRow}>
                        <SelectOption label="Nuevo" currentValue={status} onSelect={setStatus} />
                        <SelectOption label="Usado" currentValue={status} onSelect={setStatus} />
                        <SelectOption label="Dañado" currentValue={status} onSelect={setStatus} />
                    </View>
                </View>

                {/* Botón QR */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.textMain, fontFamily: theme.font }]}>Código QR/Barras</Text>
                    {qrCode ? (
                        <View style={[styles.qrResultContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <View style={styles.qrCodeWrapper}>
                                <QRCode
                                    value={qrCode}
                                    size={150}
                                    getRef={(c) => (qrRef.current = c)}
                                />
                            </View>
                            <View style={styles.qrSuccessBox}>
                                <Text style={[styles.qrSuccessText, { color: theme.success, fontFamily: theme.font }]}>✅ Código: {qrCode}</Text>
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
                            <TouchableOpacity style={[styles.qrButton, { backgroundColor: theme.card, borderColor: theme.primary }]} onPress={handleScanQR}>
                                <Text style={styles.qrButtonText}>📷 Escanear Existente</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.generateButton, { backgroundColor: theme.card, borderColor: theme.secondary }]} onPress={handleGenerateQR}>
                                <Text style={styles.generateButtonText}>✨ Generar Nuevo QR</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Botón Guardar */}
                <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.success }]} onPress={handleSave}>
                    <Text style={[styles.saveButtonText, { fontFamily: theme.font }]}>Guardar Equipo</Text>
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
    qrCodeWrapper: {
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
