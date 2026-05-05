import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [activeRegion, setActiveRegion] = useState('Helsinki');
  const [isAddressesUnlocked, setIsAddressesUnlocked] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const renderRegionButton = (regionName, iconName) => {
    const isActive = activeRegion === regionName;

    return (
      <TouchableOpacity
        style={[styles.regionCard, isActive && styles.regionCardActive]}
        onPress={async () => {
          setActiveRegion(regionName);
          await AsyncStorage.setItem('@active_region', regionName);
        }}
      >
        <Ionicons name={iconName} size={24} color={isActive ? '#007AC9' : '#666'} />
        <Text style={[styles.regionText, isActive && styles.regionTextActive]}>
          {regionName}
        </Text>
      </TouchableOpacity>
    );
  };

  const loadAddresses = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@saved_places');
      if (jsonValue !== null) {
        setSavedAddresses(JSON.parse(jsonValue));
      } else {
        const defaultData = [
          { id: '1', title: 'Home', address: 'Mannerheimintie 1', icon: 'home' },
          { id: '2', title: 'Work', address: 'Pasilan asema', icon: 'briefcase' }
        ];
        setSavedAddresses(defaultData);
        await AsyncStorage.setItem('@saved_places', JSON.stringify(defaultData));
      }
    } catch (e) {
      console.error('Error loading addresses', e);
    }
  };

  const saveCustomAddress = async () => {
    if (!newTitle.trim() || !newAddress.trim()) {
      Alert.alert('Missing Info', 'Please enter both a title and an address.');
      return;
    }

    const newPlace = {
      id: Date.now().toString(),
      title: newTitle,
      address: newAddress,
      icon: 'location'
    };

    const updatedList = [...savedAddresses, newPlace];
    setSavedAddresses(updatedList);

    try {
      await AsyncStorage.setItem('@saved_places', JSON.stringify(updatedList));
      setNewTitle('');
      setNewAddress('');
      setIsAddingNew(false);
    } catch (e) {
      console.error('Error saving address', e);
    }
  };

  const deleteAddress = async (idToRemove) => {
    const filteredList = savedAddresses.filter(place => place.id !== idToRemove);
    setSavedAddresses(filteredList);

    try {
      await AsyncStorage.setItem('@saved_places', JSON.stringify(filteredList));
    } catch (e) {
      console.error('Error deleting address', e);
    }
  };

  const handleUnlockAddresses = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return Alert.alert('Error', 'Your device does not support biometrics.');

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) return Alert.alert('Error', 'No biometrics set up on this device.');

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Saved Addresses',
      fallbackLabel: 'Use PIN',
    });

    if (result.success) {
      await loadAddresses();
      setIsAddressesUnlocked(true);
    } else {
      Alert.alert('Failed', 'We could not verify your identity.');
    }
  };

  let placesContent;
  if (!isAddressesUnlocked) {
    placesContent = (
      <TouchableOpacity style={styles.lockedButton} onPress={handleUnlockAddresses}>
        <Ionicons name="lock-closed" size={20} color="#FFF" style={{ marginRight: 10 }} />
        <Text style={styles.lockedButtonText}>Unlock Saved Addresses</Text>
      </TouchableOpacity>
    );
  } else {
    let addSection;
    if (isAddingNew) {
      addSection = (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title (Gym, School)"
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Address (Ratapihantie 13)"
            value={newAddress}
            onChangeText={setNewAddress}
          />

          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddingNew(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={saveCustomAddress}>
              <Text style={styles.saveBtnText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      addSection = (
        <TouchableOpacity style={styles.addAddressRow} onPress={() => setIsAddingNew(true)}>
          <Ionicons name="add-circle-outline" size={24} color="#007AC9" />
          <Text style={styles.addAddressText}>Add New Address</Text>
        </TouchableOpacity>
      );
    }

    const savedList = [];
    for (let i = 0; i < savedAddresses.length; i++) {
      const place = savedAddresses[i];
      savedList.push(
        <View key={place.id} style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Ionicons name={place.icon} size={24} color="#007AC9" />
            <View style={styles.addressTextBlock}>
              <Text style={styles.settingLabelTitle}>{place.title}</Text>
              <Text style={styles.settingLabelSub}>{place.address}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => deleteAddress(place.id)}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      );
    }

    placesContent = (
      <View style={styles.unlockedContainer}>
        {savedList}
        {addSection}
      </View>
    );
  }

  let lockButton = null;
  if (isAddressesUnlocked) {
    lockButton = (
      <TouchableOpacity onPress={() => setIsAddressesUnlocked(false)}>
        <Text style={styles.lockText}>Lock</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.headerTitle}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVE REGION</Text>
          <View style={styles.regionContainer}>
            {renderRegionButton('Helsinki', 'business')}
            {renderRegionButton('Tampere', 'train')}
            {renderRegionButton('Turku', 'boat')}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.placesHeader}>
            <Text style={styles.sectionTitle}>MY PLACES</Text>
            {lockButton}
          </View>

          {placesContent}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Main screen background
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },

  // Page title at the top
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
  },

  // Each section on the screen
  section: {
    marginBottom: 30,
  },

  // ACTIVE REGION
  sectionTitle: {
    fontSize: 13,
    color: '#888',
    marginLeft: 20,
    marginBottom: 10,
    letterSpacing: 1,
  },

  // Holds the region cards in a row
  regionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
  },

  // One region card
  regionCard: {
    backgroundColor: '#FFF',
    width: '30%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',

    // Shadow for iPhone
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 2,
  },

  // Style for the selected region card
  regionCardActive: {
    borderColor: '#007AC9',
    borderWidth: 2,
    backgroundColor: '#F0F8FF',
  },

  // Text inside each region card
  regionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  // Text style when region is selected
  regionTextActive: {
    color: '#007AC9',
    fontWeight: 'bold',
  },

  // Header row for "MY PLACES" and "Lock"
  placesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },

  // Lock text
  lockText: {
    color: '#007AC9',
    fontWeight: 'bold',
    marginBottom: 10,
  },

  // Button shown when places are locked
  lockedButton: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 12,
  },

  // Text inside the locked button
  lockedButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Container for unlocked content
  unlockedContainer: {
    borderTopWidth: 1,
    borderColor: '#E5E5E5',
  },

  // One saved place row
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },

  // Left side of the row: icon + text
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // Title and address text block
  addressTextBlock: {
    marginLeft: 15,
    flex: 1,
  },

  // Place title, like "Home" or "Work"
  settingLabelTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },

  // Address below the title
  settingLabelSub: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  // Row for the "Add New Address" button
  addAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },

  // Text for the add address button
  addAddressText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#007AC9',
    fontWeight: '500',
  },

  // Form container for adding a new address
  formContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },

  // Input fields
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },

  // Row for Cancel and Save buttons
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },

  // Cancel button
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },

  // Cancel button text
  cancelBtnText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },

  // Save button
  saveBtn: {
    backgroundColor: '#007AC9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  // Save button text
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
