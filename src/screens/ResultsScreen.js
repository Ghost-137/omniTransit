import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResultsScreen({ route, navigation }) {
  const { itineraries, destination } = route.params;

  const renderRouteLegs = (legs) => {
    return (
      <View style={styles.routeRow}>
        {legs.map((leg, index) => {
          let icon;

          if (leg.mode === 'WALK') {
            icon = <Ionicons name="walk" size={18} color="#666" />;
          } else if (leg.mode === 'BUS') {
            icon = <Ionicons name="bus" size={18} color="#007AC9" />;
          } else if (leg.mode === 'TRAM') {
            icon = <MaterialCommunityIcons name="tram" size={18} color="#009B77" />;
          } else if (leg.mode === 'RAIL') {
            icon = <Ionicons name="train" size={18} color="#8C4799" />;
          } else if (leg.mode === 'SUBWAY') {
            icon = <Ionicons name="subway" size={18} color="#FF6319" />;
          } else {
            icon = <Ionicons name="train-outline" size={18} color="#333" />;
          }

          const fromName = leg.from?.name || 'Origin';
          const toName = leg.to?.name || 'Destination';

          let routeName = '';
          if (leg.route) {
            routeName = leg.route.shortName;
          }

          let fromText = null;
          if (leg.mode !== 'WALK') {
            fromText = (
              <Text style={styles.legLabel}>(from {fromName}) </Text>
            );
          }

          let mainLabel;
          if (leg.mode === 'WALK') {
            mainLabel = (
              <Text style={styles.legLabel}>
                {' '}Walk (to {toName})
              </Text>
            );
          } else {
            mainLabel = (
              <Text style={styles.legLabel}>
                {' '}{routeName} (to {toName})
              </Text>
            );
          }

          let arrow = null;
          if (index < legs.length - 1) {
            arrow = <Text style={styles.arrowText}>➜</Text>;
          }

          return (
            <View key={index} style={styles.legContainer}>
              {fromText}
              {icon}
              {mainLabel}
              {arrow}
            </View>
          );
        })}
      </View>
    );
  };

  const renderTripCard = ({ item, index }) => {
    const totalMinutes = Math.round(item.duration / 60);
    const startTime = new Date(item.startTime).toLocaleTimeString('fi-FI', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = new Date(item.endTime).toLocaleTimeString('fi-FI', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTime}>Trip Option {index + 1}</Text>
            <Text style={styles.cardClock}>{startTime} ➜ {endTime}</Text>
          </View>
          <Text style={styles.cardDuration}>{totalMinutes} min</Text>
        </View>

        {renderRouteLegs(item.legs)}

        <Text style={styles.cardWalk}>
          Total walking: {Math.round(item.walkDistance)} meters
        </Text>
      </View>
    );
  };

  let destinationTitle = 'Destination';
  if (destination && destination.title) {
    destinationTitle = destination.title.split(',')[0];
  }

  return (
    <SafeAreaView style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.resultsTitle}>Routes to {destinationTitle}</Text>

        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={itineraries}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderTripCard}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  resultsContainer: { flex: 1, backgroundColor: '#F2F2F2' },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#DDD'
  },
  resultsTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  listContainer: { padding: 15 },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardTime: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardClock: { fontSize: 15, color: '#555', marginTop: 4, fontWeight: '500' },
  cardDuration: { fontSize: 16, fontWeight: 'bold', color: '#007AC9' },
  cardWalk: { fontSize: 14, color: '#777' },
  routeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12
  },
  legContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4
  },
  legLabel: { fontSize: 14, fontWeight: '600', color: '#444', marginLeft: 4 },
  arrowText: { fontSize: 12, color: '#AAA', marginHorizontal: 6 },
});