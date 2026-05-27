import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

// Pantallas
import { A11yProvider } from './src/screens/A11yContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import AddEquipmentScreen from './src/screens/AddEquipmentScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ScanToSearchScreen from './src/screens/ScanToSearchScreen';
import EditEquipmentScreen from './src/screens/EditEquipmentScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchador global de autenticación
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00264d" />
      </View>
    );
  }

  return (
    <A11yProvider>
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f7f9fc' }
        }}
      >
        {user ? (
          // STACK PARA USUARIOS LOGUEADOS
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Inventory" component={InventoryScreen} />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerShown: true, title: 'Mi Perfil' }}
            />
            <Stack.Screen
              name="AddEquipment"
              component={AddEquipmentScreen}
              options={{ headerShown: true, title: 'Añadir Equipo' }}
            />
            <Stack.Screen
              name="ScanToSearch"
              component={ScanToSearchScreen}
              options={{ headerShown: true, title: 'Buscar Equipo' }}
            />
            <Stack.Screen
              name="EditEquipment"
              component={EditEquipmentScreen}
              options={{ headerShown: true, title: 'Editar Equipo' }}
            />
            <Stack.Screen
              name="ItemDetail"
              component={ItemDetailScreen}
              options={{ headerShown: true, title: 'Ficha Técnica' }}
            />
          </>
        ) : (
          // STACK PARA USUARIOS NO LOGUEADOS
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
    </A11yProvider>
  );
}
