import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import MiniPlayer from '../components/MiniPlayer';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchUserPlaylists,
  createNewPlaylist,
} from '../redux/slices/musicSlice';
import {useTheme} from '../themes/ThemeContext';

const PlaylistScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {colors} = useTheme();
  const {token} = useSelector(state => state.auth);
  const {userPlaylists, isLoadingUserPlaylists} = useSelector(
    state => state.music,
  );

  const [isModalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (token) {
      dispatch(fetchUserPlaylists(token));
    }
  }, [token, dispatch]);

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    dispatch(createNewPlaylist({token, name: newPlaylistName}))
      .unwrap()
      .then(() => {
        setModalVisible(false);
        setNewPlaylistName('');
      })
      .catch(err => console.error('Create playlist failed:', err));
  };

  // Filter playlists by name
  const filteredPlaylists = userPlaylists.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderPlaylistItem = ({item}) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() =>
        navigation.navigate('PlaylistDetail', {
          playlist: {
            id: item.playlist_id,
            name: item.name,
            category: `${item.songs ? item.songs.length : 0} Songs`,
            image:
              item.cover_image ||
              'https://via.placeholder.com/200x200.png?text=Playlist',
            songs: item.songs || [],
            isUserPlaylist: true,
          },
        })
      }>
      <Image
        source={{
          uri:
            item.cover_image ||
            'https://via.placeholder.com/200x200.png?text=Playlist',
        }}
        style={styles.playlistImage}
      />
      <View style={styles.playlistInfo}>
        <Text
          style={[styles.playlistName, {color: colors.text}]}
          numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.playlistSongCount, {color: colors.textSecondary}]}>
          {item.songs ? item.songs.length : 0} bài hát
        </Text>
      </View>
      <Icon name="chevron-right" size={22} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, {color: colors.text}]}>
          Playlist của tôi
        </Text>
      </View>

      <View style={styles.fabContainer}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {backgroundColor: colors.inputBackground},
          ]}>
          <Icon name="magnify" size={20} color={colors.placeholder} />
          <TextInput
            style={[styles.searchInput, {color: colors.text}]}
            placeholder="Tìm playlist..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}>
          <Icon name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Playlist List */}
      {isLoadingUserPlaylists && !userPlaylists.length ? (
        <View style={{flex: 1, justifyContent: 'center'}}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPlaylists}
          renderItem={renderPlaylistItem}
          keyExtractor={item => item.playlist_id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon
                name="playlist-music-outline"
                size={60}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                {searchQuery
                  ? 'Không tìm thấy playlist'
                  : 'Chưa có playlist nào'}
              </Text>
              {!searchQuery && (
                <Text
                  style={[styles.emptySubtext, {color: colors.textTertiary}]}>
                  Nhấn + để tạo mới!
                </Text>
              )}
            </View>
          }
        />
      )}

      <MiniPlayer />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreatePlaylist}
        value={newPlaylistName}
        onChangeText={setNewPlaylistName}
        title="Playlist mới"
        subtitle="Tạo playlist để lưu bài hát yêu thích"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10},
  headerTitle: {fontSize: 24, fontWeight: 'bold', color: '#222'},

  // Search Bar
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginRight: 12,
    paddingHorizontal: 15,
    height: 48,
    borderRadius: 12,
  },
  searchInput: {flex: 1, marginLeft: 10, fontSize: 15, color: '#333'},

  listContent: {paddingHorizontal: 20, paddingBottom: 150},

  // Playlist Item
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  playlistImage: {width: 60, height: 60, borderRadius: 10},
  playlistInfo: {flex: 1, marginLeft: 15},
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  playlistSongCount: {fontSize: 14, color: '#888'},

  // Empty State
  emptyState: {alignItems: 'center', marginTop: 60},
  emptyText: {fontSize: 16, fontWeight: '600', color: '#999', marginTop: 15},
  emptySubtext: {fontSize: 14, color: '#bbb', marginTop: 5},

  fabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  // FAB
  fab: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default PlaylistScreen;
