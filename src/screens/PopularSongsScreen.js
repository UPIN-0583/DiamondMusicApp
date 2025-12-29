import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {usePlayerStore} from '../store/usePlayerStore';
import TrackPlayer from 'react-native-track-player';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {toggleLikeSong} from '../redux/slices/authSlice';
import {
  fetchUserPlaylists,
  addSongToPlaylistThunk,
} from '../redux/slices/musicSlice';
import SongItem from '../components/SongItem';
import SongOptionsModal from '../components/SongOptionsModal';
import PlaylistSelectModal from '../components/PlaylistSelectModal';
import MiniPlayer from '../components/MiniPlayer';
import {useTheme} from '../themes/ThemeContext';

const PopularSongsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {colors} = useTheme();
  const {playFromQueue} = usePlayerStore();
  const {token, likedSongs} = useSelector(state => state.auth);
  const {userPlaylists, songs, artists} = useSelector(state => state.music);

  // Modal States
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tracks by search query - use songs from Redux (original list)
  const filteredTracks = songs.filter(
    t =>
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handlePlayTrack = async index => {
    await playFromQueue(songs, index);
    navigation.navigate('Player');
  };

  // Song Options Handlers
  const handleOpenSongOptions = song => {
    setSelectedSong(song);
    setOptionsModalVisible(true);
  };

  const isSongLiked =
    selectedSong &&
    likedSongs.some(
      s =>
        s.song_id?.toString() ===
        (selectedSong.id || selectedSong.song_id)?.toString(),
    );

  const handleLikeSong = () => {
    if (!selectedSong || !token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài hát');
      setOptionsModalVisible(false);
      return;
    }
    dispatch(
      toggleLikeSong({
        token,
        songId: selectedSong.id || selectedSong.song_id,
        isLiked: isSongLiked,
      }),
    );
    Alert.alert(
      'Thành công',
      isSongLiked ? 'Đã bỏ yêu thích bài hát' : 'Đã thêm vào yêu thích',
    );
    setOptionsModalVisible(false);
  };

  const handleAddToPlaylistPrepare = () => {
    setOptionsModalVisible(false);
    if (!token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập');
      return;
    }
    if (userPlaylists.length === 0) dispatch(fetchUserPlaylists(token));
    setPlaylistModalVisible(true);
  };

  const handleSelectPlaylist = playlistId => {
    if (!selectedSong || !token) return;
    dispatch(
      addSongToPlaylistThunk({
        token,
        playlistId,
        songId: selectedSong.id || selectedSong.song_id,
      }),
    )
      .unwrap()
      .then(() => Alert.alert('Thành công', 'Đã thêm vào playlist'))
      .catch(err => Alert.alert('Lỗi', err));
    setPlaylistModalVisible(false);
  };

  const handleViewArtist = () => {
    setOptionsModalVisible(false);
    if (selectedSong?.artistId) {
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
    } else {
      Alert.alert('Thông báo', 'Không có thông tin nghệ sĩ');
    }
  };

  const renderItem = ({item, index}) => (
    <SongItem
      song={item}
      onPress={() => handlePlayTrack(index)}
      onOptionsPress={handleOpenSongOptions}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>
          Bài hát phổ biến
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {backgroundColor: colors.inputBackground},
        ]}>
        <Icon name="magnify" size={20} color={colors.placeholder} />
        <TextInput
          style={[styles.searchInput, {color: colors.text}]}
          placeholder="Tìm bài hát..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={18} color={colors.placeholder} />
          </TouchableOpacity>
        )}
      </View>

      {/* Songs List */}
      <FlatList
        data={filteredTracks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="music-note-off" size={60} color={colors.textTertiary} />
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
              Không tìm thấy bài hát
            </Text>
          </View>
        }
      />

      {/* Song Options Modal */}
      <SongOptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        song={selectedSong}
        isLiked={isSongLiked}
        onLike={handleLikeSong}
        onAddToPlaylist={handleAddToPlaylistPrepare}
        onViewArtist={handleViewArtist}
      />

      {/* Playlist Select Modal */}
      <PlaylistSelectModal
        visible={playlistModalVisible}
        onClose={() => setPlaylistModalVisible(false)}
        playlists={userPlaylists}
        onSelect={handleSelectPlaylist}
      />

      <MiniPlayer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {fontSize: 20, fontWeight: 'bold', color: '#222'},
  placeholder: {width: 40},

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 44,
    borderRadius: 12,
  },
  searchInput: {flex: 1, marginLeft: 10, fontSize: 15, color: '#333'},

  listContent: {paddingHorizontal: 20, paddingBottom: 20},

  emptyState: {alignItems: 'center', marginTop: 60},
  emptyText: {fontSize: 16, color: '#999', marginTop: 15},
});

export default PopularSongsScreen;
