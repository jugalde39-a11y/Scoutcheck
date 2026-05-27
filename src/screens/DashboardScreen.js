import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Image, Modal, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScoutLogo from '../components/ScoutLogo';
import { auth, db } from '../../firebaseConfig';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { obtenerDatosUsuario } from '../services/authService';
import { useA11y } from './A11yContext';

const DashboardScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ disponibles: 0, enUso: 0 });

  // Consumimos el contexto global de A11Y
  const { 
    isHighContrast, setIsHighContrast, 
    textScale, setTextScale, 
    isDyslexiaMode, setIsDyslexiaMode, 
    colorBlindMode, setColorBlindMode,
    theme 
  } = useA11y();

  const [showA11y, setShowA11y] = useState(false);

  // Procesar datos reales del usuario
  const userName = userData?.nombre || "Scout";
  const userEmail = userData?.email || auth.currentUser?.email || "";
  const userRole = userData?.perfil || "Cargando...";
  // Usa la foto en BD si existe, si no, genera un avatar dinámico con sus iniciales reales
  const userAvatar = userData?.fotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff&bold=true`;

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
    const q = query(inventoryRef, where('ownerId', '==', auth.currentUser?.uid));
    
    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
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
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerTop}>
          <ScoutLogo size={40} />
          
          {/* --- SECCIÓN DE PERFIL Y A11Y --- */}
          <View style={styles.headerRightActions}>
            <TouchableOpacity 
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Abrir ajustes de accesibilidad"
              onPress={() => setShowA11y(true)}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="accessibility-outline" size={28} color={theme.textMain} />
            </TouchableOpacity>

            <View style={{ zIndex: 10 }}>
              <TouchableOpacity 
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Abrir perfil de usuario"
                onPress={() => navigation.navigate('Profile')}
              >
                <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greetingTitle, { color: theme.textMain, fontSize: 28 * textScale, fontFamily: theme.font }]}>
              Hola, {userName.split(' ')[0]}
            </Text>
            <Text style={[styles.greetingSubtitle, { color: theme.textSub, fontSize: 14 * textScale, fontFamily: theme.font }]}>
              Aquí tienes un resumen de la bodega
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: isHighContrast ? theme.border : '#000' }]}>
            <View style={[styles.iconContainer, { backgroundColor: isHighContrast ? '#333' : theme.success + '20' }]}>
              <Ionicons name="cube" size={24} color={isHighContrast ? theme.textMain : theme.success} />
            </View>
            <Text style={[styles.statNumber, { color: theme.textMain, fontSize: 32 * textScale, fontFamily: theme.font }]}>{stats.disponibles}</Text>
            <Text style={[styles.statLabel, { color: theme.textSub, fontSize: 13 * textScale, fontFamily: theme.font }]}>En Bodega</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: isHighContrast ? theme.border : '#000' }]}>
            <View style={[styles.iconContainer, { backgroundColor: isHighContrast ? '#333' : theme.danger + '20' }]}>
              <Ionicons name="cube-outline" size={24} color={isHighContrast ? theme.textMain : theme.danger} />
            </View>
            <Text style={[styles.statNumber, { color: theme.textMain, fontSize: 32 * textScale, fontFamily: theme.font }]}>{stats.enUso}</Text>
            <Text style={[styles.statLabel, { color: theme.textSub, fontSize: 13 * textScale, fontFamily: theme.font }]}>En Uso / Otros</Text>
          </View>
        </View>

        {/* --- NUEVOS BOTONES DE NAVEGACIÓN --- */}
        <Text style={[styles.sectionTitle, { color: theme.textMain, fontSize: 18 * textScale, fontFamily: theme.font }]}>Acciones Rápidas</Text>
        
        <TouchableOpacity 
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Escanear para buscar un equipo"
          style={[styles.actionButtonScan, { backgroundColor: theme.secondary }, isHighContrast && { backgroundColor: '#222', borderWidth: 1, borderColor: theme.border }]} 
          onPress={() => navigation.navigate('ScanToSearch')}
        >
          <Ionicons name="search" size={28} color={isHighContrast ? theme.textMain : '#ffffff'} style={styles.actionIcon} />
          <View style={styles.actionTextContainer}>
            <Text style={[styles.actionTitleScan, { color: isHighContrast ? theme.textMain : '#ffffff', fontSize: 16 * textScale, fontFamily: theme.font }]}>Escanear para Buscar</Text>
            <Text style={[styles.actionSubtitleScan, { color: isHighContrast ? theme.textSub : '#c7d2fe', fontSize: 13 * textScale, fontFamily: theme.font }]}>Encuentra un equipo por su código</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Ingresar equipo a bodega"
          style={[styles.actionButtonPrimary, { backgroundColor: theme.primary }, isHighContrast && { backgroundColor: theme.textMain, borderWidth: 1, borderColor: theme.border }]} 
          onPress={() => navigation.navigate('AddEquipment')}
        >
          <Ionicons name="add-circle" size={28} color={isHighContrast ? '#000' : '#fff'} style={styles.actionIcon} />
          <View style={styles.actionTextContainer}>
            <Text style={[styles.actionTitlePrimary, { color: isHighContrast ? '#000' : '#ffffff', fontSize: 16 * textScale, fontFamily: theme.font }]}>Ingresar a Bodega</Text>
            <Text style={[styles.actionSubtitlePrimary, { color: isHighContrast ? '#333' : '#8a9eb3', fontSize: 13 * textScale, fontFamily: theme.font }]}>Registra y genera QR para equipos</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Ver el inventario completo"
          style={[styles.actionButtonSecondary, { backgroundColor: theme.card, borderColor: theme.border }]} 
          onPress={() => navigation.navigate('Inventory')}
        >
          <Ionicons name="list" size={28} color={theme.textMain} style={styles.actionIcon} />
          <View style={styles.actionTextContainer}>
            <Text style={[styles.actionTitleSecondary, { color: theme.textMain, fontSize: 16 * textScale, fontFamily: theme.font }]}>Ver Inventario</Text>
            <Text style={[styles.actionSubtitleSecondary, { color: theme.textSub, fontSize: 13 * textScale, fontFamily: theme.font }]}>Consulta o edita la lista completa</Text>
          </View>
        </TouchableOpacity>

        {/* --- PANEL / MODAL DE AJUSTES DE ACCESIBILIDAD --- */}
        <Modal visible={showA11y} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textMain, marginBottom: 0 }]}>Accesibilidad</Text>
                <TouchableOpacity onPress={() => setShowA11y(false)}>
                  <Ionicons name="close-circle" size={32} color={theme.textSub} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.a11yRow}>
                 <Text style={{ color: theme.textMain, flex: 1, fontSize: 16 }}>Modo Alto Contraste</Text>
                 <Switch 
                    accessible={true}
                    accessibilityRole="switch"
                    accessibilityLabel="Alternar modo alto contraste"
                    value={isHighContrast} 
                    onValueChange={setIsHighContrast} 
                    trackColor={{ false: "#767577", true: isHighContrast ? "#FFFF00" : "#4338ca" }}
                 />
              </View>

              <View style={styles.a11yRow}>
                 <Text style={{ color: theme.textMain, flex: 1, fontSize: 16 }}>Modo Dislexia (Fuente)</Text>
                 <Switch 
                    accessible={true}
                    accessibilityRole="switch"
                    accessibilityLabel="Alternar tipografía optimizada"
                    value={isDyslexiaMode} 
                    onValueChange={setIsDyslexiaMode} 
                    trackColor={{ false: "#767577", true: isHighContrast ? "#FFFF00" : "#4338ca" }}
                 />
              </View>

              <View style={styles.a11yRow}>
                 <Text style={{ color: theme.textMain, flex: 1, fontSize: 16 }}>Tamaño de Texto</Text>
                 <TouchableOpacity accessible={true} accessibilityRole="button" accessibilityLabel="Reducir tamaño del texto" style={[styles.textBtn, { borderColor: theme.border }]} onPress={() => setTextScale(Math.max(0.8, textScale - 0.2))}>
                    <Text style={{ color: theme.textMain, fontWeight: 'bold' }}>A-</Text>
                 </TouchableOpacity>
                 <Text style={{ color: theme.textMain, marginHorizontal: 15, fontWeight: 'bold' }}>{(textScale * 100).toFixed(0)}%</Text>
                 <TouchableOpacity accessible={true} accessibilityRole="button" accessibilityLabel="Aumentar tamaño del texto" style={[styles.textBtn, { borderColor: theme.border }]} onPress={() => setTextScale(Math.min(1.6, textScale + 0.2))}>
                    <Text style={{ color: theme.textMain, fontWeight: 'bold' }}>A+</Text>
                 </TouchableOpacity>
              </View>

              <Text style={{ color: theme.textSub, fontSize: 14, marginTop: 10, marginBottom: 10 }}>Filtros de Color</Text>
              <View style={styles.colorBlindRow}>
                  <TouchableOpacity onPress={() => setColorBlindMode('none')} style={[styles.filterBtn, colorBlindMode === 'none' && { borderColor: theme.primary, backgroundColor: theme.primary + '15' }]}>
                      <Text style={{ color: theme.textMain, fontSize: 13, textAlign: 'center' }}>Por Defecto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setColorBlindMode('protanopia')} style={[styles.filterBtn, colorBlindMode === 'protanopia' && { borderColor: theme.primary, backgroundColor: theme.primary + '15' }]}>
                      <Text style={{ color: theme.textMain, fontSize: 13, textAlign: 'center' }}>Rojo / Verde</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setColorBlindMode('tritanopia')} style={[styles.filterBtn, colorBlindMode === 'tritanopia' && { borderColor: theme.primary, backgroundColor: theme.primary + '15' }]}>
                      <Text style={{ color: theme.textMain, fontSize: 13, textAlign: 'center' }}>Azul / Amarillo</Text>
                  </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#e1e8f0',
  },
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
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderWidth: 1, borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
  },
  a11yRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  textBtn: {
    borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8,
  },
  colorBlindRow: { flexDirection: 'row', justifyContent: 'space-between' },
  filterBtn: {
    flex: 1, borderWidth: 1, borderColor: '#e1e8f0', paddingVertical: 10,
    borderRadius: 8, marginHorizontal: 4, justifyContent: 'center'
  },
});

export default DashboardScreen;
