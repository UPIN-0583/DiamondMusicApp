import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Platform} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../themes/ThemeContext';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';

// Import Stack Navigators
import HomeStackNavigator from './HomeStackNavigator';
import FavouritesScreen from '../screens/FavouritesScreen';
import PlaylistStackNavigator from './PlaylistStackNavigator';
import AccountStackNavigator from './AccountStackNavigator';

const Tab = createBottomTabNavigator();

// Helper to hide tab bar on nested screens
const getTabBarVisibility = (route, colors) => {
  const routeName = getFocusedRouteNameFromRoute(route);

  // Screens where tab bar should be hidden
  const hideOnScreens = [
    // Home Stack screens
    'TopPlaylists',
    'PopularSongs',
    'FavouriteArtists',
    'SearchScreen',
    'AIChat',
    'RecommendedSongs',
    'PlaylistDetail',
    // Account Stack screens
    'ThemeSettings',
    'NotificationSettings',
    'ChangePassword',
  ];

  if (hideOnScreens.includes(routeName)) {
    return {display: 'none'};
  }

  return {
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 8,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  };
};

const BottomTabNavigator = () => {
  const {colors} = useTheme();

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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}>
      <Tab.Screen
        name="HomePage"
        component={HomeStackNavigator}
        options={({route}) => ({
          tabBarLabel: 'Trang chủ',
          tabBarStyle: getTabBarVisibility(route, colors),
        })}
      />
      <Tab.Screen
        name="Favourites"
        component={FavouritesScreen}
        options={{
          tabBarLabel: 'Yêu thích',
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            paddingTop: 8,
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: -2},
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
        }}
      />
      <Tab.Screen
        name="Playlist"
        component={PlaylistStackNavigator}
        options={({route}) => ({
          tabBarLabel: 'Playlist',
          tabBarStyle: getTabBarVisibility(route, colors),
        })}
      />
      <Tab.Screen
        name="Account"
        component={AccountStackNavigator}
        options={({route}) => ({
          tabBarLabel: 'Tài khoản',
          tabBarStyle: getTabBarVisibility(route, colors),
        })}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
