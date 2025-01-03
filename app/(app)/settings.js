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
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { auth, firestore } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, deleteDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const [kmHistory, setKmHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const swipeableRefs = useRef(new Map()).current;

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
      router.replace('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#9381FF', '#B8B8FF', '#9381FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFD8BE" />
            </TouchableOpacity>
            <Text style={styles.title}>Mon Compte</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Compte</Text>
              <View style={styles.card}>
                <Text style={styles.emailText}>{auth.currentUser?.email}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historique des kilomètres</Text>
              <View style={styles.historyCard}>
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
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={handleResetConfirmation}
              >
                <LinearGradient
                  colors={['#FFD8BE', '#FFEEDD']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="refresh" size={24} color="#9381FF" />
                  <Text style={styles.buttonText}>Reconfigurer le véhicule</Text>
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
                  <Text style={styles.logoutText}>Se déconnecter</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
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
    marginBottom: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    gap: 10,
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
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
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
    color: '#F8F7FF',
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
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
}); 