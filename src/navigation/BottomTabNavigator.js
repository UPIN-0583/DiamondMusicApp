import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Platform} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import FavouritesScreen from '../screens/FavouritesScreen';
import PlaylistScreen from '../screens/PlaylistScreen';
import AccountScreen from '../screens/AccountScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'HomePage') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Favourites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Playlist') {
            iconName = focused ? 'playlist-music' : 'playlist-music-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 8,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}>
      <Tab.Screen
        name="HomePage"
        component={HomeScreen}
        options={{tabBarLabel: 'Trang chủ'}}
      />
      <Tab.Screen
        name="Favourites"
        component={FavouritesScreen}
        options={{tabBarLabel: 'Yêu thích'}}
      />
      <Tab.Screen
        name="Playlist"
        component={PlaylistScreen}
        options={{tabBarLabel: 'Playlist'}}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{tabBarLabel: 'Tài khoản'}}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
