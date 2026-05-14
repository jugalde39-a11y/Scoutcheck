import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import ScoutLogo from '../components/ScoutLogo';
import { auth } from '../../firebaseConfig';
import { obtenerDatosUsuario, cerrarSesion } from '../services/authService';

const DashboardScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (auth.currentUser) {
        try {
          const data = await obtenerDatosUsuario(auth.currentUser.uid);
          setUserData(data);
        } catch (error) {
          console.error("Error cargando perfil:", error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00264d" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerTop}>
          <ScoutLogo size={40} />
          <TouchableOpacity onPress={cerrarSesion} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingTitle}>
              Hola, {userData ? userData.nombre.split(' ')[0] : 'Scout'}
            </Text>
            <Text style={styles.greetingSubtitle}>
              {userData ? userData.perfil : 'Cargando perfil...'}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#e6f7ec' }]}>
              <Text style={{ fontSize: 20, color: '#00a344' }}>📦</Text>
            </View>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>Equipo Disponible</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#fff3e6' }]}>
              <Text style={{ fontSize: 20, color: '#f26d21' }}>📦</Text>
            </View>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>En Uso</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f9fc' },
  container: { padding: 24 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
  },
  logoutText: { color: '#cc0000', fontWeight: '600', fontSize: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  greetingContainer: { flex: 1, paddingRight: 16 },
  greetingTitle: { fontSize: 28, fontWeight: '700', color: '#00264d' },
  greetingSubtitle: { fontSize: 14, color: '#5c738a', marginTop: 6, lineHeight: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: { fontSize: 32, fontWeight: '700', color: '#00264d', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#5c738a', fontWeight: '500' },
});

export default DashboardScreen;
