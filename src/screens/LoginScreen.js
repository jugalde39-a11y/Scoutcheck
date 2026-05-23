import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import ScoutLogo from '../components/ScoutLogo';
import { loginUsuario, recuperarPassword } from '../services/authService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      await loginUsuario(email, password);
      // No necesitamos navegar manualmente, App.js lo hará al detectar la sesión
    } catch (error) {
      console.error("Error en handleLogin:", error);
      Alert.alert("Error de Inicio de Sesión", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Aviso", "Por favor ingresa tu correo electrónico en el campo superior para enviarte el enlace de recuperación.");
      return;
    }
    setLoading(true);
    try {
      await recuperarPassword(email);
      Alert.alert("Éxito", "Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.");
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el correo. Verifica que esté bien escrito.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <ScoutLogo size={80} />
          <Text style={styles.title}>ScoutCheck</Text>
          <Text style={styles.subtitle}>Gestión de Inventario</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#8a9eb3"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#8a9eb3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPasswordLink}
            onPress={handleResetPassword}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>¿No tienes cuenta? <Text style={styles.registerTextBold}>Regístrate</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f9fc' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 28, fontWeight: '700', color: '#00264d', marginTop: 16 },
  subtitle: { fontSize: 16, color: '#5c738a', marginTop: 8 },
  form: { width: '100%' },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#00264d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e1e8f0',
  },
  loginButton: {
    backgroundColor: '#00264d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  forgotPasswordLink: { marginTop: 16, alignItems: 'center' },
  forgotPasswordText: { color: '#00264d', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  registerLink: { marginTop: 24, alignItems: 'center' },
  registerText: { color: '#5c738a', fontSize: 14 },
  registerTextBold: { fontWeight: '700', color: '#00264d' },
});

export default LoginScreen;
