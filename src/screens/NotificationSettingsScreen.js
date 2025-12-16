import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '../themes/ThemeContext';

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const {colors} = useTheme();

  const [settings, setSettings] = useState({
    newSongs: true,
    artistUpdates: true,
    playlistUpdates: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading notification settings');
    }
  };

  const saveSettings = async newSettings => {
    try {
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY,
        JSON.stringify(newSettings),
      );
      setSettings(newSettings);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu cài đặt');
    }
  };

  const toggleSetting = key => {
    const newSettings = {...settings, [key]: !settings[key]};
    saveSettings(newSettings);
  };

  const SettingItem = ({icon, title, description, value, onToggle}) => (
    <View style={[styles.settingItem, {borderBottomColor: colors.border}]}>
      <View
        style={[
          styles.settingIconContainer,
          {backgroundColor: colors.primaryLight},
        ]}>
        <Icon name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, {color: colors.text}]}>{title}</Text>
        <Text
          style={[styles.settingDescription, {color: colors.textSecondary}]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{false: colors.border, true: colors.primaryLight}}
        thumbColor={value ? colors.primary : colors.textTertiary}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.surface}]}
      edges={['top']}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: colors.card}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Icon name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>
          Quản lý thông báo
        </Text>
        <View style={{width: 40}} />
      </View>

      {/* Settings List */}
      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>
          Thông báo đẩy
        </Text>

        <SettingItem
          icon="music-note-plus"
          title="Bài hát mới"
          description="Thông báo khi có bài hát mới từ nghệ sĩ yêu thích"
          value={settings.newSongs}
          onToggle={() => toggleSetting('newSongs')}
        />

        <SettingItem
          icon="account-music"
          title="Cập nhật nghệ sĩ"
          description="Thông báo tin tức từ nghệ sĩ bạn đang theo dõi"
          value={settings.artistUpdates}
          onToggle={() => toggleSetting('artistUpdates')}
        />

        <SettingItem
          icon="playlist-music"
          title="Playlist"
          description="Thông báo khi playlist được cập nhật"
          value={settings.playlistUpdates}
          onToggle={() => toggleSetting('playlistUpdates')}
        />
      </View>

      {/* Info */}
      <View style={[styles.infoBox, {backgroundColor: colors.surfaceVariant}]}>
        <Icon
          name="information-outline"
          size={18}
          color={colors.textSecondary}
        />
        <Text style={[styles.infoText, {color: colors.textSecondary}]}>
          Cài đặt sẽ được tự động lưu khi bạn thay đổi
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f9fa'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {fontSize: 18, fontWeight: 'bold', color: '#222'},

  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingContent: {flex: 1},
  settingTitle: {fontSize: 15, fontWeight: '500', color: '#333'},
  settingDescription: {fontSize: 12, color: '#888', marginTop: 2},

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  infoText: {fontSize: 12, color: '#888', marginLeft: 8},
});

export default NotificationSettingsScreen;
