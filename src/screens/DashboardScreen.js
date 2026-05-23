import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import ScoutLogo from '../components/ScoutLogo';
import { auth, db } from '../../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { obtenerDatosUsuario, cerrarSesion } from '../services/authService';

const DashboardScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ disponibles: 0, enUso: 0 });

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

  useEffect(() => {
    const inventoryRef = collection(db, 'inventario');
    
    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(inventoryRef, (snapshot) => {
      let countDisponibles = 0;
      let countEnUso = 0;
      
      snapshot.forEach((doc) => {
        const item = doc.data();
        const qty = item.cantidad || 0; // Contamos la 'cantidad', no solo el documento
        
        if (item.estado === 'Nuevo' || item.estado === 'Usado') {
          countDisponibles += qty;
        } else {
          countEnUso += qty;
        }
      });
      setStats({ disponibles: countDisponibles, enUso: countEnUso });
    });
    return () => unsubscribe();
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
            <Text style={styles.statNumber}>{stats.disponibles}</Text>
            <Text style={styles.statLabel}>En Bodega</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#fff3e6' }]}>
              <Text style={{ fontSize: 20, color: '#f26d21' }}>📦</Text>
            </View>
            <Text style={styles.statNumber}>{stats.enUso}</Text>
            <Text style={styles.statLabel}>En Uso / Otros</Text>
          </View>
        </View>

        {/* --- NUEVOS BOTONES DE NAVEGACIÓN --- */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        
        <TouchableOpacity 
          style={styles.actionButtonScan} 
          onPress={() => navigation.navigate('ScanToSearch')}
        >
          <Text style={styles.actionIcon}>🔍</Text>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitleScan}>Escanear para Buscar</Text>
            <Text style={styles.actionSubtitleScan}>Encuentra un equipo por su código</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButtonPrimary} 
          onPress={() => navigation.navigate('AddEquipment')}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitlePrimary}>Ingresar a Bodega</Text>
            <Text style={styles.actionSubtitlePrimary}>Registra y genera QR para equipos</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButtonSecondary} 
          onPress={() => navigation.navigate('Inventory')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitleSecondary}>Ver Inventario</Text>
            <Text style={styles.actionSubtitleSecondary}>Consulta o edita la lista completa</Text>
          </View>
        </TouchableOpacity>

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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00264d',
    marginBottom: 16,
  },
  actionButtonScan: {
    backgroundColor: '#4338ca', // Color Índigo vibrante
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
  },
  actionButtonPrimary: {
    backgroundColor: '#00264d',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#00264d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonSecondary: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e8f0',
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitleScan: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionSubtitleScan: {
    color: '#c7d2fe',
    fontSize: 13,
  },
  actionTitlePrimary: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionSubtitlePrimary: {
    color: '#8a9eb3',
    fontSize: 13,
  },
  actionTitleSecondary: {
    color: '#00264d',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionSubtitleSecondary: {
    color: '#5c738a',
    fontSize: 13,
  },
});

export default DashboardScreen;
