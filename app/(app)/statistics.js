import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import { checkShowReviewInStats } from './components/StoreReview';
import { useTheme } from '../../app/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function StatisticsScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // On vérifie simplement si on doit montrer le popup
    checkShowReviewInStats();
    
    // Pour débugger
    console.log('StatisticsScreen mounted - checking review');

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const userId = auth.currentUser.uid;
      const docRef = doc(firestore, 'vehicles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const startDate = new Date(data.startDate);
        const today = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + data.leaseDuration);

        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const daysElapsed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        const totalAllowedKm = (data.yearlyKm * data.leaseDuration) / 12;
        const theoreticalKmPerDay = totalAllowedKm / totalDays;
        const actualKmPerDay = data.currentKm / daysElapsed;
        
        const theoreticalKmToDate = theoreticalKmPerDay * daysElapsed;
        const kmDifference = data.currentKm - theoreticalKmToDate;
        const predictedFinalKm = data.currentKm + (actualKmPerDay * daysLeft);

        setStats({
          currentKm: data.currentKm,
          totalAllowedKm,
          daysElapsed,
          daysLeft,
          totalDays,
          theoreticalKmPerDay: theoreticalKmPerDay.toFixed(1),
          actualKmPerDay: actualKmPerDay.toFixed(1),
          theoreticalKmToDate: Math.round(theoreticalKmToDate),
          kmDifference: Math.round(kmDifference),
          predictedFinalKm: Math.round(predictedFinalKm),
          startDate: startDate.toLocaleDateString(),
          endDate: endDate.toLocaleDateString(),
          lastUpdate: new Date(data.lastUpdate).toLocaleDateString(),
          percentageComplete: ((daysElapsed / totalDays) * 100).toFixed(1),
          percentageKmUsed: ((data.currentKm / totalAllowedKm) * 100).toFixed(1)
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de récupérer les statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.isDarkMode ? 
          ['#1A1A1A', '#2A2A2A'] : 
          ['#9381FF', '#B8B8FF', '#9381FF']}
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
          <Text style={styles.title}>Statistiques</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Progression générale */}
          <View style={[styles.card, {
            backgroundColor: theme.isDarkMode ? 
              'rgba(61, 61, 61, 0.3)' : 
              'rgba(248, 247, 255, 0.15)'
          }]}>
            <Text style={[styles.cardTitle, { color: '#FFD8BE' }]}>
              Progression générale
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${stats.percentageComplete}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {stats.percentageComplete}% du temps écoulé
            </Text>
            <Text style={styles.progressText}>
              {stats.percentageKmUsed}% du kilométrage utilisé
            </Text>
          </View>

          {/* Kilométrage */}
          <View style={[styles.card, {
            backgroundColor: theme.isDarkMode ? 
              'rgba(61, 61, 61, 0.3)' : 
              'rgba(248, 247, 255, 0.15)'
          }]}>
            <Text style={[styles.cardTitle, { color: '#FFD8BE' }]}>
              Kilométrage
            </Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Actuel:</Text>
              <Text style={styles.statValue}>{stats.currentKm} km</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Théorique à ce jour:</Text>
              <Text style={styles.statValue}>{stats.theoreticalKmToDate} km</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Différence:</Text>
              <Text style={[
                styles.statValue,
                stats.kmDifference > 0 ? styles.negative : styles.positive
              ]}>
                {stats.kmDifference > 0 ? '+' : ''}{stats.kmDifference} km
              </Text>
            </View>
          </View>

          {/* Moyennes */}
          <View style={[styles.card, {
            backgroundColor: theme.isDarkMode ? 
              'rgba(61, 61, 61, 0.3)' : 
              'rgba(248, 247, 255, 0.15)'
          }]}>
            <Text style={[styles.cardTitle, { color: '#FFD8BE' }]}>
              Moyennes quotidiennes
            </Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Théorique:</Text>
              <Text style={styles.statValue}>{stats.theoreticalKmPerDay} km/jour</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Réelle:</Text>
              <Text style={[
                styles.statValue,
                parseFloat(stats.actualKmPerDay) > parseFloat(stats.theoreticalKmPerDay) 
                  ? styles.negative 
                  : styles.positive
              ]}>
                {stats.actualKmPerDay} km/jour
              </Text>
            </View>
          </View>

          {/* Prévisions */}
          <View style={[styles.card, {
            backgroundColor: theme.isDarkMode ? 
              'rgba(61, 61, 61, 0.3)' : 
              'rgba(248, 247, 255, 0.15)'
          }]}>
            <Text style={[styles.cardTitle, { color: '#FFD8BE' }]}>
              Prévisions
            </Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Kilométrage final estimé:</Text>
              <Text style={[
                styles.statValue,
                stats.predictedFinalKm > stats.totalAllowedKm ? styles.negative : styles.positive
              ]}>
                {stats.predictedFinalKm} km
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Limite autorisée:</Text>
              <Text style={styles.statValue}>{stats.totalAllowedKm} km</Text>
            </View>
          </View>

          {/* Dates */}
          <View style={[styles.card, {
            backgroundColor: theme.isDarkMode ? 
              'rgba(61, 61, 61, 0.3)' : 
              'rgba(248, 247, 255, 0.15)'
          }]}>
            <Text style={[styles.cardTitle, { color: '#FFD8BE' }]}>
              Informations
            </Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Date de début:</Text>
              <Text style={styles.statValue}>{stats.startDate}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Date de fin:</Text>
              <Text style={styles.statValue}>{stats.endDate}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Dernière mise à jour:</Text>
              <Text style={styles.statValue}>{stats.lastUpdate}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  card: {
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    color: '#FFD8BE',
    marginBottom: 15,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(248, 247, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD8BE',
    borderRadius: 6,
  },
  progressText: {
    color: '#F8F7FF',
    fontSize: 14,
    marginTop: 5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    color: '#F8F7FF',
    opacity: 0.7,
    fontSize: 14,
  },
  statValue: {
    color: '#F8F7FF',
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#FF5252',
  },
}); 