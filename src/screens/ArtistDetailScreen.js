import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {usePlayerStore} from '../store/usePlayerStore';
import TrackPlayer from 'react-native-track-player';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {getArtistDetail, createPlaylistWithSongs} from '../services/api';
import {useDispatch, useSelector} from 'react-redux';
import {toggleFollowArtist, toggleLikeSong} from '../redux/slices/authSlice';
import {
  fetchUserPlaylists,
  addSongToPlaylistThunk,
} from '../redux/slices/musicSlice';
import SongItem from '../components/SongItem';
import SongOptionsModal from '../components/SongOptionsModal';
import PlaylistSelectModal from '../components/PlaylistSelectModal';
import CreatePlaylistModal from '../components/CreatePlaylistModal';

const {width, height} = Dimensions.get('window');

const ArtistDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const {setTrackList, setCurrentTrackIndex} = usePlayerStore();

  const dispatch = useDispatch();
  const {token, likedArtists, likedSongs} = useSelector(state => state.auth);
  const {userPlaylists} = useSelector(state => state.music);

  const [isFollowed, setIsFollowed] = useState(false);
  const [artistSongs, setArtistSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [songOptionsVisible, setSongOptionsVisible] = useState(false);
  const [playlistSelectVisible, setPlaylistSelectVisible] = useState(false);
  const [createPlaylistVisible, setCreatePlaylistVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  const artist = route.params?.artist || {
    id: '1',
    name: 'Artist',
    image: 'https://picsum.photos/400/400',
  };

  // Check if artist is followed
  useEffect(() => {
    const followed = likedArtists.some(
      a => a.artist_id?.toString() === artist.id?.toString(),
    );
    setIsFollowed(followed);
  }, [likedArtists, artist.id]);

  // Load artist songs
  useEffect(() => {
    const loadSongs = async () => {
      setIsLoading(true);
      try {
        const response = await getArtistDetail(artist.id);
        if (response.success) {
          const formatted = response.songs.map((s, index) => ({
            id: s.song_id?.toString() || `${artist.id}-${index}`,
            song_id: s.song_id?.toString() || `${artist.id}-${index}`,
            title: s.title,
            artist: s.artist_name || artist.name,
            artistId: artist.id,
            artwork: s.image_url || s.artist_image || artist.image,
            url: s.audio_url,
            duration: s.duration,
          }));
          setArtistSongs(formatted);
        }
      } catch (error) {
        console.error('Failed to load artist songs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSongs();
  }, [artist]);

  const handlePlayTrack = async index => {
    setTrackList(artistSongs);
    setCurrentTrackIndex(index);
    await TrackPlayer.reset();
    await TrackPlayer.add(artistSongs);
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
    navigation.navigate('Player');
  };

  const handlePlayAll = async () => {
    if (artistSongs.length === 0) return;
    setTrackList(artistSongs);
    await TrackPlayer.reset();
    await TrackPlayer.add(artistSongs);
    await TrackPlayer.skip(0);
    await TrackPlayer.play();
    navigation.navigate('Player');
  };

  const handleToggleFollow = () => {
    if (!token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để theo dõi nghệ sĩ');
      return;
    }
    dispatch(toggleFollowArtist({token, artistId: artist.id, isFollowed}));
    Alert.alert(
      isFollowed ? 'Bỏ theo dõi' : 'Theo dõi',
      isFollowed
        ? `Bạn đã bỏ theo dõi ${artist.name}`
        : `Bạn đã theo dõi ${artist.name}`,
    );
  };

  // Song Options Handlers
  const handleOpenSongOptions = song => {
    setSelectedSong(song);
    setSongOptionsVisible(true);
  };

  const isSongLiked =
    selectedSong &&
    likedSongs.some(
      s => s.song_id?.toString() === selectedSong.song_id?.toString(),
    );

  const handleLikeSong = () => {
    if (!selectedSong || !token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài hát');
      setSongOptionsVisible(false);
      return;
    }
    dispatch(
      toggleLikeSong({
        token,
        songId: selectedSong.song_id,
        isLiked: isSongLiked,
      }),
    );
    setSongOptionsVisible(false);
  };

  const handleAddToPlaylistPrepare = () => {
    setSongOptionsVisible(false);
    if (!token) {
      Alert.alert(
        'Thông báo',
        'Vui lòng đăng nhập để thêm bài hát vào playlist',
      );
      return;
    }
    if (userPlaylists.length === 0) dispatch(fetchUserPlaylists(token));
    setPlaylistSelectVisible(true);
  };

  const handleSelectPlaylist = playlistId => {
    if (!selectedSong || !token) return;
    dispatch(
      addSongToPlaylistThunk({token, playlistId, songId: selectedSong.song_id}),
    )
      .unwrap()
      .then(() => Alert.alert('Thông báo', 'Đã thêm bài hát vào playlist'))
      .catch(err => Alert.alert('Thông báo', err));
    setPlaylistSelectVisible(false);
  };

  // Create Playlist from Artist Songs
  const handleOpenCreatePlaylist = () => {
    if (!token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để tạo playlist');
      return;
    }
    if (artistSongs.length === 0) {
      Alert.alert('Thông báo', 'Không có bài hát');
      return;
    }
    setNewPlaylistName(`${artist.name} Mix`);
    setCreatePlaylistVisible(true);
  };

  const handleCreatePlaylistFromArtist = async () => {
    if (!newPlaylistName.trim() || !token) return;
    setIsCreatingPlaylist(true);
    try {
      const songIds = artistSongs
        .map(s => parseInt(s.song_id, 10))
        .filter(id => !isNaN(id));
      const response = await createPlaylistWithSongs(
        token,
        newPlaylistName,
        songIds,
      );
      if (response.success) {
        Alert.alert(
          'Thông báo',
          `Đã tạo playlist "${newPlaylistName}" với ${response.addedSongs} bài hát!`,
        );
        dispatch(fetchUserPlaylists(token));
      } else {
        Alert.alert(
          'Thông báo',
          response.message || 'Failed to create playlist',
        );
      }
    } catch (err) {
      Alert.alert('Thông báo', 'Failed to create playlist');
    } finally {
      setIsCreatingPlaylist(false);
      setCreatePlaylistVisible(false);
      setNewPlaylistName('');
    }
  };

  const renderHeader = () => (
    <View>
      <View style={styles.coverContainer}>
        <Image source={{uri: artist.image}} style={styles.coverImage} />
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.3)',
            'transparent',
            'rgba(255,255,255,0.8)',
            '#fff',
          ]}
          style={[styles.coverGradient, {paddingTop: insets.top + 10}]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}>
              <Icon name="chevron-left" size={28} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleOpenCreatePlaylist}>
              <Icon name="playlist-plus" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.artistInfoContainer}>
        <View style={{flex: 1}}>
          <Text style={styles.artistName}>{artist.name}</Text>
          <Text style={styles.songCount}>{artistSongs.length} bài hát</Text>
        </View>
        <TouchableOpacity
          style={[styles.followButton, isFollowed && styles.followButtonActive]}
          onPress={handleToggleFollow}>
          <Icon
            name={isFollowed ? 'account-check' : 'account-plus'}
            size={22}
            color={isFollowed ? '#fff' : '#2196F3'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playFab} onPress={handlePlayAll}>
          <Icon name="play" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bài hát nổi bật</Text>
      </View>
    </View>
  );

  const renderItem = ({item, index}) => (
    <SongItem
      song={item}
      onPress={() => handlePlayTrack(index)}
      onOptionsPress={handleOpenSongOptions}
      style={{paddingHorizontal: 20}}
    />
  );

  if (isLoading) {
    return (
      <View style={[styles.container, {justifyContent: 'center'}]}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <FlatList
        data={artistSongs}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
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
        visible={songOptionsVisible}
        onClose={() => setSongOptionsVisible(false)}
        song={selectedSong}
        isLiked={isSongLiked}
        onLike={handleLikeSong}
        onAddToPlaylist={handleAddToPlaylistPrepare}
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
        onSubmit={handleCreatePlaylistFromArtist}
        value={newPlaylistName}
        onChangeText={setNewPlaylistName}
        title="Playlist mới"
        subtitle={`Tạo playlist mới với tất cả ${artistSongs.length} bài hát từ ${artist.name}`}
        isLoading={isCreatingPlaylist}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  coverContainer: {width: width, height: height * 0.4},
  coverImage: {width: '100%', height: '100%', position: 'absolute'},
  coverGradient: {flex: 1, paddingHorizontal: 15},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  artistInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
  },
  artistName: {fontSize: 26, fontWeight: 'bold', color: '#222'},
  songCount: {fontSize: 14, color: '#888', marginTop: 3},

  followButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  followButtonActive: {backgroundColor: '#2196F3', borderColor: '#2196F3'},

  playFab: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {fontSize: 20, fontWeight: 'bold', color: '#222'},
  listContent: {paddingBottom: 30},

  emptyState: {alignItems: 'center', paddingVertical: 50},
  emptyText: {fontSize: 16, color: '#999', marginTop: 15},
});

export default ArtistDetailScreen;
