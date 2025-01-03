import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../../firebaseConfig';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Charger les identifiants sauvegardés au démarrage
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedPassword = await AsyncStorage.getItem('userPassword');
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');

      if (savedRememberMe === 'true' && savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des identifiants:', error);
    }
  };

  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userPassword', password);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await AsyncStorage.multiRemove(['userEmail', 'userPassword', 'rememberMe']);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des identifiants:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Sauvegarder les identifiants si "Se souvenir de moi" est activé
      await saveCredentials();
      
      // Vérifier si l'utilisateur a déjà configuré son véhicule
      const userId = userCredential.user.uid;
      const vehicleRef = doc(firestore, 'vehicles', userId);
      
      try {
        const vehicleDoc = await getDoc(vehicleRef);
        
        if (vehicleDoc.exists()) {
          router.replace('/(app)/dashboard');
        } else {
          router.replace('/(app)/vehicle-config');
        }
      } catch (firestoreError) {
        console.error('Erreur Firestore:', firestoreError);
        // En cas d'erreur Firestore, rediriger quand même vers la configuration
        router.replace('/(app)/vehicle-config');
      }

    } catch (error) {
      console.error('Erreur de connexion:', error);
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'Adresse email invalide';
            break;
          case 'auth/user-not-found':
            errorMessage = 'Aucun compte ne correspond à cet email';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Mot de passe incorrect';
            break;
          default:
            errorMessage = `Erreur: ${error.code}`;
            break;
        }
      }
      Alert.alert('Erreur de connexion', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.replace('/(auth)/register');
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
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Bienvenue</Text>

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

              <View style={styles.rememberMeContainer}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[
                    styles.checkboxInner,
                    rememberMe && styles.checkboxChecked
                  ]} />
                </TouchableOpacity>
                <Text style={styles.rememberMeText}>Se souvenir de moi</Text>
              </View>
            </View>

            <View style={styles.button}>
              <TouchableOpacity 
                onPress={handleLogin}
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
                    <Text style={styles.buttonText}>Se connecter</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.registerText}>
                Pas encore de compte ? S'inscrire
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
    backgroundColor: '#9381FF',
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  },
  inputFocused: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#9381FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    marginTop: 10,
  },
  buttonGradient: {
    borderRadius: 10,
    padding: 15,
  },
  buttonText: {
    color: '#9381FF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerButton: {
    marginTop: 20,
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  checkboxChecked: {
    backgroundColor: '#FFFFFF',
  },
  rememberMeText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
}); 