import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
let baseWidth = Platform.OS === 'ios' ? 375 : 360;

if (Platform.OS === 'ios') {
  if (width >= 428) {
    baseWidth = 428;
  } else if (width >= 390) {
    baseWidth = 390;
  }
} else {
  if (width >= 400) {
    baseWidth = 400;
  } else if (width >= 320) {
    baseWidth = 320;
  }
}

const scale = Math.min(width, height) / baseWidth;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('userEmail');
        const savedPassword = await AsyncStorage.getItem('userPassword');
        
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          // Attendre un court instant pour s'assurer que Firebase est initialisé
          setTimeout(() => {
            handleLogin(savedEmail, savedPassword);
          }, 500);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des identifiants:', error);
      }
    };

    initializeApp();
  }, []);

  const saveCredentials = async (email, password) => {
    try {
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', password);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des identifiants:', error);
    }
  };

  const handleLogin = async (emailToUse = email, passwordToUse = password) => {
    if (!emailToUse || !passwordToUse) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, passwordToUse);
      await saveCredentials(emailToUse, passwordToUse);
      router.replace('/(app)/dashboard');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou mot de passe incorrect';
      }
      
      Alert.alert('Erreur', errorMessage);
      // Si la connexion échoue, on efface les identifiants sauvegardés
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userPassword');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Connexion</Text>
          
          <TextInput
            style={[
              styles.input,
              focusedInput === 'email' && styles.inputFocused
            ]}
            placeholder="Email"
            placeholderTextColor="rgba(248, 247, 255, 0.5)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
          />

          <TextInput
            style={[
              styles.input,
              focusedInput === 'password' && styles.inputFocused
            ]}
            placeholder="Mot de passe"
            placeholderTextColor="rgba(248, 247, 255, 0.5)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleLogin()}
            disabled={loading}
          >
            <LinearGradient
              colors={['#FFD8BE', '#FFEEDD']}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#9381FF" />
              ) : (
                <Text style={styles.buttonText}>Se connecter</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.registerText}>
              Pas encore de compte ? S'inscrire
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20 * scale,
  },
  title: {
    fontSize: 32 * scale,
    color: '#F8F7FF',
    fontWeight: 'bold',
    marginBottom: 20 * scale,
    textAlign: 'center',
  },
  input: {
    height: 55 * scale,
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderRadius: 15 * scale,
    paddingHorizontal: 20 * scale,
    color: '#F8F7FF',
    fontSize: 16 * scale,
    marginBottom: 15 * scale,
    borderWidth: 1,
    borderColor: '#F8F7FF',
  },
  inputFocused: {
    borderColor: '#FFD8BE',
    borderWidth: 1,
  },
  button: {
    height: 55 * scale,
    borderRadius: 15 * scale,
    overflow: 'hidden',
    marginTop: 20 * scale,
  },
  buttonGradient: {
    height: 55 * scale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#9381FF',
    fontSize: 18 * scale,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 15 * scale,
  },
  registerText: {
    color: '#FFD8BE',
    textAlign: 'center',
    fontSize: 14 * scale,
  },
}); 