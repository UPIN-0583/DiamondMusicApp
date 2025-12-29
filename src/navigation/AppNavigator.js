import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PlayerScreen from '../screens/PlayerScreen';
import ArtistDetailScreen from '../screens/ArtistDetailScreen';

// Navigators
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      {/* Auth Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* Main App */}
      <Stack.Screen name="Main" component={BottomTabNavigator} />

      {/* Shared/Global Screens */}
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{animation: 'slide_from_bottom'}}
      />
      <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
