import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import TopPlaylistsScreen from '../screens/TopPlaylistsScreen';
import PopularSongsScreen from '../screens/PopularSongsScreen';
import FavouriteArtistsScreen from '../screens/FavouriteArtistsScreen';
import SearchScreen from '../screens/SearchScreen';
import AIChatScreen from '../screens/AIChatScreen';
import RecommendedSongsScreen from '../screens/RecommendedSongsScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';

const HomeStack = createNativeStackNavigator();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="TopPlaylists" component={TopPlaylistsScreen} />
      <HomeStack.Screen name="PopularSongs" component={PopularSongsScreen} />
      <HomeStack.Screen
        name="FavouriteArtists"
        component={FavouriteArtistsScreen}
      />
      <HomeStack.Screen name="SearchScreen" component={SearchScreen} />
      <HomeStack.Screen name="AIChat" component={AIChatScreen} />
      <HomeStack.Screen
        name="RecommendedSongs"
        component={RecommendedSongsScreen}
      />
      <HomeStack.Screen
        name="PlaylistDetail"
        component={PlaylistDetailScreen}
      />
    </HomeStack.Navigator>
  );
};

export default HomeStackNavigator;
