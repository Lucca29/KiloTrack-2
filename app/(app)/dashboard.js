import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

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

export default function DashboardScreen() {
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [newKmValue, setNewKmValue] = useState('');
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const calculateStats = (data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + data.leaseDuration);
    
    const today = new Date();
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    const daysSinceStart = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
    const averageKmPerDay = daysSinceStart > 0 
      ? (data.currentKm / daysSinceStart).toFixed(1)
      : 0;
      
    const predictedKmAtEnd = Math.round(
      data.currentKm + (parseFloat(averageKmPerDay) * daysLeft)
    );

    return {
      currentKm: data.currentKm,
      allowedKm: (data.yearlyKm * data.leaseDuration) / 12,
      daysLeft,
      averageKmPerDay,
      predictedKmAtEnd,
      lastUpdate: new Date(data.lastUpdate).toLocaleDateString(),
      leaseEndDate: endDate.toLocaleDateString()
    };
  };

  const fetchVehicleData = async () => {
    try {
      const userId = auth.currentUser.uid;
      const vehiclesRef = collection(firestore, 'vehicles');
      const userDocRef = doc(vehiclesRef, userId);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setVehicleData(calculateStats(data));
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      Alert.alert(
        'Erreur',
        'Impossible de récupérer les données du véhicule'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleData();
  }, []);

  const handleUpdateKm = async () => {
    if (!newKmValue) {
      Alert.alert('Erreur', 'Veuillez entrer une valeur');
      return;
    }

    const newKm = parseInt(newKmValue);
    
    if (newKm === vehicleData.currentKm) {
      Alert.alert('Erreur', 'La nouvelle valeur doit être différente de la valeur actuelle');
      return;
    }

    if (newKm < vehicleData.currentKm) {
      Alert.alert(
        'Confirmation',
        'La nouvelle valeur est inférieure à la valeur actuelle. Êtes-vous sûr de vouloir continuer ?',
        [
          {
            text: 'Annuler',
            style: 'cancel'
          },
          {
            text: 'Confirmer',
            onPress: () => updateKilometers(newKm)
          }
        ]
      );
    } else {
      updateKilometers(newKm);
    }
  };

  const updateKilometers = async (newKm) => {
    try {
      setUpdating(true);
      const userId = auth.currentUser.uid;
      const vehiclesRef = collection(firestore, 'vehicles');
      const userDocRef = doc(vehiclesRef, userId);
      
      // Récupérer d'abord les données complètes
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        throw new Error('Données non trouvées');
      }

      const currentData = docSnap.data();
      const updateData = {
        ...currentData,
        currentKm: newKm,
        lastUpdate: new Date().toISOString()
      };

      // Mettre à jour Firebase
      await updateDoc(userDocRef, {
        currentKm: newKm,
        lastUpdate: new Date().toISOString()
      });

      // Ajout dans l'historique
      const historyRef = collection(firestore, `vehicles/${userId}/history`);
      await addDoc(historyRef, {
        kilometers: newKm,
        timestamp: new Date().toISOString()
      });

      // Recalculer et mettre à jour toutes les statistiques
      setVehicleData(calculateStats(updateData));

      setIsUpdateModalVisible(false);
      setNewKmValue('');
      Alert.alert('Succès', 'Kilométrage mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le kilométrage');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !vehicleData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={['#9381FF', '#B8B8FF', '#9381FF']}
          style={styles.background}
        />
        <ActivityIndicator size="large" color="#FFD8BE" />
      </View>
    );
  }

  const calculateProgress = () => {
    return (vehicleData.currentKm / vehicleData.allowedKm) * 100;
  };

  const getStatusColor = () => {
    const progress = calculateProgress();
    if (progress < 80) return '#4CAF50';
    if (progress < 95) return '#FFC107';
    return '#FF5252';
  };

  const renderUpdateButton = () => (
    <TouchableOpacity 
      style={styles.actionButton}
      onPress={() => setIsUpdateModalVisible(true)}
    >
      <LinearGradient
        colors={['#FFD8BE', '#FFEEDD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.actionButtonGradient}
      >
        <Ionicons name="add-circle-outline" size={24} color="#9381FF" />
        <Text style={styles.actionButtonText}>Mettre à jour km</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderUpdateModal = () => (
    <Modal
      visible={isUpdateModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsUpdateModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mise à jour du kilométrage</Text>
            
            <View style={styles.currentKmContainer}>
              <Text style={styles.currentKmLabel}>Kilométrage actuel:</Text>
              <Text style={styles.currentKmValue}>{vehicleData?.currentKm} km</Text>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Nouveau kilométrage"
              placeholderTextColor="rgba(147, 129, 255, 0.5)"
              keyboardType="numeric"
              value={newKmValue}
              onChangeText={setNewKmValue}
              editable={!updating}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setIsUpdateModalVisible(false);
                  setNewKmValue('');
                }}
                disabled={updating}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleUpdateKm}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#9381FF" />
                ) : (
                  <Text style={styles.modalButtonText}>Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      {renderUpdateButton()}
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => router.push('/statistics')}
      >
        <LinearGradient
          colors={['#FFD8BE', '#FFEEDD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionButtonGradient}
        >
          <Ionicons name="analytics-outline" size={24} color="#9381FF" />
          <Text style={styles.actionButtonText}>Voir statistiques</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9381FF', '#B8B8FF', '#9381FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Tableau de bord</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="person-circle-outline" size={28} color="#FFD8BE" />
            </TouchableOpacity>
          </View>

          {/* Carte principale */}
          <View style={styles.mainCard}>
            <Text style={styles.mainCardTitle}>Progression kilométrique</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${calculateProgress()}%`,
                      backgroundColor: getStatusColor()
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {vehicleData.currentKm} km / {vehicleData.allowedKm} km
              </Text>
            </View>
          </View>

          {/* Grille de statistiques */}
          <View style={styles.statsGrid}>
            <View style={styles.statsCard}>
              <Ionicons name="calendar-outline" size={24} color="#9381FF" />
              <Text style={styles.statsValue}>{vehicleData.daysLeft}</Text>
              <Text style={styles.statsLabel}>Jours restants</Text>
            </View>
            <View style={styles.statsCard}>
              <Ionicons name="speedometer-outline" size={24} color="#9381FF" />
              <Text style={styles.statsValue}>{vehicleData.averageKmPerDay}</Text>
              <Text style={styles.statsLabel}>km/jour</Text>
            </View>
          </View>

          {/* Carte de prédiction */}
          <View style={styles.predictionCard}>
            <Text style={styles.predictionTitle}>Prévision finale</Text>
            <View style={styles.predictionContent}>
              <Text style={styles.predictionValue}>
                {vehicleData.predictedKmAtEnd} km
              </Text>
              <Text style={[
                styles.predictionStatus,
                { color: getStatusColor() }
              ]}>
                {vehicleData.predictedKmAtEnd > vehicleData.allowedKm ? 'Dépassement prévu' : 'Dans la limite'}
              </Text>
            </View>
          </View>

          {/* Boutons d'action */}
          {renderActionButtons()}

          {/* Informations supplémentaires */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Informations</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dernière mise à jour</Text>
              <Text style={styles.infoValue}>{vehicleData.lastUpdate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fin du leasing</Text>
              <Text style={styles.infoValue}>{vehicleData.leaseEndDate}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {renderUpdateModal()}
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
  scrollView: {
    flex: 1,
    padding: 20 * scale,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20 * scale,
  },
  title: {
    fontSize: 32 * scale,
    color: '#F8F7FF',
    fontWeight: 'bold',
    marginBottom: 10 * scale,
    textAlign: 'center',
  },
  settingsButton: {
    padding: 8 * scale,
  },
  mainCard: {
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderRadius: 20 * scale,
    padding: 20 * scale,
    marginBottom: 20 * scale,
  },
  mainCardTitle: {
    color: '#FFD8BE',
    fontSize: 18 * scale,
    marginBottom: 15 * scale,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 12 * scale,
    backgroundColor: 'rgba(248, 247, 255, 0.2)',
    borderRadius: 6 * scale,
    overflow: 'hidden',
    marginBottom: 10 * scale,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6 * scale,
  },
  progressText: {
    color: '#F8F7FF',
    fontSize: 16 * scale,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20 * scale,
  },
  statsCard: {
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderRadius: 15 * scale,
    padding: 15 * scale,
    width: (width - 60 * scale) / 2,
    alignItems: 'center',
  },
  statsValue: {
    color: '#F8F7FF',
    fontSize: 24 * scale,
    fontWeight: 'bold',
    marginVertical: 5 * scale,
  },
  statsLabel: {
    color: '#FFD8BE',
    fontSize: 14 * scale,
  },
  predictionCard: {
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderRadius: 20 * scale,
    padding: 20 * scale,
    marginBottom: 20 * scale,
  },
  predictionTitle: {
    color: '#FFD8BE',
    fontSize: 18 * scale,
    marginBottom: 10 * scale,
  },
  predictionContent: {
    alignItems: 'center',
  },
  predictionValue: {
    color: '#F8F7FF',
    fontSize: 32 * scale,
    fontWeight: 'bold',
    marginBottom: 5 * scale,
  },
  predictionStatus: {
    fontSize: 16 * scale,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 15 * scale,
    marginBottom: 20 * scale,
  },
  actionButton: {
    borderRadius: 15 * scale,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15 * scale,
    gap: 10 * scale,
  },
  actionButtonText: {
    color: '#9381FF',
    fontSize: 16 * scale,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderRadius: 20 * scale,
    padding: 20 * scale,
    marginBottom: 20 * scale,
  },
  infoTitle: {
    color: '#FFD8BE',
    fontSize: 18 * scale,
    marginBottom: 15 * scale,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10 * scale,
  },
  infoLabel: {
    color: '#F8F7FF',
    opacity: 0.7,
  },
  infoValue: {
    color: '#F8F7FF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#F8F7FF',
    borderRadius: 20 * scale,
    padding: 20 * scale,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20 * scale,
    color: '#9381FF',
    fontWeight: 'bold',
    marginBottom: 20 * scale,
  },
  currentKmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20 * scale,
    gap: 10 * scale,
  },
  currentKmLabel: {
    color: '#9381FF',
    fontSize: 16 * scale,
  },
  currentKmValue: {
    color: '#9381FF',
    fontSize: 16 * scale,
    fontWeight: 'bold',
  },
  modalInput: {
    width: '100%',
    height: 55 * scale,
    backgroundColor: 'rgba(147, 129, 255, 0.1)',
    borderRadius: 15 * scale,
    paddingHorizontal: 20 * scale,
    color: '#9381FF',
    fontSize: 16 * scale,
    borderWidth: 1,
    borderColor: 'rgba(147, 129, 255, 0.2)',
    marginBottom: 20 * scale,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15 * scale,
  },
  modalButton: {
    flex: 1,
    height: 45 * scale,
    borderRadius: 10 * scale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(147, 129, 255, 0.1)',
  },
  modalButtonConfirm: {
    backgroundColor: '#FFD8BE',
  },
  modalButtonText: {
    color: '#9381FF',
    fontSize: 16 * scale,
    fontWeight: 'bold',
  },
}); 