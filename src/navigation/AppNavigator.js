import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PlayerScreen from '../screens/PlayerScreen';
import PopularSongsScreen from '../screens/PopularSongsScreen';
import FavouriteArtistsScreen from '../screens/FavouriteArtistsScreen';
import TopPlaylistsScreen from '../screens/TopPlaylistsScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import ArtistDetailScreen from '../screens/ArtistDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

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

      {/* Feature Screens */}
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{animation: 'slide_from_bottom'}}
      />
      <Stack.Screen name="PopularSongs" component={PopularSongsScreen} />
      <Stack.Screen
        name="FavouriteArtists"
        component={FavouriteArtistsScreen}
      />
      <Stack.Screen name="TopPlaylists" component={TopPlaylistsScreen} />
      <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
      <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />

      {/* Settings Screens */}
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
