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
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';

function LoginScreen() {
  const [focusedInput, setFocusedInput] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterPress = () => {
    console.log('Navigation vers Register');
    router.push('/register');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Vérifier si l'utilisateur a déjà configuré son véhicule
      const userId = userCredential.user.uid;
      const vehicleRef = doc(db, 'vehicles', userId);
      const vehicleDoc = await getDoc(vehicleRef);

      if (vehicleDoc.exists()) {
        // Si les données du véhicule existent, aller directement au dashboard
        router.replace('/dashboard');
      } else {
        // Sinon, aller à la page de configuration
        router.replace('/vehicle-config');
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
            <Text style={styles.title}>KiloTrack</Text>
            <Text style={styles.subtitle}>Suivez vos kilomètres comme des rois !</Text>
            
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
              onPress={handleRegisterPress}
            >
              <Text style={styles.registerText}>
                Pas de compte ? S'inscrire
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
    justifyContent: 'center',
    alignItems: 'center'
  },
  formContainer: {
    width: '88%',
    padding: 25,
    borderRadius: 30,
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248, 247, 255, 0.3)'
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
  registerButton: {
    padding: 10,
    marginTop: 5
  },
  registerText: {
    color: '#FFD8BE',
    textAlign: 'center',
    fontSize: 14
  }
});

export default LoginScreen;