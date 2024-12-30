import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Page() {
  const [focusedInput, setFocusedInput] = useState(null);

  const handleLogin = () => {
    console.log('Login clicked');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  return (
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
          <Text style={styles.subtitle}>Commencez votre voyage</Text>
          
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
            />
          </View>

          <View style={styles.button}>
            <TouchableOpacity onPress={handleLogin}>
              <LinearGradient
                colors={['#FFD8BE', '#FFEEDD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Se connecter</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={handleForgotPassword}
            style={styles.forgotPasswordButton}
          >
            <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
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
  forgotPasswordButton: {
    padding: 10
  },
  forgotPassword: {
    color: '#FFD8BE',
    textAlign: 'center',
    fontSize: 14
  }
});