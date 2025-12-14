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
import {logout} from '../redux/slices/authSlice';
import {getUserStats} from '../services/api';

const AccountScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {user, token} = useSelector(state => state.auth);

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
        onPress: () => {
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
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Icon name={icon} size={24} color="#2196F3" />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && <Icon name="chevron-right" size={24} color="#ccc" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
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
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="account-heart" size={28} color="#2196F3" />
          <Text style={styles.statNumber}>{stats.likedArtistsCount}</Text>
          <Text style={styles.statLabel}>Nghệ sĩ</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="playlist-music" size={28} color="#2196F3" />
          <Text style={styles.statNumber}>{stats.playlistsCount}</Text>
          <Text style={styles.statLabel}>Playlist</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="heart" size={28} color="#2196F3" />
          <Text style={styles.statNumber}>{stats.likedSongsCount}</Text>
          <Text style={styles.statLabel}>Yêu thích</Text>
        </View>
      </View>

      {/* Menu Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        <MenuItem
          icon="shield-account"
          title="Bảo mật"
          subtitle="Đổi mật khẩu"
          onPress={() => navigation.getParent().navigate('ChangePassword')}
        />
        <MenuItem
          icon="bell"
          title="Thông báo"
          subtitle="Quản lý thông báo"
          onPress={() =>
            navigation.getParent().navigate('NotificationSettings')
          }
        />
        <MenuItem
          icon="palette"
          title="Giao diện"
          subtitle="Tùy chỉnh giao diện"
          onPress={() => handlePress('Giao diện')}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#ff3b30" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
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
