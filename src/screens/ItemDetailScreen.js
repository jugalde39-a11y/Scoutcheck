import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Modal, TextInput, ScrollView, Image } from 'react-native';
import { doc, onSnapshot, updateDoc, deleteDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useA11y } from './A11yContext';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

export default function ItemDetailScreen({ route, navigation }) {
    const { itemId, itemData: initialData } = route.params;
    const [item, setItem] = useState(initialData);
    const { theme, textScale, isHighContrast } = useA11y();

    const [modalVisible, setModalVisible] = useState(false);
    const [prestadoA, setPrestadoA] = useState('');
    const [fechaDevolucion, setFechaDevolucion] = useState('');
    const [ownerName, setOwnerName] = useState('');

    // Verificar si el usuario actual es el dueño del objeto
    const isOwner = auth.currentUser?.uid === item?.ownerId;

    // Suscripción en tiempo real a los cambios de este objeto
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'inventario', itemId), (docSnap) => {
            if (docSnap.exists()) {
                setItem({ id: docSnap.id, ...docSnap.data() });
            } else {
                // Si el documento ya no existe (fue borrado)
                navigation.goBack();
            }
        });
        return () => unsubscribe();
    }, [itemId]);

    // Buscar el nombre del propietario original si escaneamos un QR ajeno
    useEffect(() => {
        const fetchOwner = async () => {
            if (!isOwner && item?.ownerId) {
                const ownerDoc = await getDoc(doc(db, 'usuarios', item.ownerId));
                if (ownerDoc.exists()) {
                    setOwnerName(ownerDoc.data().nombre);
                }
            }
        };
        fetchOwner();
    }, [isOwner, item?.ownerId]);

    const handleDelete = () => {
        Alert.alert(
            "⚠️ Eliminar Equipo",
            `¿Estás seguro de que deseas eliminar "${item.nombre}" de forma permanente del inventario?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sí, Eliminar", 
                    style: "destructive",
                    onPress: async () => {
                        await deleteDoc(doc(db, 'inventario', itemId));
                        navigation.navigate('Inventory');
                    }
                }
            ]
        );
    };

    const handlePrestar = async () => {
        if (!prestadoA.trim()) {
            Alert.alert("Requerido", "Por favor ingresa el nombre de a quién se le presta.");
            return;
        }
        await updateDoc(doc(db, 'inventario', itemId), {
            disponibilidad: 'Prestado',
            prestadoA: prestadoA.trim(),
            fechaDevolucion: fechaDevolucion.trim() || 'Sin fecha',
            historial: arrayUnion({
                accion: 'Prestado',
                a: prestadoA.trim(),
                fecha: new Date().toLocaleString(),
                devolucionAcordada: fechaDevolucion.trim() || 'Sin fecha'
            })
        });
        setModalVisible(false);
        setPrestadoA('');
        setFechaDevolucion('');
    };

    const handleDevolver = async () => {
        await updateDoc(doc(db, 'inventario', itemId), {
            disponibilidad: 'Disponible',
            prestadoA: '',
            fechaDevolucion: '',
            historial: arrayUnion({
                accion: 'Devuelto',
                fecha: new Date().toLocaleString()
            })
        });
        Alert.alert("Éxito", "El artículo ha regresado a la bodega.");
    };

    const isPrestado = item.disponibilidad === 'Prestado';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <ScrollView contentContainerStyle={styles.innerContainer}>
                
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.title, { color: theme.textMain, fontSize: 26 * textScale, fontFamily: theme.font }]}>{item.nombre}</Text>
                    
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: theme.secondary + '20' }]}>
                            <Text style={[styles.badgeText, { color: theme.secondary, fontFamily: theme.font }]}>{item.categoria}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: isPrestado ? theme.danger + '20' : theme.success + '20' }]}>
                            <Text style={[styles.badgeText, { color: isPrestado ? theme.danger : theme.success, fontFamily: theme.font }]}>
                                {isPrestado ? 'PRESTADO' : 'DISPONIBLE'}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.detail, { color: theme.textSub, fontSize: 16 * textScale, fontFamily: theme.font }]}>Estado Físico: <Text style={{fontWeight:'bold', color: theme.textMain}}>{item.estado}</Text></Text>
                    <Text style={[styles.detail, { color: theme.textSub, fontSize: 16 * textScale, fontFamily: theme.font }]}>Cantidad en lote: <Text style={{fontWeight:'bold', color: theme.textMain}}>{item.cantidad}</Text></Text>
                    
                    {item.qrCode && (
                        <View style={styles.qrContainer}>
                            <Text style={[styles.detail, { color: theme.textSub, fontSize: 14 * textScale, fontFamily: theme.font }]}>Código QR Vinculado:</Text>
                            <View style={{ marginTop: 10 }}>
                                <QRCode value={item.qrCode} size={100} />
                            </View>
                            <Text style={{color: theme.textSub, marginTop: 5}}>{item.qrCode}</Text>
                        </View>
                    )}
                </View>
                
                {/* Mensaje de lectura de QR Ajeno */}
                {!isOwner && (
                    <View style={[styles.loanCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary, marginTop: 0, marginBottom: 20 }]}>
                        <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 16 }}>ℹ️ Modo Lectura</Text>
                        <Text style={{ color: theme.textMain, marginTop: 5 }}>
                            Este artículo pertenece a <Text style={{fontWeight: 'bold'}}>{ownerName || 'otro Scout'}</Text>. No tienes permisos para editarlo o eliminarlo.
                        </Text>
                    </View>
                )}

                {/* Mostrar controles de préstamo solo si es el dueño */}
                {isOwner && isPrestado ? (
                    <View style={[styles.loanCard, { backgroundColor: theme.danger + '10', borderColor: theme.danger }]}>
                        <Text style={[styles.loanTitle, { color: theme.danger, fontFamily: theme.font }]}>📋 Información de Préstamo</Text>
                        <Text style={{ color: theme.textMain, fontSize: 16, marginBottom: 4 }}>Prestado a: <Text style={{fontWeight:'bold'}}>{item.prestadoA}</Text></Text>
                        <Text style={{ color: theme.textMain, fontSize: 16, marginBottom: 16 }}>Devolución: {item.fechaDevolucion}</Text>
                        
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.success }]} onPress={handleDevolver}>
                            <Text style={styles.btnText}>✅ Marcar como Devuelto</Text>
                        </TouchableOpacity>
                    </View>
                ) : isOwner ? (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary, marginTop: 20 }]} onPress={() => setModalVisible(true)}>
                        <Text style={styles.btnText}>📤 Registrar Préstamo</Text>
                    </TouchableOpacity>
                ) : null}

                {/* Mostrar botones de editar y eliminar solo si es el dueño */}
                {isOwner && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.secondary, flex: 1, marginRight: 10 }]} onPress={() => navigation.navigate('EditEquipment', { item })}>
                            <Text style={styles.btnText}>✏️ Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.danger, flex: 1 }]} onPress={handleDelete}>
                            <Text style={styles.btnText}>🗑 Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Sección de Historial Automático */}
                <View style={{ marginTop: 30, marginBottom: 20 }}>
                    <Text style={{ color: theme.textMain, fontSize: 18 * textScale, fontWeight: 'bold', marginBottom: 10 }}>Historial Reciente</Text>
                    {item.historial && item.historial.length > 0 ? (
                        [...item.historial].reverse().slice(0, 5).map((log, index) => (
                            <View key={index} style={{ borderLeftWidth: 2, borderLeftColor: log.accion === 'Prestado' ? theme.danger : theme.success, paddingLeft: 10, marginBottom: 15 }}>
                                <Text style={{ color: theme.textMain, fontWeight: 'bold' }}>
                                    {log.accion === 'Prestado' ? `Prestado a: ${log.a}` : 'Artículo Devuelto'}
                                </Text>
                                <Text style={{ color: theme.textSub, fontSize: 12 }}>{log.fecha}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={{ color: theme.textSub, fontStyle: 'italic' }}>No hay registros de préstamos.</Text>
                    )}
                </View>

            </ScrollView>

            {/* Modal de Préstamos */}
            <Modal visible={modalVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.title, { color: theme.textMain, fontSize: 20, marginBottom: 20 }]}>Registrar Préstamo</Text>
                        
                        <Text style={{color: theme.textSub, marginBottom: 5}}>¿A quién se le presta?</Text>
                        <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} placeholder="Ej. Patrulla Lobos, Juan" placeholderTextColor={theme.textSub} value={prestadoA} onChangeText={setPrestadoA} />
                        
                        <Text style={{color: theme.textSub, marginBottom: 5}}>Fecha acordada de devolución</Text>
                        <TextInput style={[styles.input, { borderColor: theme.border, color: theme.textMain }]} placeholder="Ej. Sábado en la tarde" placeholderTextColor={theme.textSub} value={fechaDevolucion} onChangeText={setFechaDevolucion} />
                        
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.success, marginBottom: 10 }]} onPress={handlePrestar}><Text style={styles.btnText}>Confirmar Préstamo</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.textSub }]} onPress={() => setModalVisible(false)}><Text style={{color: theme.textSub, textAlign:'center', fontWeight:'bold'}}>Cancelar</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 }, innerContainer: { padding: 20 },
    card: { borderWidth: 1, borderRadius: 16, padding: 20, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 20 },
    title: { fontWeight: 'bold', marginBottom: 15 },
    badgeRow: { flexDirection: 'row', marginBottom: 20 },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 10 },
    badgeText: { fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
    detail: { marginBottom: 10 }, qrContainer: { marginTop: 20, alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderColor: '#eee' },
    actionBtn: { padding: 16, borderRadius: 12, alignItems: 'center' }, btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    loanCard: { borderWidth: 1, borderRadius: 16, padding: 20, marginTop: 10 }, loanTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 }, input: { borderWidth: 1, borderRadius: 10, padding: 15, marginBottom: 20 }
});