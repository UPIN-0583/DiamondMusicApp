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

const PopularSongsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {trackList, setCurrentTrackIndex} = usePlayerStore();
  const {token, likedSongs} = useSelector(state => state.auth);
  const {userPlaylists} = useSelector(state => state.music);

  // Modal States
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tracks by search query
  const filteredTracks = trackList.filter(
    t =>
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handlePlayTrack = async index => {
    setCurrentTrackIndex(index);
    await TrackPlayer.reset();
    await TrackPlayer.add(trackList);
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
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
      Alert.alert('Info', 'Please login to like songs');
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
    setOptionsModalVisible(false);
  };

  const handleAddToPlaylistPrepare = () => {
    setOptionsModalVisible(false);
    if (!token) {
      Alert.alert('Info', 'Please login first');
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
      .then(() => Alert.alert('Success', 'Added to playlist'))
      .catch(err => Alert.alert('Error', err));
    setPlaylistModalVisible(false);
  };

  const handleViewArtist = () => {
    setOptionsModalVisible(false);
    if (selectedSong?.artistId) {
      navigation.navigate('ArtistDetail', {
        artist: {
          id: selectedSong.artistId,
          name: selectedSong.artist,
          image: selectedSong.artwork,
        },
      });
    } else {
      Alert.alert('Info', 'Artist info unavailable');
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài hát phổ biến</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm bài hát..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={18} color="#888" />
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
            <Icon name="music-note-off" size={60} color="#ddd" />
            <Text style={styles.emptyText}>Không tìm thấy bài hát</Text>
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
