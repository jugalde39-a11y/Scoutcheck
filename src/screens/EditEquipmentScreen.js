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
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function EditEquipmentScreen({ route, navigation }) {
    // Recibimos el item desde el inventario
    const { item } = route.params;

    // Estados del formulario inicializados con los datos existentes
    const [name, setName] = useState(item.nombre);
    const [category, setCategory] = useState(item.categoria);
    const [status, setStatus] = useState(item.estado);
    const [quantity, setQuantity] = useState(String(item.cantidad));

    const handleUpdate = async () => {
        if (!name.trim() || !category.trim() || !status || !quantity.trim()) {
            Alert.alert('Error', 'Por favor completa todos los campos del formulario.');
            return;
        }

        try {
            const itemRef = doc(db, 'inventario', item.id);
            await updateDoc(itemRef, {
                nombre: name.trim(),
                categoria: category.trim(),
                estado: status,
                cantidad: parseInt(quantity, 10),
                // No modificamos qrCode ni fechaRegistro aquí para mantener la trazabilidad
            });

            Alert.alert('Actualizado', 'El equipo se ha modificado correctamente.');
            navigation.goBack();
        } catch (error) {
            console.error("Error al actualizar: ", error);
            Alert.alert('Error', 'Hubo un problema al actualizar el inventario.');
        }
    };

    const StatusOption = ({ label }) => (
        <TouchableOpacity 
            style={[styles.statusOption, status === label && styles.statusOptionSelected]}
            onPress={() => setStatus(label)}
        >
            <Text style={[styles.statusText, status === label && styles.statusTextSelected]}>{label}</Text>
        </TouchableOpacity>
    );

    const CategoryOption = ({ label }) => (
        <TouchableOpacity 
            style={[styles.statusOption, category === label && styles.statusOptionSelected]}
            onPress={() => setCategory(label)}
        >
            <Text style={[styles.statusText, category === label && styles.statusTextSelected]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <Text style={styles.headerTitle}>Editar Equipo</Text>
                <Text style={styles.subtitle}>Modifica los datos del registro y guarda los cambios.</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre del artículo</Text>
                    <TextInput 
                        style={styles.textInput}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Categoría</Text>
                    <View style={styles.statusRow}>
                        <CategoryOption label="Campamento" />
                        <CategoryOption label="Cocina" />
                        <CategoryOption label="Botiquín" />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Cantidad</Text>
                    <TextInput 
                        style={styles.textInput}
                        keyboardType="numeric"
                        value={quantity}
                        onChangeText={setQuantity}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Estado del artículo</Text>
                    <View style={styles.statusRow}>
                        <StatusOption label="Nuevo" />
                        <StatusOption label="Usado" />
                        <StatusOption label="Dañado" />
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                    <Text style={styles.saveButtonText}>Actualizar Equipo</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    scrollContainer: { padding: 20, paddingBottom: 40 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8, marginTop: 10 },
    subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 30 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 8 },
    textInput: {
        backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb',
        borderRadius: 10, paddingHorizontal: 15, paddingVertical: 14,
        fontSize: 16, color: '#1f2937', shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
    },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    statusOption: {
        flex: 1, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#ffffff',
        paddingVertical: 14, borderRadius: 10, marginHorizontal: 3, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
        shadowRadius: 2, elevation: 1,
    },
    statusOptionSelected: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
    statusText: { color: '#6b7280', fontWeight: '600', fontSize: 14 },
    statusTextSelected: { color: '#ffffff' },
    saveButton: {
        backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 12,
        alignItems: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 6, elevation: 4, marginTop: 10
    },
    saveButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
});