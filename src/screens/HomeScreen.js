import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchSongs,
  fetchArtists,
  fetchPlaylists,
  fetchUserPlaylists,
  addSongToPlaylistThunk,
} from '../redux/slices/musicSlice';
import {toggleLikeSong} from '../redux/slices/authSlice';
import {usePlayerStore} from '../store/usePlayerStore';
import TrackPlayer from 'react-native-track-player';
import MiniPlayer from '../components/MiniPlayer';
import SongItem from '../components/SongItem';
import SongOptionsModal from '../components/SongOptionsModal';
import PlaylistSelectModal from '../components/PlaylistSelectModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import SearchScreen from './SearchScreen';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;

const HomeScreen = ({navigation}) => {
  const {trackList, setCurrentTrackIndex, setTrackList} = usePlayerStore();
  const dispatch = useDispatch();
  const {
    songs,
    artists,
    playlists: globalPlaylists,
  } = useSelector(state => state.music);
  const {user, token, likedSongs} = useSelector(state => state.auth);
  const {userPlaylists} = useSelector(state => state.music);

  // Modal States
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    dispatch(fetchSongs());
    dispatch(fetchArtists());
    dispatch(fetchPlaylists());
  }, [dispatch]);

  useEffect(() => {
    if (songs.length > 0) {
      setTrackList(songs);
    }
  }, [songs, setTrackList]);

  const handlePlayTrack = async index => {
    setCurrentTrackIndex(index);
    await TrackPlayer.reset();
    await TrackPlayer.add(trackList);
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
    navigation.getParent().navigate('Player');
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
      navigation.getParent().navigate('ArtistDetail', {
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

  const playlists =
    globalPlaylists.length > 0
      ? globalPlaylists
      : [
          {
            id: '1',
            name: 'Bollywood Romance',
            category: 'Bollywood Music',
            image: 'https://picsum.photos/200/200?random=1',
          },
          {
            id: '2',
            name: 'New Music Daily',
            category: 'Music Hits',
            image: 'https://picsum.photos/200/200?random=2',
          },
          {
            id: '3',
            name: 'All Day Hits',
            category: 'Music',
            image: 'https://picsum.photos/200/200?random=3',
          },
        ];

  const artistList =
    artists.length > 0
      ? artists
      : [
          {
            id: '1',
            name: 'Arman Malik',
            image: 'https://picsum.photos/100/100?random=4',
          },
          {
            id: '2',
            name: 'Justin Bieber',
            image: 'https://picsum.photos/100/100?random=5',
          },
          {
            id: '3',
            name: 'Katy Perry',
            image: 'https://picsum.photos/100/100?random=6',
          },
          {
            id: '4',
            name: 'Son Tung',
            image: 'https://picsum.photos/100/100?random=7',
          },
        ];

  const renderTrendingSong = (item, index) => (
    <TouchableOpacity
      key={item.id}
      style={styles.trendingCard}
      onPress={() => handlePlayTrack(index)}>
      <Image source={{uri: item.artwork}} style={styles.trendingImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.trendingGradient}>
        <View style={styles.trendingInfo}>
          <Text style={styles.trendingTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.trendingArtistRow}>
            <Icon name="account-music" size={12} color="#fff" />
            <Text style={styles.trendingArtist} numberOfLines={1}>
              {item.artist}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.playButton}>
          <Icon name="play" size={20} color="#2196F3" />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPlaylist = item => (
    <TouchableOpacity
      key={item.id}
      style={styles.playlistCard}
      onPress={() =>
        navigation.getParent().navigate('PlaylistDetail', {playlist: item})
      }>
      <Image source={{uri: item.image}} style={styles.playlistImage} />
      <Text style={styles.playlistName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.playlistCategory} numberOfLines={1}>
        {item.category}
      </Text>
    </TouchableOpacity>
  );

  const renderArtist = item => (
    <TouchableOpacity
      key={item.id}
      style={styles.artistCard}
      onPress={() =>
        navigation.getParent().navigate('ArtistDetail', {artist: item})
      }>
      <Image source={{uri: item.image}} style={styles.artistImage} />
      <Text style={styles.artistName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Search Bar - Navigate to Search Screen */}
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.getParent().navigate('SearchScreen')}>
            <Icon name="magnify" size={22} color="#999" />
            <Text style={styles.searchPlaceholder}>
              Tìm kiếm bài hát, nghệ sĩ...
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="microphone" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Trending Songs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nhạc thịnh hành</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}>
            {trackList
              .slice(0, 5)
              .map((item, index) => renderTrendingSong(item, index))}
          </ScrollView>
        </View>

        {/* Top Playlists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Playlist nổi bật</Text>
            <TouchableOpacity
              onPress={() => navigation.getParent().navigate('TopPlaylists')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}>
            {playlists.map(item => renderPlaylist(item))}
          </ScrollView>
        </View>

        {/* Favourite Artists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nghệ sĩ yêu thích</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.getParent().navigate('FavouriteArtists')
              }>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}>
            {artistList.map(item => renderArtist(item))}
          </ScrollView>
        </View>

        {/* Popular Songs - Using SongItem Component */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bài hát phổ biến</Text>
            <TouchableOpacity
              onPress={() => navigation.getParent().navigate('PopularSongs')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.popularSongsList}>
            {trackList.slice(0, 8).map((item, index) => (
              <SongItem
                key={item.id}
                song={item}
                onPress={() => handlePlayTrack(index)}
                onOptionsPress={handleOpenSongOptions}
              />
            ))}
          </View>
        </View>

        {/* <View style={styles.bottomPadding} /> */}
      </ScrollView>

      <MiniPlayer />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  scrollContent: {paddingHorizontal: 20, paddingTop: 20},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    marginRight: 12,
  },
  searchInput: {flex: 1, marginLeft: 10, fontSize: 16, color: '#333'},
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: '#2196F3',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#999',
  },
  section: {marginBottom: 25},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {fontSize: 20, fontWeight: 'bold', color: '#222'},
  seeAll: {fontSize: 14, color: '#2196F3', fontWeight: '600'},
  horizontalScroll: {paddingRight: 20},

  // Trending
  trendingCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.1,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  trendingImage: {width: '100%', height: '100%', position: 'absolute'},
  trendingGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  trendingInfo: {flex: 1},
  trendingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  trendingArtistRow: {flexDirection: 'row', alignItems: 'center'},
  trendingArtist: {fontSize: 12, color: '#fff', marginLeft: 4, opacity: 0.9},
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Playlists
  playlistCard: {width: 130, marginRight: 15},
  playlistImage: {width: 130, height: 130, borderRadius: 12, marginBottom: 8},
  playlistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  playlistCategory: {fontSize: 12, color: '#888'},

  // Artists
  artistCard: {alignItems: 'center', marginRight: 20},
  artistImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  artistName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    width: 70,
  },

  // Popular Songs
  popularSongsList: {marginTop: 5},
  bottomPadding: {height: 80},
});

export default HomeScreen;
