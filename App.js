import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import TicketsScreen from './src/screens/TicketsScreen';
import RoutesScreen from './src/screens/RoutesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: true}}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Tickets" component={TicketsScreen} />
        <Tab.Screen name="Routes" component={RoutesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
