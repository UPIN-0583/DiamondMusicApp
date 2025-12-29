import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AccountScreen from '../screens/AccountScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

const AccountStack = createNativeStackNavigator();

const AccountStackNavigator = () => {
  return (
    <AccountStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <AccountStack.Screen name="AccountMain" component={AccountScreen} />
      <AccountStack.Screen
        name="ThemeSettings"
        component={ThemeSettingsScreen}
      />
      <AccountStack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
      <AccountStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
      />
    </AccountStack.Navigator>
  );
};

export default AccountStackNavigator;
