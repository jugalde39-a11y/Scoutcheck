import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { auth } from '../../firebaseConfig';
import { obtenerDatosUsuario, cerrarSesion } from '../services/authService';
import { useA11y } from './A11yContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const { theme, textScale, isHighContrast } = useA11y();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (auth.currentUser) {
                const data = await obtenerDatosUsuario(auth.currentUser.uid);
                setUserData(data);
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    if (loading) {
        return <View style={[styles.center, { backgroundColor: theme.bg }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
    }

    const userName = userData?.nombre || "Usuario Scout";
    const userEmail = userData?.email || auth.currentUser?.email;
    const userAvatar = userData?.fotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff&bold=true&size=200`;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: isHighContrast ? theme.border : '#000' }]}>
                <Image source={{ uri: userAvatar }} style={[styles.avatar, { borderColor: theme.border }]} />
                
                <Text style={[styles.name, { color: theme.textMain, fontSize: 24 * textScale, fontFamily: theme.font }]}>{userName}</Text>
                <Text style={[styles.role, { color: theme.primary, fontSize: 16 * textScale, fontFamily: theme.font }]}>{userData?.perfil || 'Sin perfil'}</Text>
                
                <View style={[styles.infoBox, { backgroundColor: isHighContrast ? '#000' : theme.bg }]}>
                    <View style={styles.infoRow}>
                        <Ionicons name="mail" size={20} color={theme.textSub} style={styles.icon} />
                        <Text style={[styles.infoText, { color: theme.textSub, fontSize: 15 * textScale, fontFamily: theme.font }]}>{userEmail}</Text>
                    </View>
                    {userData?.telefono ? (
                        <View style={styles.infoRow}>
                            <Ionicons name="call" size={20} color={theme.textSub} style={styles.icon} />
                            <Text style={[styles.infoText, { color: theme.textSub, fontSize: 15 * textScale, fontFamily: theme.font }]}>{userData.telefono}</Text>
                        </View>
                    ) : null}
                    {userData?.grupoScout ? (
                        <View style={styles.infoRow}>
                            <Ionicons name="people" size={20} color={theme.textSub} style={styles.icon} />
                            <Text style={[styles.infoText, { color: theme.textSub, fontSize: 15 * textScale, fontFamily: theme.font }]}>{userData.grupoScout}</Text>
                        </View>
                    ) : null}
                </View>

                <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.danger }]} onPress={cerrarSesion}>
                    <Ionicons name="log-out-outline" size={22} color="#fff" style={{marginRight: 8}}/>
                    <Text style={[styles.logoutText, { fontSize: 16 * textScale, fontFamily: theme.font }]}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { margin: 20, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, marginBottom: 16 },
    name: { fontWeight: 'bold', marginBottom: 4 },
    role: { fontWeight: '600', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 },
    infoBox: { width: '100%', borderRadius: 16, padding: 16, marginBottom: 24 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    icon: { marginRight: 12, width: 24, textAlign: 'center' },
    infoText: { flex: 1, fontWeight: '500' },
    logoutBtn: { flexDirection: 'row', width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    logoutText: { color: '#ffffff', fontWeight: 'bold' }
});