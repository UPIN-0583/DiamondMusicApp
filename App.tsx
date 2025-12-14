import React, {useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  useColorScheme,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import PlayerScreen from './src/screens/PlayerScreen';
import PopularSongsScreen from './src/screens/PopularSongsScreen';
import FavouriteArtistsScreen from './src/screens/FavouriteArtistsScreen';
import TopPlaylistsScreen from './src/screens/TopPlaylistsScreen';
import PlaylistDetailScreen from './src/screens/PlaylistDetailScreen';
import ArtistDetailScreen from './src/screens/ArtistDetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import {SetupService} from './src/services/SetupService';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const runSetup = async () => {
      await SetupService();
    };
    runSetup();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Main"
              component={BottomTabNavigator}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Player"
              component={PlayerScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PopularSongs"
              component={PopularSongsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="FavouriteArtists"
              component={FavouriteArtistsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="TopPlaylists"
              component={TopPlaylistsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PlaylistDetail"
              component={PlaylistDetailScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ArtistDetail"
              component={ArtistDetailScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="SearchScreen"
              component={SearchScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="NotificationSettings"
              component={NotificationSettingsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
