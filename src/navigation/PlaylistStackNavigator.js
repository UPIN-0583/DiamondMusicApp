import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PlaylistScreen from '../screens/PlaylistScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';

const PlaylistStack = createNativeStackNavigator();

const PlaylistStackNavigator = () => {
  return (
    <PlaylistStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <PlaylistStack.Screen name="PlaylistMain" component={PlaylistScreen} />
      <PlaylistStack.Screen
        name="PlaylistDetail"
        component={PlaylistDetailScreen}
      />
    </PlaylistStack.Navigator>
  );
};

export default PlaylistStackNavigator;
