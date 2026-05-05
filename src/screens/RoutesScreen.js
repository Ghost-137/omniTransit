import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = '47a03e232dcd44418f80b3ab2993fb5f';

export default function RoutesScreen({ navigation }) {
  const [mapRegion, setMapRegion] = useState({
    latitude: 60.1699,
    longitude: 24.9384,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [destination, setDestination] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('https://api.digitransit.fi/routing/v2/hsl/gtfs/v1');

  useEffect(() => {
    const loadSettingsAndGPS = async () => {
      const storedRegion = await AsyncStorage.getItem('@active_region');
      let savedRegion = 'Helsinki';

      if (storedRegion) {
        savedRegion = storedRegion;
      }

      if (savedRegion === 'Helsinki') {
        setApiEndpoint('https://api.digitransit.fi/routing/v2/hsl/gtfs/v1');
      } else {
        setApiEndpoint('https://api.digitransit.fi/routing/v2/waltti/gtfs/v1');
      }

      let permissionResult = await Location.requestForegroundPermissionsAsync();
      let status = permissionResult.status;

      if (status !== 'granted') {
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      let myLat = currentLocation.coords.latitude;
      let myLon = currentLocation.coords.longitude;

      if (savedRegion === 'Tampere') {
        myLat = 61.4978;
        myLon = 23.7610;
      } else if (savedRegion === 'Turku') {
        myLat = 60.4518;
        myLon = 22.2666;
      }

      setUserLocation({ latitude: myLat, longitude: myLon });
      setMapRegion({
        latitude: myLat,
        longitude: myLon,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    };

    const unsubscribe = navigation.addListener('focus', () => {
      loadSettingsAndGPS();
    });

    return unsubscribe;
  }, [navigation]);

  const searchAndRoute = async () => {
    if (!searchQuery.trim() || !userLocation) {
      return;
    }

    setIsSearching(true);

    try {
      const geoResponse = await fetch(
        `https://api.digitransit.fi/geocoding/v1/search?text=${searchQuery}&size=1`,
        {
          headers: { 'digitransit-subscription-key': API_KEY }
        }
      );

      const geoJson = await geoResponse.json();

      if (geoJson.features && geoJson.features.length > 0) {
        const [destLon, destLat] = geoJson.features[0].geometry.coordinates;
        const placeName = geoJson.features[0].properties.label;

        const newDest = {
          latitude: destLat,
          longitude: destLon,
          title: placeName
        };

        setDestination(newDest);

        const routeResponse = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'digitransit-subscription-key': API_KEY
          },
          body: JSON.stringify({
            query: `
              {
                plan(
                  from: {lat: ${userLocation.latitude}, lon: ${userLocation.longitude}}
                  to: {lat: ${destLat}, lon: ${destLon}}
                  numItineraries: 5
                ) {
                  itineraries {
                    startTime
                    endTime
                    duration
                    walkDistance
                    legs {
                      mode
                      duration
                      route {
                        shortName
                      }
                      from {
                        name
                      }
                      to {
                        name
                      }
                    }
                  }
                }
              }
            `
          }),
        });

        const routeJson = await routeResponse.json();

        if (routeJson.data && routeJson.data.plan.itineraries.length > 0) {
          navigation.navigate('Results', {
            itineraries: routeJson.data.plan.itineraries,
            destination: newDest
          });
        } else {
          alert('No transit routes found.');
        }
      } else {
        alert('Location not found.');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  let destinationMarker = null;
  if (destination) {
    destinationMarker = (
      <Marker
        coordinate={destination}
        title={destination.title}
        pinColor="red"
      />
    );
  }

  let searchIconContent;
  if (isSearching) {
    searchIconContent = (
      <ActivityIndicator
        size="small"
        color="#007AC9"
        style={styles.searchIcon}
      />
    );
  } else {
    searchIconContent = (
      <Ionicons
        name="search"
        size={20}
        color="#666"
        style={styles.searchIcon}
      />
    );
  }

  let clearButton = null;
  if (searchQuery.length > 0) {
    clearButton = (
      <TouchableOpacity
        onPress={() => {
          setSearchQuery('');
          setDestination(null);
        }}
      >
        <Ionicons name="close-circle" size={20} color="#999" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        mapType="none"
      >
        <UrlTile
          urlTemplate={`https://cdn.digitransit.fi/map/v3/hsl-map/{z}/{x}/{y}.png?digitransit-subscription-key=${API_KEY}`}
          maximumZ={19}
          tileSize={256}
        />

        {destinationMarker}
      </MapView>

      <View style={styles.searchContainer}>
        {searchIconContent}

        <TextInput
          style={styles.searchInput}
          placeholder="Where do you want to go?"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={searchAndRoute}
        />

        {clearButton}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' }
});