import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import ScoutLogo from '../components/ScoutLogo';

const DashboardScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header con el logo */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingTitle}>Hola, Juan Carlos</Text>
            <Text style={styles.greetingSubtitle}>Gestiona tu equipo scout de forma eficiente</Text>
          </View>
          <ScoutLogo size={40} />
        </View>

        {/* Tarjetas de Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#e6f7ec' }]}>
              {/* Aquí iría un ícono real (ej. Feather, Ionicons), usando texto por ahora */}
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

        {/* Acciones Rápidas */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Inventory')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#e6f0ff' }]}>
              <Text style={{ color: '#0055ff' }}>📋</Text>
            </View>
            <Text style={styles.actionButtonText}>Ver Inventario Completo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddEquipment')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#e6f0ff' }]}>
              <Text style={{ color: '#0055ff' }}>➕</Text>
            </View>
            <Text style={styles.actionButtonText}>Añadir Nuevo Equipo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  container: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 32,
  },
  greetingContainer: {
    flex: 1,
    paddingRight: 16,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00264d',
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#5c738a',
    marginTop: 6,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
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
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00264d',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#5c738a',
    fontWeight: '500',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00264d',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00264d',
  },
});

export default DashboardScreen;
