import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const [focusedInput, setFocusedInput] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const saveCredentials = async (email, password) => {
    try {
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', password);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des identifiants:', error);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Sauvegarder les identifiants après l'inscription réussie
      await saveCredentials(email, password);
      
      router.replace('/(app)/vehicle-config');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#9381FF', '#B8B8FF', '#9381FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Inscription</Text>
            <Text style={styles.subtitle}>Créez votre compte</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'email' && styles.inputFocused
                ]}
                placeholder="Email"
                placeholderTextColor="rgba(147, 129, 255, 0.5)"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'password' && styles.inputFocused
                ]}
                placeholder="Mot de passe"
                placeholderTextColor="rgba(147, 129, 255, 0.5)"
                secureTextEntry
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />

              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'confirmPassword' && styles.inputFocused
                ]}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="rgba(147, 129, 255, 0.5)"
                secureTextEntry
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />
            </View>

            <View style={styles.button}>
              <TouchableOpacity 
                onPress={handleRegister}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#FFD8BE', '#FFEEDD']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#9381FF" />
                  ) : (
                    <Text style={styles.buttonText}>S'inscrire</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleBackToLogin}
            >
              <Text style={styles.loginText}>
                Déjà un compte ? Se connecter
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  title: {
    fontSize: 38,
    color: '#F8F7FF',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#FFD8BE',
    textAlign: 'center',
    marginBottom: 30
  },
  inputContainer: {
    gap: 15
  },
  input: {
    height: 55,
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderRadius: 15,
    paddingHorizontal: 20,
    color: '#F8F7FF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(248, 247, 255, 0.2)'
  },
  inputFocused: {
    borderColor: '#FFD8BE',
    backgroundColor: 'rgba(255, 216, 190, 0.1)'
  },
  button: {
    height: 55,
    marginTop: 30,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden'
  },
  buttonGradient: {
    height: 55,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#9381FF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  loginButton: {
    padding: 10
  },
  loginText: {
    color: '#FFD8BE',
    textAlign: 'center',
    fontSize: 14
  }
}); 
