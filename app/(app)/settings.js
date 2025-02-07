import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { auth, firestore } from '../../firebaseConfig';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, query, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { testReviewPrompt } from './components/StoreReview';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
let baseWidth = Platform.OS === 'ios' ? 375 : 360;

if (Platform.OS === 'ios') {
  if (width >= 428) { // iPhone Pro Max
    baseWidth = 428;
  } else if (width >= 390) { // iPhone 14, 13, 12
    baseWidth = 390;
  }
} else {
  // Ajustement pour Android
  if (width >= 400) { // Grands écrans Android
    baseWidth = 400;
  } else if (width >= 320) { // Petits écrans Android
    baseWidth = 320;
  }
}

const scale = Math.min(width, height) / baseWidth;

export default function SettingsScreen() {
  const { theme } = useTheme();
  const [kmHistory, setKmHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const swipeableRefs = useRef(new Map()).current;
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchKmHistory();
  }, []);

  const fetchKmHistory = async () => {
    try {
      const userId = auth.currentUser.uid;
      const historyRef = collection(firestore, `vehicles/${userId}/history`);
      const q = query(historyRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setKmHistory(history);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userPassword');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
    }
  };

  const handleResetConfirmation = () => {
    Alert.alert(
      'Reconfigurer le véhicule',
      'Voulez-vous vraiment modifier les informations de votre véhicule ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Confirmer',
          onPress: handleReset
        }
      ]
    );
  };

  const handleReset = async () => {
    try {
      const userId = auth.currentUser.uid;
      // Supprimer les anciennes données
      await deleteDoc(doc(firestore, 'vehicles', userId));
      // Rediriger vers la page de configuration
      router.replace('/(app)/vehicle-config');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      Alert.alert('Erreur', 'Impossible de réinitialiser les données');
    }
  };

  const deleteHistoryEntry = async (entryId) => {
    try {
      const userId = auth.currentUser.uid;
      await deleteDoc(doc(firestore, `vehicles/${userId}/history/${entryId}`));
      // Mettre à jour l'état local
      setKmHistory(prevHistory => 
        prevHistory.filter(entry => entry.id !== entryId)
      );
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'entrée');
    }
  };

  const renderRightActions = (progress, dragX, entryId) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.deleteButton,
          {
            opacity,
            transform: [{ scale }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButtonContent}
          onPress={() => {
            Alert.alert(
              'Confirmation',
              'Voulez-vous vraiment supprimer cette entrée ?',
              [
                {
                  text: 'Annuler',
                  style: 'cancel'
                },
                {
                  text: 'Supprimer',
                  onPress: () => deleteHistoryEntry(entryId),
                  style: 'destructive'
                }
              ]
            );
          }}
        >
          <LinearGradient
            colors={['#FF5252', '#FF7676']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.deleteGradient}
          >
            <Ionicons name="trash-outline" size={24} color="#FFF" />
            <Text style={styles.deleteText}>Supprimer</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHistoryItem = (entry, index) => (
    <Swipeable
      ref={ref => {
        if (ref) {
          swipeableRefs.set(entry.id, ref);
        } else {
          swipeableRefs.delete(entry.id);
        }
      }}
      renderRightActions={(progress, dragX) => 
        renderRightActions(progress, dragX, entry.id)
      }
      rightThreshold={40}
      overshootRight={false}
      onSwipeableOpen={() => {
        setTimeout(() => {
          const ref = swipeableRefs.get(entry.id);
          if (ref) {
            ref.close();
          }
        }, 4000);
      }}
    >
      <Animated.View 
        style={[
          styles.historyItem,
          index !== kmHistory.length - 1 && styles.historyItemBorder
        ]}
      >
        <View style={styles.historyDate}>
          <Text style={styles.historyDateText}>
            {new Date(entry.timestamp).toLocaleDateString()}
          </Text>
          <Text style={styles.historyTimeText}>
            {new Date(entry.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        <Text style={styles.historyKm}>{entry.kilometers} km</Text>
      </Animated.View>
    </Swipeable>
  );

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              const userId = user.uid;

              // Supprimer les données du véhicule
              await deleteDoc(doc(firestore, 'vehicles', userId));

              // Supprimer l'historique
              const historyRef = collection(firestore, `vehicles/${userId}/history`);
              const historySnapshot = await getDocs(historyRef);
              const batch = writeBatch(firestore);
              
              historySnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
              });
              await batch.commit();

              // Supprimer le compte utilisateur
              await deleteUser(user);
              
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Erreur lors de la suppression du compte:', error);
              Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de la suppression du compte. Veuillez réessayer.'
              );
            }
          }
        }
      ]
    );
  };

  const handleReconfigureVehicle = () => {
    router.push('/vehicle-config');
  };

  const handleDeleteAllHistory = async () => {
    Alert.alert(
      'Supprimer l\'historique',
      'Êtes-vous sûr de vouloir supprimer tout l\'historique des kilomètres ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = auth.currentUser.uid;
              const historyRef = collection(firestore, `vehicles/${userId}/history`);
              const querySnapshot = await getDocs(historyRef);
              
              const batch = writeBatch(firestore);
              querySnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
              });
              await batch.commit();
              
              // Mettre à jour l'état local
              setKmHistory([]);
              Alert.alert('Succès', 'L\'historique a été supprimé avec succès');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'historique');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.isDarkMode ? 
          ['#1A1A1A', '#2A2A2A', '#1A1A1A'] : 
          ['#9381FF', '#B8B8FF', '#9381FF']
        }
        style={styles.background}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#F8F7FF" />
          </TouchableOpacity>
          <Text style={[styles.title, theme.isDarkMode && { color: theme.colors.text }]}>Paramètres</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compte</Text>
            <View style={[styles.card, theme.isDarkMode && { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.emailText, theme.isDarkMode && { color: theme.colors.text }]}>
                {auth.currentUser?.email}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TouchableOpacity 
                style={styles.sectionTitleContainer}
                onPress={() => setShowHistory(!showHistory)}
              >
                <Text style={styles.sectionTitle}>Historique des kilomètres</Text>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['rgba(255, 216, 190, 0.1)', 'rgba(255, 216, 190, 0.2)']}
                    style={styles.iconBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons 
                      name={showHistory ? "chevron-up" : "chevron-down"} 
                      size={14}
                      color="#FFD8BE" 
                    />
                  </LinearGradient>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteHistoryButton}
                onPress={handleDeleteAllHistory}
              >
                <LinearGradient
                  colors={['rgba(255, 82, 82, 0.1)', 'rgba(255, 82, 82, 0.2)']}
                  style={styles.iconBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF5252" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {showHistory && (
              <View style={[styles.historyCard, theme.isDarkMode && { backgroundColor: theme.colors.card }]}>
                {loading ? (
                  <ActivityIndicator color="#FFD8BE" />
                ) : kmHistory.length > 0 ? (
                  kmHistory.map((entry, index) => (
                    <View key={entry.id}>
                      {renderHistoryItem(entry, index)}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noHistoryText}>
                    Aucun historique disponible
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.configButton]}
              onPress={() => router.push('/(app)/vehicle-config')}
            >
              <LinearGradient
                colors={['rgba(255, 216, 190, 0.1)', 'rgba(255, 216, 190, 0.2)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="car" size={24} color="#FFD8BE" />
                <Text style={[styles.configText, { color: '#FFD8BE' }]}>Reconfigurer mon véhicule</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.configButton]}
              onPress={testReviewPrompt}
            >
              <LinearGradient
                colors={['rgba(255, 216, 190, 0.1)', 'rgba(255, 216, 190, 0.2)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="star" size={24} color="#FFD8BE" />
                <Text style={[styles.configText, { color: '#FFD8BE' }]}>Donnez votre avis</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}
            >
              <LinearGradient
                colors={['rgba(255, 82, 82, 0.1)', 'rgba(255, 82, 82, 0.2)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="log-out" size={24} color="#FF5252" />
                <Text style={[styles.logoutText, theme.isDarkMode && { color: theme.colors.text }]}>
                  Se déconnecter
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
            >
              <Text style={[styles.deleteAccountText, theme.isDarkMode && { color: theme.colors.text }]}>
                Supprimer mon compte
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20 * scale,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    color: '#F8F7FF',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFD8BE',
    fontWeight: '600',
    paddingTop: 0,
  },
  card: {
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  emailText: {
    color: '#F8F7FF',
    fontSize: 16,
  },
  button: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  buttonGradient: {
    height: 55 * scale,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15 * scale,
    paddingHorizontal: 20 * scale,
  },
  buttonText: {
    color: '#9381FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
  },
  logoutText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderRadius: 20,
    padding: 15,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(248, 247, 255, 0.1)',
  },
  historyDate: {
    flex: 1,
  },
  historyDateText: {
    color: '#F8F7FF',
    fontSize: 16,
    fontWeight: '500',
  },
  historyTimeText: {
    color: '#F8F7FF',
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  historyKm: {
    color: '#FFD8BE',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noHistoryText: {
    textAlign: 'center',
    opacity: 0.7,
    padding: 20,
  },
  deleteButton: {
    width: 100,
    height: '100%',
  },
  deleteButtonContent: {
    flex: 1,
    width: '100%',
  },
  deleteGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  deleteText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  deleteAccountButton: {
    padding: 10,
    marginTop: 5,
    alignItems: 'center',
  },
  deleteAccountText: {
    textDecorationLine: 'underline',
  },
  bottomButtonsContainer: {
    marginTop: 'auto',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  configButton: {
    marginBottom: 15,
  },
  configText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingTop: 8,
  },
  iconContainer: {
    marginLeft: 10,
    alignSelf: 'center',
    marginTop: 2,
  },
  iconBackground: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteHistoryButton: {
    marginLeft: 15,
  },
}); 