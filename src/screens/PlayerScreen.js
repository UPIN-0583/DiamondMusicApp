import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import TrackPlayer, {
  useTrackPlayerEvents,
  Event,
  State,
  useProgress,
  RepeatMode,
} from 'react-native-track-player';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Slider} from '@miblanchard/react-native-slider';
import {usePlayerStore} from '../store/usePlayerStore';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {toggleLikeSong} from '../redux/slices/authSlice';
import {
  fetchUserPlaylists,
  addSongToPlaylistThunk,
} from '../redux/slices/musicSlice';
import PlaylistSelectModal from '../components/PlaylistSelectModal';
import {useTheme} from '../themes/ThemeContext';

const {width, height} = Dimensions.get('window');

const SPEED_OPTIONS = [
  {label: '0.5x (Chậm)', value: 0.5},
  {label: '0.75x', value: 0.75},
  {label: '1x (Bình thường)', value: 1},
  {label: '1.25x', value: 1.25},
  {label: '1.5x (Nhanh)', value: 1.5},
  {label: '2x (Rất nhanh)', value: 2},
];

const REPEAT_LABELS = ['Tất lặp lại', 'Lặp lại playlist', 'Lặp lại 1 bài'];

const PlayerScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {colors} = useTheme();
  const {trackList, currentTrackIndex, setTrackList} = usePlayerStore();

  const {token, likedSongs} = useSelector(state => state.auth);
  const {userPlaylists, artists} = useSelector(state => state.music);

  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackArtwork, setTrackArtwork] = useState('');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playerState, setPlayerState] = useState(State.None);

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const [speedModalVisible, setSpeedModalVisible] = useState(false);
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
  const [addToPlaylistModalVisible, setAddToPlaylistModalVisible] =
    useState(false);

  const progress = useProgress();
  const isPlaying = playerState === State.Playing;

  const isLiked =
    currentTrack &&
    likedSongs.some(
      s =>
        s.song_id?.toString() ===
        (currentTrack.id || currentTrack.song_id)?.toString(),
    );

  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackError], event => {
    if (event.type === Event.PlaybackState) setPlayerState(event.state);
  });

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async event => {
    if (event.type === Event.PlaybackActiveTrackChanged && event.track) {
      setTrackTitle(event.track.title);
      setTrackArtist(event.track.artist);
      setTrackArtwork(event.track.artwork);
      setCurrentTrack(event.track);
    }
  });

  useEffect(() => {
    const loadTrackInfo = async () => {
      const track = await TrackPlayer.getActiveTrack();
      if (track) {
        setTrackTitle(track.title);
        setTrackArtist(track.artist);
        setTrackArtwork(track.artwork);
        setCurrentTrack(track);
      }
      // Also load current playback state
      const state = await TrackPlayer.getPlaybackState();
      setPlayerState(state.state);
    };
    loadTrackInfo();
  }, []);

  useEffect(() => {
    const applyRepeatMode = async () => {
      const modes = [RepeatMode.Off, RepeatMode.Queue, RepeatMode.Track];
      await TrackPlayer.setRepeatMode(modes[repeatMode]);
    };
    applyRepeatMode();
  }, [repeatMode]);

  const togglePlayback = async () => {
    const idx = await TrackPlayer.getActiveTrackIndex();
    if (idx != null) {
      if (playerState === State.Paused || playerState === State.Ready) {
        await TrackPlayer.play();
      } else {
        await TrackPlayer.pause();
      }
    }
  };

  const skipToNext = async () => {
    if (isShuffle) {
      const queue = await TrackPlayer.getQueue();
      const currentIdx = await TrackPlayer.getActiveTrackIndex();
      if (queue.length > 1) {
        let randomIdx;
        do {
          randomIdx = Math.floor(Math.random() * queue.length);
        } while (randomIdx === currentIdx);
        await TrackPlayer.skip(randomIdx);
      }
    } else {
      await TrackPlayer.skipToNext();
    }
  };

  const skipToPrevious = async () => await TrackPlayer.skipToPrevious();
  const handleShuffle = () => setIsShuffle(!isShuffle);

  const handleSpeedChange = async speed => {
    await TrackPlayer.setRate(speed);
    setPlaybackSpeed(speed);
    setSpeedModalVisible(false);
  };

  const handleLikeSong = () => {
    if (!currentTrack || !token)
      return Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài hát');
    dispatch(
      toggleLikeSong({
        token,
        songId: currentTrack.id || currentTrack.song_id,
        isLiked,
      }),
    );
    Alert.alert(
      'Thành công',
      isLiked ? 'Đã bỏ yêu thích bài hát' : 'Đã thêm vào yêu thích',
    );
  };

  const handleAddToPlaylist = () => {
    setHeaderMenuVisible(false);
    if (!token)
      return Alert.alert('Thông báo', 'Vui lòng đăng nhập để sử dụng');
    if (userPlaylists.length === 0) dispatch(fetchUserPlaylists(token));
    setAddToPlaylistModalVisible(true);
  };

  const handleSelectPlaylist = playlistId => {
    if (!currentTrack || !token) return;
    dispatch(
      addSongToPlaylistThunk({
        token,
        playlistId,
        songId: currentTrack.id || currentTrack.song_id,
      }),
    )
      .unwrap()
      .then(() => Alert.alert('Thành công', 'Đã thêm vào playlist'))
      .catch(err => Alert.alert('Lỗi', err));
    setAddToPlaylistModalVisible(false);
  };

  const handleViewArtist = () => {
    setHeaderMenuVisible(false);
    if (currentTrack?.artistId) {
      // Tìm ảnh nghệ sĩ đúng từ danh sách artists
      const artistData = artists.find(
        a => a.id?.toString() === currentTrack.artistId?.toString(),
      );
      navigation.navigate('ArtistDetail', {
        artist: {
          id: currentTrack.artistId,
          name: trackArtist,
          image: artistData?.image || currentTrack.artistImage || trackArtwork,
        },
      });
    } else {
      Alert.alert('Thông báo', 'Không có thông tin nghệ sĩ');
    }
  };

  const formatTime = s =>
    `${Math.floor(s / 60)}:${Math.floor(s % 60)
      .toString()
      .padStart(2, '0')}`;
  const getRepeatIcon = () => (repeatMode === 2 ? 'repeat-once' : 'repeat');

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
        translucent={false}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}>
          <Icon name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setHeaderMenuVisible(true)}>
          <Icon name="dots-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        {trackArtwork ? (
          <Image source={{uri: trackArtwork}} style={styles.artwork} />
        ) : (
          <View
            style={[
              styles.artwork,
              styles.artworkPlaceholder,
              {backgroundColor: colors.surfaceVariant},
            ]}>
            <Icon name="music" size={80} color={colors.textTertiary} />
          </View>
        )}
      </View>

      {/* Song Info */}
      <View style={styles.songInfoContainer}>
        <TouchableOpacity onPress={handleLikeSong}>
          <Icon
            name={isLiked ? 'heart' : 'heart-outline'}
            size={26}
            color={isLiked ? '#ff4757' : colors.textSecondary}
          />
        </TouchableOpacity>
        <View style={styles.songTextContainer}>
          <Text
            style={[styles.songTitle, {color: colors.text}]}
            numberOfLines={1}>
            {trackTitle || 'No Track'}
          </Text>
          <Text
            style={[styles.songArtist, {color: colors.textSecondary}]}
            numberOfLines={1}>
            {trackArtist || 'Unknown Artist'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setSpeedModalVisible(true)}>
          <Icon name="speedometer" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Slider
          value={progress.position}
          minimumValue={0}
          maximumValue={progress.duration || 1}
          thumbTintColor={colors.primary}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbStyle={styles.thumbStyle}
          trackStyle={styles.trackStyle}
          onSlidingComplete={async v => await TrackPlayer.seekTo(v[0])}
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, {color: colors.textSecondary}]}>
            {formatTime(progress.position)}
          </Text>
          <Text style={[styles.speedIndicator, {color: colors.primary}]}>
            {playbackSpeed !== 1 ? `${playbackSpeed}x` : ''}
          </Text>
          <Text style={[styles.timeText, {color: colors.textSecondary}]}>
            {formatTime(progress.duration || 0)}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handleShuffle} style={styles.sideButton}>
          <Icon
            name="shuffle-variant"
            size={24}
            color={isShuffle ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipToPrevious} style={styles.controlButton}>
          <Icon name="skip-previous" size={35} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={togglePlayback}
          style={[styles.playButton, {backgroundColor: colors.primary}]}>
          <Icon name={isPlaying ? 'pause' : 'play'} size={35} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipToNext} style={styles.controlButton}>
          <Icon name="skip-next" size={35} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const newMode = (repeatMode + 1) % 3;
            setRepeatMode(newMode);
            Alert.alert('Lặp lại', REPEAT_LABELS[newMode]);
          }}
          style={styles.sideButton}>
          <Icon
            name={getRepeatIcon()}
            size={24}
            color={repeatMode > 0 ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* ===== SPEED MODAL (Bottom Sheet) ===== */}
      <Modal
        transparent
        visible={speedModalVisible}
        animationType="slide"
        onRequestClose={() => setSpeedModalVisible(false)}>
        <TouchableOpacity
          style={styles.bottomSheetOverlay}
          activeOpacity={1}
          onPress={() => setSpeedModalVisible(false)}>
          <View style={[styles.bottomSheet, {backgroundColor: colors.card}]}>
            <View
              style={[styles.dragHandle, {backgroundColor: colors.border}]}
            />
            <Text style={[styles.sheetTitle, {color: colors.text}]}>
              Tốc độ phát
            </Text>
            {SPEED_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sheetOption,
                  playbackSpeed === option.value && {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
                onPress={() => handleSpeedChange(option.value)}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        playbackSpeed === option.value
                          ? colors.primaryLight
                          : colors.surfaceVariant,
                    },
                  ]}>
                  <Icon
                    name="speedometer"
                    size={20}
                    color={
                      playbackSpeed === option.value
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.sheetOptionTitle,
                    {
                      color:
                        playbackSpeed === option.value
                          ? colors.primary
                          : colors.text,
                    },
                  ]}>
                  {option.label}
                </Text>
                {playbackSpeed === option.value && (
                  <Icon name="check-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ===== HEADER MENU MODAL (Bottom Sheet) ===== */}
      <Modal
        transparent
        visible={headerMenuVisible}
        animationType="slide"
        onRequestClose={() => setHeaderMenuVisible(false)}>
        <TouchableOpacity
          style={styles.bottomSheetOverlay}
          activeOpacity={1}
          onPress={() => setHeaderMenuVisible(false)}>
          <View style={[styles.bottomSheet, {backgroundColor: colors.card}]}>
            <View
              style={[styles.dragHandle, {backgroundColor: colors.border}]}
            />

            {/* Current Song Info */}
            {currentTrack && (
              <View style={styles.songInfoHeader}>
                <Image
                  source={{uri: trackArtwork}}
                  style={styles.songInfoImage}
                />
                <View style={{flex: 1}}>
                  <Text
                    style={[styles.songInfoTitle, {color: colors.text}]}
                    numberOfLines={1}>
                    {trackTitle}
                  </Text>
                  <Text
                    style={[
                      styles.songInfoArtist,
                      {color: colors.textSecondary},
                    ]}
                    numberOfLines={1}>
                    {trackArtist}
                  </Text>
                </View>
              </View>
            )}
            <View
              style={[styles.sheetDivider, {backgroundColor: colors.border}]}
            />

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleAddToPlaylist}>
              <View
                style={[
                  styles.iconCircle,
                  {backgroundColor: colors.success + '20'},
                ]}>
                <Icon name="playlist-plus" size={22} color={colors.success} />
              </View>
              <View style={styles.sheetOptionText}>
                <Text style={[styles.sheetOptionTitle, {color: colors.text}]}>
                  Thêm vào Playlist
                </Text>
                <Text
                  style={[
                    styles.sheetOptionSub,
                    {color: colors.textSecondary},
                  ]}>
                  Lưu vào playlist của bạn
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleViewArtist}>
              <View
                style={[
                  styles.iconCircle,
                  {backgroundColor: colors.accent + '20'},
                ]}>
                <Icon name="account-music" size={22} color={colors.accent} />
              </View>
              <View style={styles.sheetOptionText}>
                <Text style={[styles.sheetOptionTitle, {color: colors.text}]}>
                  Xem nghệ sĩ
                </Text>
                <Text
                  style={[
                    styles.sheetOptionSub,
                    {color: colors.textSecondary},
                  ]}>
                  Đến trang nghệ sĩ
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add To Playlist Modal */}
      <PlaylistSelectModal
        visible={addToPlaylistModalVisible}
        onClose={() => setAddToPlaylistModalVisible(false)}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkContainer: {alignItems: 'center', marginBottom: 30},
  artwork: {width: width * 0.75, height: width * 0.75, borderRadius: 20},
  artworkPlaceholder: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  songTextContainer: {flex: 1, alignItems: 'center', paddingHorizontal: 15},
  songTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 5,
  },
  songArtist: {fontSize: 16, color: '#666', textAlign: 'center'},
  progressContainer: {paddingHorizontal: 30, marginBottom: 30},
  thumbStyle: {width: 12, height: 12},
  trackStyle: {height: 3},
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  timeText: {fontSize: 13, color: '#2196F3', fontWeight: '500'},
  speedIndicator: {fontSize: 13, color: '#ff9800', fontWeight: '600'},
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  sideButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 55,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    elevation: 5,
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

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
  sheetDivider: {height: 1, backgroundColor: '#f0f0f0', marginVertical: 15},
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  sheetOptionActive: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sheetOptionText: {flex: 1},
  sheetOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 3,
  },
  sheetOptionSub: {fontSize: 13, color: '#888'},

  // Song Info in Modal
  songInfoHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 5},
  songInfoImage: {width: 55, height: 55, borderRadius: 10, marginRight: 15},
  songInfoTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 3,
  },
  songInfoArtist: {fontSize: 14, color: '#888'},

  // Playlist Item
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  playlistItemIcon: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  playlistItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 3,
  },
  playlistItemCount: {fontSize: 13, color: '#888'},

  emptyState: {alignItems: 'center', paddingVertical: 40},
  emptyText: {fontSize: 16, color: '#999', marginTop: 15},
});

export default PlayerScreen;
