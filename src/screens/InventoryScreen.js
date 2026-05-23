import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TextInput, 
    StyleSheet, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { obtenerDatosUsuario } from '../services/authService';

export default function InventoryScreen({ navigation }) {
    const [equipment, setEquipment] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        // Obtener el perfil del usuario actual
        const fetchProfile = async () => {
            if (auth.currentUser) {
                try {
                    const data = await obtenerDatosUsuario(auth.currentUser.uid);
                    if (data) setUserProfile(data.perfil);
                } catch (error) {
                    console.error("Error obteniendo perfil en inventario:", error);
                }
            }
        };
        fetchProfile();

        // Referencia a la colección 'inventario'
        const inventoryRef = collection(db, 'inventario');
        
        // Suscribirse a los cambios en tiempo real
        const unsubscribe = onSnapshot(inventoryRef, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEquipment(items);
            setLoading(false);
        }, (error) => {
            console.error("Error al obtener inventario:", error);
            Alert.alert("Error", "Hubo un problema al cargar el inventario.");
            setLoading(false);
        });

        // Limpiar suscripción al desmontar
        return () => unsubscribe();
    }, []);

    const handleDelete = (id) => {
        if (userProfile !== 'Dirigente' && userProfile !== 'Bodeguero') {
            Alert.alert("Acceso Denegado", "Solo los Bodegueros o Dirigentes pueden eliminar equipos.");
            return;
        }

        Alert.alert(
            "Eliminar Equipo",
            "¿Estás seguro de que deseas eliminar este artículo de forma permanente?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'inventario', id));
                        } catch (error) {
                            console.error("Error al eliminar:", error);
                            Alert.alert("Error", "No se pudo eliminar el artículo.");
                        }
                    }
                }
            ]
        );
    };

    // Filtrar equipos por nombre o categoría
    const filteredEquipment = equipment.filter(item => 
        item.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.categoria?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.itemName}>{item.nombre}</Text>
                <Text style={styles.itemDetail}>Categoría: {item.categoria}</Text>
                <Text style={styles.itemDetail}>Cantidad: {item.cantidad}</Text>
                <Text style={styles.itemDetail}>Estado: {item.estado}</Text>
                {item.qrCode && <Text style={styles.itemQr}>QR Vinculado: {item.qrCode}</Text>}
            </View>
            {(userProfile === 'Dirigente' || userProfile === 'Bodeguero') && (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditEquipment', { item })}>
                        <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                        <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.headerTitle}>Bodega Scout</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre o categoria de equipo"
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                
                {loading ? (
                    <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={filteredEquipment}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={<Text style={styles.emptyText}>No hay equipos que coincidan con la búsqueda.</Text>}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    innerContainer: { flex: 1, padding: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 16, marginTop: 10 },
    searchInput: {
        backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb',
        borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12,
        fontSize: 16, color: '#1f2937', marginBottom: 16,
    },
    listContainer: { paddingBottom: 40 },
    card: {
        backgroundColor: '#ffffff', borderRadius: 12, padding: 16,
        marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
    },
    cardContent: { flex: 1, marginRight: 10 },
    itemName: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
    itemDetail: { fontSize: 14, color: '#4b5563', marginBottom: 2 },
    itemQr: { fontSize: 12, color: '#6366f1', marginTop: 4, fontWeight: '600' },
    actionsContainer: { alignItems: 'flex-end', justifyContent: 'space-between', height: 70 },
    editButton: { backgroundColor: '#e0e7ff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 8, width: 75, alignItems: 'center' },
    editButtonText: { color: '#4338ca', fontWeight: '600', fontSize: 14 },
    deleteButton: { backgroundColor: '#fee2e2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, width: 75, alignItems: 'center' },
    deleteButtonText: { color: '#ef4444', fontWeight: '600', fontSize: 14 },
    emptyText: { textAlign: 'center', color: '#6b7280', fontSize: 16, marginTop: 40 }
});