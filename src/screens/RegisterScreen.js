import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import ScoutLogo from '../components/ScoutLogo';
import { registrarUsuario } from '../services/authService';
import { useA11y } from './A11yContext';
import SelectOption from '../components/SelectOption';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [grupoScout, setGrupoScout] = useState('');
  const [perfil, setPerfil] = useState('Bodeguero');
  const [loading, setLoading] = useState(false);
  const { theme, textScale, isHighContrast } = useA11y();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      await registrarUsuario(email, password, name, perfil, telefono, grupoScout);
      // No necesitamos navegar manualmente, App.js lo hará al detectar la sesión
    } catch (error) {
      console.error("Error en handleRegister:", error);
      Alert.alert("Error de Registro", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <ScoutLogo size={60} />
          <Text style={[styles.title, { color: theme.textMain, fontSize: 26 * textScale, fontFamily: theme.font }]}>Crea tu cuenta</Text>
          <Text style={[styles.subtitle, { color: theme.textSub, fontSize: 16 * textScale, fontFamily: theme.font }]}>Ingresa tus datos para unirte</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.textMain, borderColor: theme.border, fontFamily: theme.font }]}
            placeholder="Nombre completo"
            placeholderTextColor={theme.textSub}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.textMain, borderColor: theme.border, fontFamily: theme.font }]}
            placeholder="Correo electrónico"
            placeholderTextColor={theme.textSub}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.textMain, borderColor: theme.border, fontFamily: theme.font }]}
            placeholder="Contraseña"
            placeholderTextColor={theme.textSub}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.textMain, borderColor: theme.border, fontFamily: theme.font }]}
            placeholder="Teléfono (Opcional)"
            placeholderTextColor={theme.textSub}
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.textMain, borderColor: theme.border, fontFamily: theme.font }]}
            placeholder="Grupo Scout (Ej: Grupo 12)"
            placeholderTextColor={theme.textSub}
            value={grupoScout}
            onChangeText={setGrupoScout}
          />

          <Text style={[styles.label, { color: theme.textSub, fontFamily: theme.font }]}>Selecciona tu Perfil:</Text>
          <View style={styles.perfilRow}>
            <SelectOption label="Bodeguero" currentValue={perfil} onSelect={setPerfil} activeColor={theme.primary} />
            <SelectOption label="Dirigente" currentValue={perfil} onSelect={setPerfil} activeColor={theme.primary} />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: theme.primary }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={[styles.registerButtonText, { fontSize: 16 * textScale, fontFamily: theme.font }]}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.loginText, { color: theme.textSub, fontFamily: theme.font }]}>¿Ya tienes cuenta? <Text style={[styles.loginTextBold, { color: theme.primary }]}>Inicia Sesión</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f9fc' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#00264d', marginTop: 16 },
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
  label: {
    fontSize: 14,
    color: '#5c738a',
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '600'
  },
  perfilRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: '#00264d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  loginLink: { marginTop: 24, alignItems: 'center' },
  loginText: { color: '#5c738a', fontSize: 14 },
  loginTextBold: { fontWeight: '700', color: '#00264d' },
});

export default RegisterScreen;
