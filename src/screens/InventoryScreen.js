import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, FlatList, TouchableOpacity } from 'react-native';
import ScoutLogo from '../components/ScoutLogo';

// Datos de prueba basados en tu imagen
const MOCK_DATA = [
  { id: '1', name: 'Carpa 4 Personas', category: 'Campamento', status: 'Disponible' },
  { id: '2', name: 'Saco de Dormir', category: 'Campamento', status: 'En Uso' },
  { id: '3', name: 'Linterna LED', category: 'Iluminación', status: 'Disponible' },
  { id: '4', name: 'Brújula Profesional', category: 'Navegación', status: 'Disponible' },
  { id: '5', name: 'Mochila 60L', category: 'Equipamiento', status: 'En Uso' },
];

const InventoryScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const renderItem = ({ item }) => {
    const isAvailable = item.status === 'Disponible';
    return (
      <View style={styles.card}>
        <View style={styles.cardIconContainer}>
          <Text style={{ fontSize: 24, color: '#0055ff' }}>📦</Text>
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isAvailable ? '#00cc66' : '#ff3333' }]} />
          <Text style={[styles.statusText, { color: isAvailable ? '#00a344' : '#cc0000' }]}>
            {item.status}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={{ fontSize: 24, color: '#00264d' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventario Completo</Text>
        <ScoutLogo size={36} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16, color: '#8a9eb3', marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar equipo..."
            placeholderTextColor="#8a9eb3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.itemCount}>{MOCK_DATA.length} artículos</Text>
      </View>

      <FlatList
        data={MOCK_DATA}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00264d',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#00264d',
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  itemCount: {
    fontSize: 14,
    color: '#5c738a',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
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
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#e6f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00264d',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 13,
    color: '#5c738a',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default InventoryScreen;
