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
  TouchableWithoutFeedback,
  Dimensions,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, firestore } from '../../firebaseConfig';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';

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
      const docRef = doc(firestore, 'vehicles', userId);
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
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <View style={styles.datePickerWrapper}>
          <Text style={styles.dateLabel}>Date du début du leasing</Text>
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={startDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              style={styles.datePicker}
            />
          </View>
        </View>
      );
    }

    return showDatePicker && (
      <DateTimePicker
        value={startDate}
        mode="date"
        display="default"
        onChange={handleDateChange}
      />
    );
  };

  const handleSubmit = async () => {
    if (!currentKm || !yearlyKm || !leaseDuration) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      const vehicleData = {
        startDate: startDate.toISOString(),
        currentKm: parseInt(currentKm),
        yearlyKm: parseInt(yearlyKm),
        leaseDuration: parseInt(leaseDuration),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(firestore, 'vehicles', user.uid), vehicleData);
      
      const historyRef = collection(firestore, `vehicles/${user.uid}/history`);
      await addDoc(historyRef, {
        km: parseInt(currentKm),
        timestamp: new Date().toISOString(),
        type: isUpdate ? 'update' : 'initial'
      });

      router.replace('/(app)/dashboard');
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
              {Platform.OS === 'android' && (
                <TouchableOpacity 
                  style={[styles.dateButton, focusedInput === 'date' && styles.inputFocused]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    Date du début du leasing: {startDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              )}

              {renderDatePicker()}
              
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
    gap: 20,
  },
  title: {
    fontSize: 32 * scale,
    color: '#F8F7FF',
    fontWeight: 'bold',
    marginBottom: 10 * scale,
    textAlign: 'center',
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
    height: 55 * scale,
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderRadius: 15 * scale,
    paddingHorizontal: 20 * scale,
    color: '#F8F7FF',
    fontSize: 16 * scale,
    borderWidth: 1,
    borderColor: '#F8F7FF',
    marginBottom: 15 * scale,
  },
  inputFocused: {
    borderColor: '#F8F7FF',
    borderWidth: 1,
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
    height: 55 * scale,
    borderRadius: 15 * scale,
    overflow: 'hidden',
    marginTop: 20 * scale,
  },
  buttonGradient: {
    height: 55 * scale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#9381FF',
    fontSize: 18 * scale,
    fontWeight: 'bold',
  },
  datePickerWrapper: {
    marginBottom: 15,
  },
  dateLabel: {
    color: '#FFD8BE',
    fontSize: 16,
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  datePickerContainer: {
    backgroundColor: 'rgba(248, 247, 255, 0.15)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(248, 247, 255, 0.2)',
    overflow: 'hidden',
  },
  datePicker: {
    height: 120,
    width: '100%',
  },
}); 