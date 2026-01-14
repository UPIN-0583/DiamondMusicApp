import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {logout, clearCredentials} from '../redux/slices/authSlice';
import {getUserStats} from '../services/api';
import {usePlayerStore} from '../store/usePlayerStore';
import {useTheme} from '../themes/ThemeContext';

const AccountScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {colors} = useTheme();
  const {user, token} = useSelector(state => state.auth);
  const {resetPlayer} = usePlayerStore();

  const [stats, setStats] = useState({
    likedSongsCount: 0,
    likedArtistsCount: 0,
    playlistsCount: 0,
  });

  // Fetch stats on screen focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        getUserStats(token)
          .then(res => {
            if (res.success) {
              setStats(res.stats);
            }
          })
          .catch(() => {});
      }
    }, [token]),
  );

  const handlePress = feature => {
    Alert.alert('Thông báo', `Tính năng "${feature}" đang được phát triển`);
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          // Reset player state central
          await resetPlayer();

          // Clear stored credentials from AsyncStorage
          await clearCredentials();

          // Logout
          dispatch(logout());
          navigation.reset({
            index: 0,
            routes: [{name: 'Login'}],
          });
        },
      },
    ]);
  };

  const MenuItem = ({icon, title, subtitle, onPress, showArrow = true}) => (
    <TouchableOpacity
      style={[styles.menuItem, {borderBottomColor: colors.border}]}
      onPress={onPress}>
      <View
        style={[
          styles.menuIconContainer,
          {backgroundColor: colors.primaryLight},
        ]}>
        <Icon name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, {color: colors.text}]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, {color: colors.textSecondary}]}>
            {subtitle}
          </Text>
        )}
      </View>
      {showArrow && (
        <Icon name="chevron-right" size={24} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.surface}]}>
      {/* Profile Header */}
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.profileHeader}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.avatarContainer}>
          {user?.avatar_url ? (
            <Image source={{uri: user.avatar_url}} style={styles.avatarImage} />
          ) : (
            <Icon name="account-circle" size={80} color="#fff" />
          )}
        </View>
        <Text style={styles.userName}>{user?.username || 'Người dùng'}</Text>
        <Text style={styles.userEmail}>
          {user?.email || 'user@diamondmusic.com'}
        </Text>
      </LinearGradient>

      {/* Stats Section */}
      <View style={[styles.statsContainer, {backgroundColor: colors.card}]}>
        <View style={styles.statItem}>
          <Icon name="account-heart" size={28} color={colors.primary} />
          <Text style={[styles.statNumber, {color: colors.text}]}>
            {stats.likedArtistsCount}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            Nghệ sĩ
          </Text>
        </View>
        <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
        <View style={styles.statItem}>
          <Icon name="playlist-music" size={28} color={colors.primary} />
          <Text style={[styles.statNumber, {color: colors.text}]}>
            {stats.playlistsCount}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            Playlist
          </Text>
        </View>
        <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
        <View style={styles.statItem}>
          <Icon name="heart" size={28} color={colors.primary} />
          <Text style={[styles.statNumber, {color: colors.text}]}>
            {stats.likedSongsCount}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            Yêu thích
          </Text>
        </View>
      </View>

      {/* Menu Sections */}
      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>
          Cài đặt
        </Text>
        <MenuItem
          icon="shield-account"
          title="Bảo mật"
          subtitle="Đổi mật khẩu"
          onPress={() => navigation.navigate('ChangePassword')}
        />
        <MenuItem
          icon="bell"
          title="Thông báo"
          subtitle="Quản lý thông báo"
          onPress={() => navigation.navigate('NotificationSettings')}
        />
        <MenuItem
          icon="palette"
          title="Giao diện"
          subtitle="Tùy chỉnh giao diện"
          onPress={() => navigation.navigate('ThemeSettings')}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          {backgroundColor: colors.card, borderColor: colors.error},
        ]}
        onPress={handleLogout}>
        <Icon name="logout" size={20} color={colors.error} />
        <Text style={[styles.logoutText, {color: colors.error}]}>
          Đăng xuất
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f9fa'},
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {marginBottom: 15},
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5},
  userEmail: {fontSize: 14, color: '#fff', opacity: 0.9},
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: {flex: 1, alignItems: 'center'},
  statDivider: {width: 1, backgroundColor: '#eee'},
  statNumber: {fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 8},
  statLabel: {fontSize: 12, color: '#666', marginTop: 4},
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {flex: 1},
  menuTitle: {fontSize: 16, fontWeight: '500', color: '#333'},
  menuSubtitle: {fontSize: 12, color: '#666', marginTop: 2},
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff3b30',
    marginLeft: 10,
  },
  bottomPadding: {height: 100},
});

export default AccountScreen;
