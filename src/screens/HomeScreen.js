import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator
} from 'react-native';

const API_KEY = '47a03e232dcd44418f80b3ab2993fb5f';

export default function HomeScreen() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiveAlerts = async () => {
    try {
      const response = await fetch('https://api.digitransit.fi/routing/v2/hsl/gtfs/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'digitransit-subscription-key': API_KEY,
        },
        body: JSON.stringify({
          query: `
            {
              alerts {
                alertHeaderText
                effectiveStartDate
              }
            }
          `
        }),
      });

      const json = await response.json();

      if (json.data && json.data.alerts) {
        const formattedNews = json.data.alerts.map((alert, index) => {
          const dateObj = new Date(alert.effectiveStartDate * 1000);
          const finnishDate = `${dateObj.getDate()}.${dateObj.getMonth() + 1}.${dateObj.getFullYear()}`;

          return {
            id: index.toString(),
            category: 'Live Alert',
            title: alert.alertHeaderText,
            date: finnishDate,
          };
        });

        setNews(formattedNews);
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveAlerts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLiveAlerts();
  };

  const renderNewsCard = ({ item }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardCategory}>
          {item.category} | <Text style={styles.cardTitle}>{item.title}</Text>
        </Text>
        <Text style={styles.cardDate}>{item.date}</Text>
      </View>
    );
  };

  let content;

  if (loading) {
    content = (
      <ActivityIndicator
        size="large"
        color="#007AC9"
        style={styles.loader}
      />
    );
  } else {
    content = (
      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        renderItem={renderNewsCard}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AC9"
          />
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>NEWS</Text>
      </View>

      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },

  loader: {
    marginTop: 50,
  },

  listContainer: {
    padding: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  cardCategory: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },

  cardTitle: {
    fontWeight: 'bold',
    color: '#333',
  },

  cardDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
});