import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector, useDispatch} from 'react-redux';
import TrackPlayer from 'react-native-track-player';

import {usePlayerStore} from '../store/usePlayerStore';
import {useTheme} from '../themes/ThemeContext';
import {
  fetchUserPlaylists,
  addSongToPlaylistThunk,
} from '../redux/slices/musicSlice';
import {createPlaylistWithSongs} from '../services/api';
import {toggleLikeSong} from '../redux/slices/authSlice';
import SongItem from '../components/SongItem';
import SongOptionsModal from '../components/SongOptionsModal';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import PlaylistSelectModal from '../components/PlaylistSelectModal';
import MiniPlayer from '../components/MiniPlayer';

const RecommendedSongsScreen = ({navigation, route}) => {
  const {songs = [], genres = []} = route.params || {};
  const dispatch = useDispatch();
  const {colors} = useTheme();
  // Get playFromQueue from store
  const {playFromQueue} = usePlayerStore();

  const {token, likedSongs} = useSelector(state => state.auth);
  const {userPlaylists, artists} = useSelector(state => state.music);

  // Modal states
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [playlistSelectVisible, setPlaylistSelectVisible] = useState(false);
  const [createPlaylistVisible, setCreatePlaylistVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchUserPlaylists(token));
    }
  }, [token, dispatch]);

  const handlePlaySong = async song => {
    try {
      // Create queue with standard format
      const queue = songs.map(s => ({
        id: s.id,
        url: s.url,
        title: s.title,
        artist: s.artist,
        artistId: s.artistId,
        artwork: s.artwork,
      }));

      const songIndex = songs.findIndex(s => s.id === song.id);
      await playFromQueue(queue, songIndex !== -1 ? songIndex : 0);
      navigation.navigate('Player');
    } catch (error) {
      console.error('Error playing song:', error);
      Alert.alert('Lỗi', 'Không thể phát bài hát');
    }
  };

  const handlePlayAll = async () => {
    if (songs.length === 0) return;

    try {
      const queue = songs.map(s => ({
        id: s.id,
        url: s.url,
        title: s.title,
        artist: s.artist,
        artistId: s.artistId,
        artwork: s.artwork,
      }));

      await playFromQueue(queue, 0);
      navigation.navigate('Player');
    } catch (error) {
      console.error('Error playing all:', error);
      Alert.alert('Lỗi', 'Không thể phát nhạc');
    }
  };

  const handleOpenOptions = song => {
    setSelectedSong(song);
    setOptionsModalVisible(true);
  };

  const handleLikeSong = () => {
    if (!selectedSong || !token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài hát');
      setOptionsModalVisible(false);
      return;
    }

    const isLiked = likedSongs?.some(
      s => s.song_id?.toString() === selectedSong.id?.toString(),
    );

    dispatch(
      toggleLikeSong({
        token,
        songId: selectedSong.id,
        isLiked,
      }),
    );

    Alert.alert(
      'Thành công',
      isLiked ? 'Đã bỏ yêu thích bài hát' : 'Đã thêm vào yêu thích',
    );
    setOptionsModalVisible(false);
  };

  const handleAddToPlaylist = () => {
    setOptionsModalVisible(false);
    setPlaylistSelectVisible(true);
  };

  const handleSelectPlaylist = async playlistId => {
    if (!selectedSong || !token) return;

    try {
      await dispatch(
        addSongToPlaylistThunk({
          token,
          playlistId,
          songId: selectedSong.id,
        }),
      ).unwrap();

      Alert.alert('Thành công', 'Đã thêm bài hát vào playlist');
      setPlaylistSelectVisible(false);
      setSelectedSong(null);
    } catch (error) {
      Alert.alert('Lỗi', error || 'Không thể thêm bài hát vào playlist');
    }
  };

  const handleViewArtist = () => {
    if (!selectedSong) return;
    setOptionsModalVisible(false);
    // Tìm ảnh nghệ sĩ đúng từ danh sách artists
    const artistData = artists.find(
      a => a.id?.toString() === selectedSong.artistId?.toString(),
    );
    navigation.navigate('ArtistDetail', {
      artist: {
        id: selectedSong.artistId,
        name: selectedSong.artist,
        image: artistData?.image || selectedSong.artwork,
      },
    });
  };

  const handleCreatePlaylistFromAll = () => {
    setNewPlaylistName('');
    setCreatePlaylistVisible(true);
  };

  const submitCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || !token) return;

    setIsCreatingPlaylist(true);

    try {
      const songIds = songs.map(s => parseInt(s.id));
      const response = await createPlaylistWithSongs(
        token,
        newPlaylistName.trim(),
        songIds,
      );

      if (response.success) {
        Alert.alert(
          'Thành công',
          `Đã tạo playlist "${newPlaylistName}" với ${songIds.length} bài hát`,
        );
        dispatch(fetchUserPlaylists(token));
        setCreatePlaylistVisible(false);
        setNewPlaylistName('');
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tạo playlist');
      }
    } catch (error) {
      console.error('Create playlist error:', error);
      Alert.alert('Lỗi', 'Không thể tạo playlist');
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const renderSong = ({item, index}) => (
    <SongItem
      song={item}
      onPress={() => handlePlaySong(item)}
      onOptionsPress={() => handleOpenOptions(item)}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark || colors.primary]}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Nhạc được gợi ý</Text>
          <Text style={styles.headerSubtitle}>
            {songs.length} bài hát • {genres.join(', ')}
          </Text>
        </View>
      </LinearGradient>

      {/* Action buttons */}
      <View
        style={[
          styles.actionsContainer,
          {backgroundColor: colors.card, borderBottomColor: colors.border},
        ]}>
        <TouchableOpacity
          style={[styles.playAllBtn, {backgroundColor: colors.primary}]}
          onPress={handlePlayAll}>
          <Icon name="play" size={22} color="#fff" />
          <Text style={styles.playAllText}>Phát tất cả</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.createPlaylistBtn, {borderColor: colors.primary}]}
          onPress={handleCreatePlaylistFromAll}>
          <Icon name="playlist-plus" size={22} color={colors.primary} />
          <Text style={[styles.createPlaylistText, {color: colors.primary}]}>
            Tạo playlist
          </Text>
        </TouchableOpacity>
      </View>

      {/* Songs list */}
      <FlatList
        data={songs}
        keyExtractor={item => item.id}
        renderItem={renderSong}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Song Options Modal */}
      <SongOptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        song={selectedSong}
        isLiked={likedSongs?.some(
          s => s.song_id?.toString() === selectedSong?.id?.toString(),
        )}
        onLike={handleLikeSong}
        onAddToPlaylist={handleAddToPlaylist}
        onViewArtist={handleViewArtist}
      />

      {/* Playlist Select Modal */}
      <PlaylistSelectModal
        visible={playlistSelectVisible}
        onClose={() => setPlaylistSelectVisible(false)}
        playlists={userPlaylists}
        onSelect={handleSelectPlaylist}
      />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        visible={createPlaylistVisible}
        onClose={() => setCreatePlaylistVisible(false)}
        onSubmit={submitCreatePlaylist}
        value={newPlaylistName}
        onChangeText={setNewPlaylistName}
        title="Tạo playlist từ gợi ý"
        subtitle={`Tạo playlist mới với ${songs.length} bài hát được AI gợi ý`}
        isLoading={isCreatingPlaylist}
        buttonText="Tạo playlist"
        iconName="playlist-star"
      />

      <MiniPlayer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 15,
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 12,
  },
  playAllBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  playAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  createPlaylistBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  createPlaylistText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
});

export default RecommendedSongsScreen;
