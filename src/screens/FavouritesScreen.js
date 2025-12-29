import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {usePlayerStore} from '../store/usePlayerStore';
import TrackPlayer from 'react-native-track-player';
import {
  toggleLikeSong,
  toggleFollowArtist,
  fetchLikedSongs,
  fetchLikedArtists,
} from '../redux/slices/authSlice';
import MiniPlayer from '../components/MiniPlayer';
import SongItem from '../components/SongItem';
import SongOptionsModal from '../components/SongOptionsModal';
import PlaylistSelectModal from '../components/PlaylistSelectModal';
import {
  fetchUserPlaylists,
  addSongToPlaylistThunk,
} from '../redux/slices/musicSlice';
import {useTheme} from '../themes/ThemeContext';

const FavouritesScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {colors} = useTheme();
  const {playFromQueue} = usePlayerStore();
  const {token, likedSongs, likedArtists} = useSelector(state => state.auth);
  const {userPlaylists} = useSelector(state => state.music);

  // Tab state
  const [activeTab, setActiveTab] = useState('songs');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [playlistSelectVisible, setPlaylistSelectVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  // Fetch liked songs and artists on screen focus (not just mount)
  useFocusEffect(
    useCallback(() => {
      if (token) {
        dispatch(fetchLikedSongs(token));
        dispatch(fetchLikedArtists(token));
      }
    }, [token, dispatch]),
  );

  // Format liked songs for player (map backend fields to frontend fields)
  const formattedSongs = likedSongs.map(s => ({
    id: s.song_id?.toString(),
    song_id: s.song_id?.toString(),
    title: s.title,
    artist: s.name || s.artist, // Backend returns 'name' for artist name
    artistId: s.artist_id,
    artwork: s.image_url || s.image, // Backend returns 'image_url'
    url: s.audio_url || s.url, // Backend returns 'audio_url'
    duration: s.duration,
  }));

  const filteredSongs = formattedSongs.filter(
    s =>
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Format liked artists (map backend fields)
  const formattedArtists = likedArtists.map(a => ({
    artist_id: a.artist_id,
    name: a.name,
    image: a.image_url || a.image, // Backend returns 'image_url'
  }));

  const filteredArtists = formattedArtists.filter(a =>
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handlePlayTrack = async index => {
    const songsToPlay = searchQuery ? filteredSongs : formattedSongs;
    await playFromQueue(songsToPlay, index);
    navigation.getParent()?.navigate('Player');
  };

  const handleOpenOptions = song => {
    setSelectedSong(song);
    setOptionsVisible(true);
  };

  const handleUnlikeSong = () => {
    if (!selectedSong || !token) return;
    dispatch(
      toggleLikeSong({token, songId: selectedSong.song_id, isLiked: true}),
    );
    setOptionsVisible(false);
  };

  const handleAddToPlaylist = () => {
    setOptionsVisible(false);
    if (userPlaylists.length === 0) dispatch(fetchUserPlaylists(token));
    setPlaylistSelectVisible(true);
  };

  const handleSelectPlaylist = playlistId => {
    if (!selectedSong || !token) return;
    dispatch(
      addSongToPlaylistThunk({token, playlistId, songId: selectedSong.song_id}),
    )
      .unwrap()
      .then(() => Alert.alert('Thành công', 'Đã thêm bài hát vào playlist'))
      .catch(err => Alert.alert('Lỗi', err));
    setPlaylistSelectVisible(false);
  };

  const handleUnfollow = artist => {
    Alert.alert('Bỏ theo dõi', `Bỏ theo dõi ${artist.name}?`, [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Bỏ theo dõi',
        style: 'destructive',
        onPress: () =>
          dispatch(
            toggleFollowArtist({
              token,
              artistId: artist.artist_id,
              isFollowed: true,
            }),
          ),
      },
    ]);
  };

  const renderSongItem = ({item, index}) => (
    <SongItem
      song={item}
      onPress={() => handlePlayTrack(index)}
      onOptionsPress={handleOpenOptions}
    />
  );

  const renderArtistItem = ({item}) => (
    <TouchableOpacity
      style={styles.artistItem}
      onPress={() =>
        navigation.getParent()?.navigate('ArtistDetail', {
          artist: {id: item.artist_id, name: item.name, image: item.image},
        })
      }>
      <Image
        source={{uri: item.image || 'https://picsum.photos/100/100'}}
        style={styles.artistImage}
      />
      <Text style={[styles.artistName, {color: colors.text}]} numberOfLines={1}>
        {item.name}
      </Text>
      <TouchableOpacity
        style={styles.unfollowButton}
        onPress={() => handleUnfollow(item)}>
        <Icon name="account-check" size={20} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={[styles.header, {borderBottomColor: colors.border}]}>
        <Text style={[styles.headerTitle, {color: colors.text}]}>
          Yêu thích
        </Text>
      </View>

      {/* Tab Buttons */}
      <View style={[styles.tabContainer, {backgroundColor: colors.background}]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            {
              backgroundColor:
                activeTab === 'songs' ? colors.primary : 'transparent',
            },
          ]}
          onPress={() => {
            setActiveTab('songs');
            setSearchQuery('');
          }}>
          <Icon
            name="music-note"
            size={20}
            color={activeTab === 'songs' ? '#fff' : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {color: activeTab === 'songs' ? '#fff' : colors.textSecondary},
            ]}>
            Bài hát
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            {
              backgroundColor:
                activeTab === 'artists' ? colors.primary : 'transparent',
            },
          ]}
          onPress={() => {
            setActiveTab('artists');
            setSearchQuery('');
          }}>
          <Icon
            name="account-music"
            size={20}
            color={activeTab === 'artists' ? '#fff' : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {color: activeTab === 'artists' ? '#fff' : colors.textSecondary},
            ]}>
            Nghệ sĩ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {backgroundColor: colors.inputBackground},
        ]}>
        <Icon name="magnify" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={
            activeTab === 'songs' ? 'Tìm bài hát...' : 'Tìm nghệ sĩ...'
          }
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {activeTab === 'songs' ? (
        <FlatList
          data={filteredSongs}
          keyExtractor={item => item.id}
          renderItem={renderSongItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon
                name="heart-outline"
                size={60}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                {searchQuery ? 'Không tìm thấy' : 'Chưa có bài hát yêu thích'}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredArtists}
          keyExtractor={item => item.artist_id?.toString()}
          renderItem={renderArtistItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon
                name="account-music-outline"
                size={60}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                {searchQuery ? 'Không tìm thấy' : 'Chưa theo dõi nghệ sĩ nào'}
              </Text>
            </View>
          }
        />
      )}

      <MiniPlayer />

      {/* Modals */}
      <SongOptionsModal
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        song={selectedSong}
        isLiked={true}
        onLike={handleUnlikeSong}
        onAddToPlaylist={handleAddToPlaylist}
      />
      <PlaylistSelectModal
        visible={playlistSelectVisible}
        onClose={() => setPlaylistSelectVisible(false)}
        playlists={userPlaylists}
        onSelect={handleSelectPlaylist}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {paddingHorizontal: 20, paddingVertical: 15},
  headerTitle: {fontSize: 24, fontWeight: 'bold', color: '#222'},

  // Tab Buttons
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  tabButtonActive: {backgroundColor: '#2196F3'},
  tabText: {fontSize: 15, fontWeight: '600', color: '#666'},
  tabTextActive: {color: '#fff'},

  // Search
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

  listContent: {paddingHorizontal: 20, paddingBottom: 100},

  emptyState: {alignItems: 'center', marginTop: 60},
  emptyText: {fontSize: 16, color: '#999', marginTop: 15},

  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  artistImage: {width: 50, height: 50, borderRadius: 25},
  artistName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginLeft: 15,
  },
  unfollowButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FavouritesScreen;
