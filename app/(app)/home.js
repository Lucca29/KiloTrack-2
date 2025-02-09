import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../app/context/ThemeContext';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.isDarkMode ? 
          ['#1A1A1A', '#2A2A2A'] : 
          ['#9381FF', '#B8B8FF', '#9381FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Bienvenue !
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>
            {auth.currentUser?.email}
          </Text>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LinearGradient
              colors={theme.isDarkMode ? 
                ['#3D3D3D', '#2A2A2A'] : 
                ['#FFD8BE', '#FFEEDD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={[styles.buttonText, { 
                color: theme.isDarkMode ? '#FFD8BE' : '#9381FF' 
              }]}>
                Se déconnecter
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    color: '#F8F7FF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFD8BE',
    marginBottom: 30,
  },
  logoutButton: {
    width: '100%',
    height: 55,
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 20,
  },
  buttonGradient: {
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#9381FF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 