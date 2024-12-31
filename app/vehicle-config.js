import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function VehicleConfigScreen() {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentKm, setCurrentKm] = useState('');
  const [yearlyKm, setYearlyKm] = useState('');
  const [leaseDuration, setLeaseDuration] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    checkExistingData();
  }, []);

  const checkExistingData = async () => {
    try {
      const userId = auth.currentUser.uid;
      const docRef = doc(db, 'vehicles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setStartDate(new Date(data.startDate));
        setCurrentKm(data.currentKm.toString());
        setYearlyKm(data.yearlyKm.toString());
        setLeaseDuration(data.leaseDuration.toString());
        setIsUpdate(true);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const showDateSelector = () => {
    setShowDatePicker(true);
  };

  const handleSubmit = async () => {
    if (!currentKm || !yearlyKm || !leaseDuration) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const userId = auth.currentUser.uid;
      
      const vehicleData = {
        startDate: startDate.toISOString(),
        currentKm: parseInt(currentKm),
        yearlyKm: parseInt(yearlyKm),
        leaseDuration: parseInt(leaseDuration),
        lastUpdate: new Date().toISOString(),
        createdAt: isUpdate ? undefined : new Date().toISOString()
      };

      await setDoc(doc(db, 'vehicles', userId), vehicleData, { merge: true });
      
      console.log('Configuration sauvegardée');
      router.replace('/dashboard');
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde');
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
            <Text style={styles.title}>
              {isUpdate ? 'Modifier' : 'Configuration'}
            </Text>
            <Text style={styles.subtitle}>
              {isUpdate ? 'Modifier les informations' : 'Informations du véhicule'}
            </Text>
            
            <View style={styles.inputContainer}>
              <TouchableOpacity 
                style={[styles.dateButton, focusedInput === 'date' && styles.inputFocused]}
                onPress={showDateSelector}
              >
                <Text style={styles.dateButtonText}>
                  Date de début: {startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              )}
              
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'currentKm' && styles.inputFocused
                ]}
                placeholder="Kilométrage actuel"
                placeholderTextColor="rgba(147, 129, 255, 0.5)"
                onFocus={() => setFocusedInput('currentKm')}
                onBlur={() => setFocusedInput(null)}
                value={currentKm}
                onChangeText={setCurrentKm}
                keyboardType="numeric"
                editable={!loading}
              />
              
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'yearlyKm' && styles.inputFocused
                ]}
                placeholder="Kilométrage annuel autorisé"
                placeholderTextColor="rgba(147, 129, 255, 0.5)"
                onFocus={() => setFocusedInput('yearlyKm')}
                onBlur={() => setFocusedInput(null)}
                value={yearlyKm}
                onChangeText={setYearlyKm}
                keyboardType="numeric"
                editable={!loading}
              />

              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'leaseDuration' && styles.inputFocused
                ]}
                placeholder="Durée du leasing (en mois)"
                placeholderTextColor="rgba(147, 129, 255, 0.5)"
                onFocus={() => setFocusedInput('leaseDuration')}
                onBlur={() => setFocusedInput(null)}
                value={leaseDuration}
                onChangeText={setLeaseDuration}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
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
                  <Text style={styles.buttonText}>
                    {isUpdate ? 'Mettre à jour' : 'Confirmer'}
                  </Text>
                )}
              </LinearGradient>
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
  dateButton: {
    height: 55,
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderRadius: 15,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248, 247, 255, 0.2)'
  },
  dateButtonText: {
    color: '#F8F7FF',
    fontSize: 16
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
  }
}); 