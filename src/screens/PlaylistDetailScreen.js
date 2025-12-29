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
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {usePlayerStore} from '../store/usePlayerStore';
import TrackPlayer from 'react-native-track-player';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  getGlobalPlaylistDetail,
  createPlaylistWithSongs,
} from '../services/api';
import {useDispatch, useSelector} from 'react-redux';
import {toggleLikeSong} from '../redux/slices/authSlice';
import {
  addSongToPlaylistThunk,
  fetchUserPlaylists,
  renamePlaylistThunk,
  deletePlaylistThunk,
  removeSongFromPlaylistThunk,
  fetchSongs,
} from '../redux/slices/musicSlice';
import SongItem from '../components/SongItem';
import SongOptionsModal from '../components/SongOptionsModal';
import PlaylistSelectModal from '../components/PlaylistSelectModal';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import MiniPlayer from '../components/MiniPlayer';
import {useTheme} from '../themes/ThemeContext';

const {width, height} = Dimensions.get('window');

const PlaylistDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const {colors} = useTheme();
  const {playFromQueue} = usePlayerStore();
  const dispatch = useDispatch();

  const {token, likedSongs} = useSelector(state => state.auth);
  const {
    userPlaylists,
    songs: allSongs,
    artists,
  } = useSelector(state => state.music);

  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [songOptionsVisible, setSongOptionsVisible] = useState(false);
  const [playlistSelectVisible, setPlaylistSelectVisible] = useState(false);
  const [playlistMenuVisible, setPlaylistMenuVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [addSongModalVisible, setAddSongModalVisible] = useState(false);
  const [savePlaylistVisible, setSavePlaylistVisible] = useState(false);

  const [selectedSong, setSelectedSong] = useState(null);
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isSavingPlaylist, setIsSavingPlaylist] = useState(false);

  const initialPlaylist = route.params?.playlist || {
    id: '1',
    name: 'Unknown Playlist',
    category: 'Music',
    image: 'https://via.placeholder.com/400x400.png?text=Playlist',
    isUserPlaylist: false,
  };
  const [playlistData, setPlaylistData] = useState(initialPlaylist);
  const isUserPlaylist = playlistData.isUserPlaylist;

  // Helper function to get playlist cover image with priority logic
  const getPlaylistCoverImage = (playlist, songs) => {
    const PLACEHOLDER = 'https://via.placeholder.com/400x400.png?text=Playlist';

    // Priority 1: Custom image set by admin/user
    if (playlist.image_url) {
      return playlist.image_url;
    }

    // Priority 2: First song's image
    if (songs && songs.length > 0) {
      const firstSongImage =
        songs[0].image || songs[0].image_url || songs[0].artwork;
      if (firstSongImage) {
        return firstSongImage;
      }
    }

    // Priority 3: Placeholder
    return PLACEHOLDER;
  };

  // Load playlist songs
  useEffect(() => {
    const loadSongs = async () => {
      setIsLoading(true);
      try {
        if (isUserPlaylist) {
          const found = userPlaylists.find(
            p => p.playlist_id?.toString() === playlistData.id?.toString(),
          );
          if (found && found.songs) {
            const formatted = found.songs.map(s => ({
              id: s.song_id?.toString(),
              title: s.title,
              artist: s.artist,
              artistId: s.artist_id,
              artwork: s.image,
              url: s.url,
              duration: s.duration,
              song_id: s.song_id?.toString(),
            }));
            setPlaylistSongs(formatted);
            // Update playlist data with name and computed image
            const computedImage = getPlaylistCoverImage(found, found.songs);
            setPlaylistData(prev => ({
              ...prev,
              name: found.name,
              image: computedImage,
            }));
          } else if (playlistData.songs?.length > 0) {
            const formatted = playlistData.songs.map(s => ({
              id: s.id || s.song_id?.toString(),
              title: s.title,
              artist: s.artist || s.artist_name || 'Unknown Artist',
              artistId: s.artist_id,
              artwork:
                s.image ||
                s.image_url ||
                'https://via.placeholder.com/200x200.png?text=Song',
              url: s.url || s.audio_url,
              duration: s.duration,
              song_id: s.id || s.song_id?.toString(),
            }));
            setPlaylistSongs(formatted);
            // Update playlist image
            const computedImage = getPlaylistCoverImage(
              playlistData,
              playlistData.songs,
            );
            setPlaylistData(prev => ({...prev, image: computedImage}));
          }
        } else {
          const response = await getGlobalPlaylistDetail(playlistData.id);
          if (response.success) {
            const formatted = response.songs.map(s => ({
              id: s.song_id.toString(),
              title: s.title,
              artist: s.name || s.artist_name || 'Unknown Artist',
              artistId: s.artist_id,
              artwork:
                s.image_url ||
                s.artist_image ||
                'https://via.placeholder.com/200x200.png?text=Song',
              url: s.audio_url,
              duration: s.duration,
              song_id: s.song_id.toString(),
            }));
            setPlaylistSongs(formatted);
          }
        }
      } catch (error) {
        console.error('Failed to load playlist songs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSongs();
  }, [playlistData.id, userPlaylists, isUserPlaylist]);

  useEffect(() => {
    if (addSongModalVisible && allSongs.length === 0) {
      dispatch(fetchSongs());
    }
  }, [addSongModalVisible, dispatch, allSongs.length]);

  // Playback Handlers
  const handlePlayTrack = async index => {
    await playFromQueue(playlistSongs, index);
    navigation.navigate('Player');
  };

  const handlePlayAll = async () => {
    if (playlistSongs.length === 0) return;
    await playFromQueue(playlistSongs, 0);
    navigation.navigate('Player');
  };

  const handleShuffle = async () => {
    if (playlistSongs.length === 0) return;
    const shuffled = [...playlistSongs].sort(() => Math.random() - 0.5);
    await playFromQueue(shuffled, 0);
    navigation.navigate('Player');
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
    Alert.alert(
      'Thành công',
      isSongLiked ? 'Đã bỏ yêu thích bài hát' : 'Đã thêm vào yêu thích',
    );
    setSongOptionsVisible(false);
  };

  const handleRemoveFromPlaylist = () => {
    if (!selectedSong || !token) return;
    dispatch(
      removeSongFromPlaylistThunk({
        token,
        playlistId: playlistData.id,
        songId: selectedSong.song_id,
      }),
    )
      .unwrap()
      .then(() =>
        setPlaylistSongs(prev =>
          prev.filter(s => s.song_id !== selectedSong.song_id),
        ),
      )
      .catch(err => Alert.alert('Error', err));
    setSongOptionsVisible(false);
  };

  const handleAddToPlaylistPrepare = () => {
    setSongOptionsVisible(false);
    if (!token) return;
    if (userPlaylists.length === 0) dispatch(fetchUserPlaylists(token));
    setPlaylistSelectVisible(true);
  };

  const handleSelectPlaylist = playlistId => {
    if (!selectedSong || !token) return;
    dispatch(
      addSongToPlaylistThunk({token, playlistId, songId: selectedSong.song_id}),
    )
      .unwrap()
      .then(() => Alert.alert('Thành công', 'Đã thêm vào playlist'))
      .catch(err => Alert.alert('Lỗi', err));
    setPlaylistSelectVisible(false);
  };

  const handleViewArtist = () => {
    setSongOptionsVisible(false);
    const artistId = selectedSong?.artistId || selectedSong?.artist_id;
    if (artistId) {
      // Tìm ảnh nghệ sĩ đúng từ danh sách artists
      const artistData = artists.find(
        a => a.id?.toString() === artistId?.toString(),
      );
      navigation.navigate('ArtistDetail', {
        artist: {
          id: artistId,
          name: selectedSong.artist,
          image: artistData?.image || selectedSong.artwork,
        },
      });
    } else {
      Alert.alert('Thông báo', 'Không có thông tin nghệ sĩ');
    }
  };

  // Playlist Management Handlers
  const handleRenamePlaylist = () => {
    if (!newName.trim() || !token) return;
    dispatch(
      renamePlaylistThunk({token, playlistId: playlistData.id, name: newName}),
    )
      .unwrap()
      .then(() => {
        setPlaylistData(prev => ({...prev, name: newName}));
        setRenameModalVisible(false);
        setPlaylistMenuVisible(false);
        setNewName('');
      })
      .catch(err => Alert.alert('Error', err));
  };

  const handleDeletePlaylist = () => {
    Alert.alert('Xóa playlist', `Xóa "${playlistData.name}"?`, [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          dispatch(deletePlaylistThunk({token, playlistId: playlistData.id}))
            .unwrap()
            .then(() => navigation.goBack())
            .catch(err => Alert.alert('Error', err));
        },
      },
    ]);
    setPlaylistMenuVisible(false);
  };

  const handleAddSongToCurrent = song => {
    dispatch(
      addSongToPlaylistThunk({
        token,
        playlistId: playlistData.id,
        songId: song.id,
      }),
    )
      .unwrap()
      .then(() => {
        setPlaylistSongs(prev => [
          ...prev,
          {
            id: song.id,
            song_id: song.id,
            title: song.title,
            artist: song.artist,
            artistId: song.artistId,
            artwork: song.artwork,
            url: song.url,
            duration: song.duration,
          },
        ]);
      })
      .catch(err => Alert.alert('Error', err));
  };

  const handleRemoveSongFromModal = song => {
    dispatch(
      removeSongFromPlaylistThunk({
        token,
        playlistId: playlistData.id,
        songId: song.id,
      }),
    )
      .unwrap()
      .then(() =>
        setPlaylistSongs(prev => prev.filter(s => s.song_id !== song.id)),
      )
      .catch(err => Alert.alert('Error', err));
  };

  // Save Global Playlist to Library
  const handleOpenSavePlaylist = () => {
    if (!token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập');
      return;
    }
    if (playlistSongs.length === 0) {
      Alert.alert('Info', 'No songs in this playlist');
      return;
    }
    setNewPlaylistName(playlistData.name);
    setSavePlaylistVisible(true);
  };

  const handleSavePlaylistToLibrary = async () => {
    if (!newPlaylistName.trim() || !token) return;
    setIsSavingPlaylist(true);
    try {
      const songIds = playlistSongs
        .map(s => parseInt(s.song_id || s.id, 10))
        .filter(id => !isNaN(id));
      const response = await createPlaylistWithSongs(
        token,
        newPlaylistName,
        songIds,
      );
      if (response.success) {
        Alert.alert(
          'Thông báo',
          `Lưu playlist "${newPlaylistName}" thành công với ${response.addedSongs} bài hát!`,
        );
        dispatch(fetchUserPlaylists(token));
      } else {
        Alert.alert('Error', response.message || 'Failed to save playlist');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save playlist');
    } finally {
      setIsSavingPlaylist(false);
      setSavePlaylistVisible(false);
      setNewPlaylistName('');
    }
  };

  const filteredAllSongs = allSongs.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Renderers
  const renderHeader = () => (
    <View>
      <View style={styles.coverContainer}>
        <Image source={{uri: playlistData.image}} style={styles.coverImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={[styles.coverGradient, {paddingTop: insets.top + 10}]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}>
              <Icon name="chevron-left" size={28} color="#fff" />
            </TouchableOpacity>
            {isUserPlaylist ? (
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setAddSongModalVisible(true)}>
                  <Icon name="plus-circle-outline" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setPlaylistMenuVisible(true)}>
                  <Icon name="dots-horizontal" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleOpenSavePlaylist}>
                <Icon name="content-save-outline" size={26} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.playlistInfo}>
            <Text style={styles.playlistName}>{playlistData.name}</Text>
            <Text style={styles.playlistCategory}>
              {playlistSongs.length} Bài hát
            </Text>
          </View>
        </LinearGradient>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.playButton, {backgroundColor: colors.primary}]}
          onPress={handlePlayAll}>
          <Icon name="play" size={22} color="#fff" />
          <Text style={styles.playButtonText}>Phát</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.shuffleButton,
            {backgroundColor: colors.surfaceVariant},
          ]}
          onPress={handleShuffle}>
          <Icon name="shuffle-variant" size={22} color={colors.text} />
          <Text style={[styles.shuffleButtonText, {color: colors.text}]}>
            Shuffle
          </Text>
        </TouchableOpacity>
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

  const renderAddSongItem = ({item}) => {
    const isAdded = playlistSongs.some(
      s => s.song_id?.toString() === item.id?.toString(),
    );
    return (
      <TouchableOpacity
        style={[styles.addSongItem, {borderBottomColor: colors.border}]}
        onPress={() =>
          isAdded
            ? handleRemoveSongFromModal(item)
            : handleAddSongToCurrent(item)
        }>
        <Image source={{uri: item.artwork}} style={styles.addSongImage} />
        <View style={{flex: 1, marginLeft: 15}}>
          <Text
            style={[styles.addSongTitle, {color: colors.text}]}
            numberOfLines={1}>
            {item.title}
          </Text>
          <Text
            style={[styles.addSongArtist, {color: colors.textSecondary}]}
            numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addRemoveButton,
            {borderColor: colors.primary},
            isAdded && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() =>
            isAdded
              ? handleRemoveSongFromModal(item)
              : handleAddSongToCurrent(item)
          }>
          <Icon
            name={isAdded ? 'check' : 'plus'}
            size={20}
            color={isAdded ? '#fff' : colors.primary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', backgroundColor: colors.background},
        ]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <FlatList
        data={playlistSongs}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="music-note-off" size={60} color={colors.textTertiary} />
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
              Không có bài hát trong playlist
            </Text>
            {isUserPlaylist && (
              <TouchableOpacity
                style={styles.addSongsButton}
                onPress={() => setAddSongModalVisible(true)}>
                <Text style={styles.addSongsButtonText}>Thêm bài hát</Text>
              </TouchableOpacity>
            )}
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
        onViewArtist={handleViewArtist}
        showRemoveFromPlaylist={isUserPlaylist}
        onRemoveFromPlaylist={handleRemoveFromPlaylist}
      />

      {/* Playlist Select Modal */}
      <PlaylistSelectModal
        visible={playlistSelectVisible}
        onClose={() => setPlaylistSelectVisible(false)}
        playlists={userPlaylists}
        onSelect={handleSelectPlaylist}
      />

      {/* Save Playlist Modal (for global playlists) */}
      <CreatePlaylistModal
        visible={savePlaylistVisible}
        onClose={() => setSavePlaylistVisible(false)}
        onSubmit={handleSavePlaylistToLibrary}
        value={newPlaylistName}
        onChangeText={setNewPlaylistName}
        title="Lưu vào thư viện"
        subtitle={`Lưu "${playlistData.name}" với ${playlistSongs.length} bài hát vào thư viện`}
        isLoading={isSavingPlaylist}
        buttonText="Lưu"
        iconName="content-save"
      />

      {/* Playlist Menu Modal */}
      <Modal
        transparent
        visible={playlistMenuVisible}
        animationType="slide"
        onRequestClose={() => setPlaylistMenuVisible(false)}>
        <TouchableOpacity
          style={styles.bottomSheetOverlay}
          activeOpacity={1}
          onPress={() => setPlaylistMenuVisible(false)}>
          <View style={[styles.bottomSheet, {backgroundColor: colors.card}]}>
            <View
              style={[styles.dragHandle, {backgroundColor: colors.border}]}
            />
            <Text style={[styles.sheetTitle, {color: colors.text}]}>
              {playlistData.name}
            </Text>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setPlaylistMenuVisible(false);
                setNewName(playlistData.name);
                setRenameModalVisible(true);
              }}>
              <View
                style={[
                  styles.iconCircle,
                  {backgroundColor: colors.primaryLight},
                ]}>
                <Icon name="pencil" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.sheetOptionTitle, {color: colors.text}]}>
                Đổi tên playlist
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleDeletePlaylist}>
              <View
                style={[
                  styles.iconCircle,
                  {backgroundColor: colors.error + '20'},
                ]}>
                <Icon name="delete" size={22} color={colors.error} />
              </View>
              <Text style={[styles.sheetOptionTitle, {color: colors.error}]}>
                Xóa playlist
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rename Modal */}
      <CreatePlaylistModal
        visible={renameModalVisible}
        onClose={() => setRenameModalVisible(false)}
        onSubmit={handleRenamePlaylist}
        value={newName}
        onChangeText={setNewName}
        title="Đổi tên playlist"
        subtitle="Nhập tên mới cho playlist"
        buttonText="Lưu"
        iconName="pencil"
      />

      {/* Add Songs Modal (Full Screen) */}
      <Modal
        transparent
        visible={addSongModalVisible}
        animationType="slide"
        onRequestClose={() => setAddSongModalVisible(false)}>
        <View
          style={[
            styles.fullScreenModal,
            {backgroundColor: colors.background},
          ]}>
          <View
            style={[styles.fullScreenHeader, {paddingTop: insets.top + 10}]}>
            <TouchableOpacity
              onPress={() => {
                setAddSongModalVisible(false);
                setSearchQuery('');
                if (token) dispatch(fetchUserPlaylists(token));
              }}
              style={styles.closeBtn}>
              <Icon name="close" size={26} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.fullScreenTitle, {color: colors.text}]}>
              Thêm bài hát
            </Text>
            <View style={{width: 40}} />
          </View>
          <View
            style={[
              styles.searchBar,
              {backgroundColor: colors.inputBackground},
            ]}>
            <Icon name="magnify" size={22} color={colors.placeholder} />
            <TextInput
              style={[styles.searchInput, {color: colors.text}]}
              placeholder="Tìm kiếm bài hát..."
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon
                  name="close-circle"
                  size={20}
                  color={colors.placeholder}
                />
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={filteredAllSongs}
            renderItem={renderAddSongItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{paddingHorizontal: 20, paddingBottom: 30}}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="music-note-off" size={60} color="#ddd" />
                <Text style={styles.emptyText}>Không tìm thấy bài hát</Text>
              </View>
            }
          />
        </View>
      </Modal>

      <MiniPlayer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  coverContainer: {width: width, height: height * 0.45},
  coverImage: {width: '100%', height: '100%', position: 'absolute'},
  coverGradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {flexDirection: 'row', gap: 10},
  playlistInfo: {},
  playlistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  playlistCategory: {fontSize: 15, color: 'rgba(255,255,255,0.8)'},
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 15,
    gap: 15,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  playButtonText: {color: '#fff', fontWeight: '600', fontSize: 16},
  shuffleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  shuffleButtonText: {color: '#333', fontWeight: '600', fontSize: 16},
  listContent: {paddingBottom: 30},
  emptyState: {alignItems: 'center', paddingVertical: 60},
  emptyText: {fontSize: 16, color: '#999', marginTop: 15},
  addSongsButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addSongsButtonText: {color: '#fff', fontWeight: '600', fontSize: 15},

  // Bottom Sheet
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 15,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sheetOptionTitle: {fontSize: 16, fontWeight: '600', color: '#222'},

  // Full Screen Modal
  fullScreenModal: {flex: 1, backgroundColor: '#fff'},
  fullScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenTitle: {fontSize: 18, fontWeight: 'bold', color: '#222'},
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 46,
    marginBottom: 15,
  },
  searchInput: {flex: 1, marginLeft: 10, fontSize: 16, color: '#333'},

  // Add Song Item
  addSongItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  addSongImage: {width: 50, height: 50, borderRadius: 8},
  addSongTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 3,
  },
  addSongArtist: {fontSize: 13, color: '#888'},
  addRemoveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addedButton: {backgroundColor: '#2196F3', borderColor: '#2196F3'},
});

export default PlaylistDetailScreen;
