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
    Platform 
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// [PLACEHOLDER: Lógica de Escaneo de QR]
// Importa expo-barcode-scanner una vez instalado en tu root:
// npx expo install expo-barcode-scanner
// import { BarCodeScanner } from 'expo-barcode-scanner';

export default function AddEquipmentScreen() {
    // Estados del formulario
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('Nuevo'); // Default status
    const [quantity, setQuantity] = useState('');

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
            
            // Añadir el nuevo documento
            await addDoc(inventoryCollection, {
                nombre: name.trim(),
                categoria: category.trim(),
                estado: status,
                cantidad: parseInt(quantity, 10),
                fechaRegistro: new Date()
            });

            // Mostrar mensaje de éxito
            Alert.alert('Éxito', 'El equipo se ha registrado correctamente en el inventario.');
            
            // Limpiar el formulario luego de guardar exitosamente
            setName('');
            setCategory('');
            setStatus('Nuevo');
            setQuantity('');

        } catch (error) {
            console.error("Error al guardar en Firestore: ", error);
            Alert.alert('Error de conexión', 'Hubo un problema al guardar la información. Intenta de nuevo.');
        }
    };

    // Evento para escanear el QR (Placeholder)
    const handleScanQR = () => {
        /*
          [PLACEHOLDER PARA LÓGICA DE ESCANEO DE CÓDIGO QR]
          Aquí iría la implementación usando expo-barcode-scanner.
          
          Flujo recomendado:
          1. En un useEffect, solicitar el permiso: await BarCodeScanner.requestPermissionsAsync()
          2. Al presionar este botón, mostrar un modal o navegar a pantalla con <BarCodeScanner onBarCodeScanned={handleBarCodeScanned} />
          3. En handleBarCodeScanned({ type, data }), guardar el id o código del QR en el estado para vincularlo al artículo.
        */
        Alert.alert(
            'Escanear Función (Próximamente)', 
            'La funcionalidad de la cámara para escanear y generar códigos QR/Barras se integrará aquí.'
        );
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

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <Text style={styles.headerTitle}>Registro de Equipo</Text>
                <Text style={styles.subtitle}>Añade un nuevo artículo al inventario del grupo Scout.</Text>

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

                {/* Campo: Categoría (Mocking an explicit Dropdown using Text Input for simplicity, can be swapped with react-native-picker) */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Categoría</Text>
                    <TextInput 
                        style={styles.textInput}
                        placeholder="Ej: Campamento, Cocina, Botiquín"
                        value={category}
                        onChangeText={setCategory}
                        placeholderTextColor="#9ca3af"
                    />
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

                {/* Botón QR (Placeholder) */}
                <TouchableOpacity style={styles.qrButton} onPress={handleScanQR}>
                    <Text style={styles.qrButtonText}>📷 Vincular a Código QR</Text>
                </TouchableOpacity>

                {/* Botón Guardar */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Guardar Equipo</Text>
                </TouchableOpacity>

            </ScrollView>
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
    qrButton: {
        backgroundColor: '#e0e7ff', // Indigo claro
        borderWidth: 1,
        borderColor: '#c7d2fe',
        borderStyle: 'dashed', // Estilo distintivo para el QR
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 25,
    },
    qrButtonText: {
        color: '#4338ca',
        fontWeight: '700',
        fontSize: 16,
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
    }
});
