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
import { collection, onSnapshot, deleteDoc, doc, query, where, limit } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { obtenerDatosUsuario } from '../services/authService';
import { useA11y } from './A11yContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function InventoryScreen({ navigation }) {
    const [equipment, setEquipment] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [itemLimit, setItemLimit] = useState(20); // Paginación: Inicializa con 20 items
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    // Consumiendo el estado global de accesibilidad
    const { theme, textScale, isHighContrast } = useA11y();

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

        // Referencia a la colección 'inventario' filtrada por el usuario actual
        const inventoryRef = collection(db, 'inventario');
        const q = query(inventoryRef, where('ownerId', '==', auth.currentUser?.uid), limit(itemLimit));
        
        // Suscribirse a los cambios en tiempo real (solo inventario personal)
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEquipment(items);
            setLoading(false);
            setIsFetchingMore(false);
        }, (error) => {
            console.error("Error al obtener inventario:", error);
            Alert.alert("Error", "Hubo un problema al cargar el inventario.");
            setLoading(false);
            setIsFetchingMore(false);
        });

        // Limpiar suscripción al desmontar
        return () => unsubscribe();
    }, [itemLimit]); // El useEffect reacciona cuando el límite de items aumenta

    // Función para cargar más items al llegar al final de la lista
    const handleLoadMore = () => {
        // Solo intentamos cargar más si la cantidad actual descargada alcanzó el límite
        if (equipment.length >= itemLimit) {
            setIsFetchingMore(true);
            setItemLimit(prevLimit => prevLimit + 20); // Cargar los siguientes 20
        }
    };

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

    // Generar Reporte PDF
    const handleExportPDF = async () => {
        const htmlContent = `
            <html>
                <head>
                    <style>
                        body { font-family: Helvetica, sans-serif; padding: 20px; }
                        h1 { color: #00264d; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f7f9fc; color: #00264d; }
                        .prestado { color: #ef4444; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Reporte de Inventario Scout</h1>
                    <p>Generado el: ${new Date().toLocaleDateString()}</p>
                    <table>
                        <tr><th>Artículo</th><th>Categoría</th><th>Estado</th><th>Cant.</th><th>Disponibilidad</th></tr>
                        ${filteredEquipment.map(item => `
                            <tr>
                                <td>${item.nombre || ''}</td><td>${item.categoria || ''}</td><td>${item.estado || ''}</td><td>${item.cantidad || 0}</td>
                                <td class="${item.disponibilidad === 'Prestado' ? 'prestado' : ''}">
                                    ${item.disponibilidad === 'Prestado' ? `Prestado a: ${item.prestadoA}` : 'Disponible'}
                                </td>
                            </tr>
                        `).join('')}
                    </table>
                </body>
            </html>
        `;
        try {
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { dialogTitle: 'Compartir Reporte de Inventario' });
        } catch (error) {
            Alert.alert("Error", "No se pudo generar el reporte PDF.");
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            onPress={() => navigation.navigate('ItemDetail', { itemId: item.id, itemData: item })}
            style={[styles.card, { backgroundColor: theme.card, shadowColor: isHighContrast ? theme.border : '#000' }]}
        >
            <View style={styles.cardContent}>
                <Text style={[styles.itemName, { color: theme.textMain, fontSize: 18 * textScale, fontFamily: theme.font }]}>{item.nombre}</Text>
                <Text style={[styles.itemDetail, { color: theme.textSub, fontSize: 14 * textScale, fontFamily: theme.font }]}>Categoría: {item.categoria}</Text>
                <Text style={[styles.itemDetail, { color: theme.textSub, fontSize: 14 * textScale, fontFamily: theme.font }]}>Cantidad: {item.cantidad}</Text>
                <Text style={[styles.itemDetail, { color: theme.textSub, fontSize: 14 * textScale, fontFamily: theme.font }]}>Estado: {item.estado}</Text>
                
                {item.disponibilidad === 'Prestado' && (
                    <Text style={{ color: theme.danger, fontWeight: 'bold', fontSize: 13 * textScale, marginTop: 4 }}>
                        🔴 PRESTADO A {item.prestadoA?.toUpperCase()}
                    </Text>
                )}
                
                {item.qrCode && <Text style={[styles.itemQr, { fontSize: 12 * textScale, fontFamily: theme.font }]}>QR Vinculado: {item.qrCode}</Text>}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={styles.innerContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 10 }}>
                    <Text style={[styles.headerTitle, { color: theme.textMain, fontSize: 28 * textScale, fontFamily: theme.font, marginBottom: 0, marginTop: 0 }]}>Bodega Scout</Text>
                    <TouchableOpacity onPress={handleExportPDF} style={{ backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>📄 PDF</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={[styles.searchInput, { backgroundColor: theme.card, color: theme.textMain, borderColor: theme.border, fontFamily: theme.font }]}
                    placeholder="Buscar por nombre o categoria de equipo"
                    placeholderTextColor={isHighContrast ? "#FFFF00" : "#9ca3af"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                
                {loading ? (
                    <ActivityIndicator size="large" color={theme.textMain} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={filteredEquipment}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textSub, fontSize: 16 * textScale, fontFamily: theme.font }]}>No hay equipos que coincidan con la búsqueda.</Text>}
                        showsVerticalScrollIndicator={false}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5} // Ejecutar cuando esté al 50% de llegar al final
                        ListFooterComponent={isFetchingMore ? <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} /> : null}
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