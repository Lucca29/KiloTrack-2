import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Animated 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = () => {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}>
      
      <Animated.View style={[
        styles.formContainer,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        },
      ]}>
        <Text style={styles.title}>KiloTrack</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#rgba(255,255,255,0.7)"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#rgba(255,255,255,0.7)"
          secureTextEntry
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '85%',
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#4c669f',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen; 