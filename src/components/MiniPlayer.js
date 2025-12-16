import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import TrackPlayer, {
  useTrackPlayerEvents,
  Event,
  State,
  useProgress,
} from 'react-native-track-player';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../themes/ThemeContext';

const MiniPlayer = () => {
  const navigation = useNavigation();
  const {colors} = useTheme();
  const [playerState, setPlayerState] = useState(State.None);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackArtwork, setTrackArtwork] = useState('');
  const [hasActiveTrack, setHasActiveTrack] = useState(false);

  const progress = useProgress();
  const isPlaying = playerState === State.Playing;

  useTrackPlayerEvents(
    [Event.PlaybackState, Event.PlaybackActiveTrackChanged],
    async event => {
      if (event.type === Event.PlaybackState) {
        setPlayerState(event.state);
      }
      if (event.type === Event.PlaybackActiveTrackChanged) {
        if (event.track) {
          setTrackTitle(event.track.title);
          setTrackArtist(event.track.artist);
          setTrackArtwork(event.track.artwork);
          setHasActiveTrack(true);
        } else {
          setHasActiveTrack(false);
        }
      }
    },
  );

  // Load track info khi component mount - quan trọng để detect nhạc đang phát
  useEffect(() => {
    const loadTrackInfo = async () => {
      try {
        const track = await TrackPlayer.getActiveTrack();
        if (track) {
          setTrackTitle(track.title);
          setTrackArtist(track.artist);
          setTrackArtwork(track.artwork);
          setHasActiveTrack(true);
        } else {
          setHasActiveTrack(false);
        }

        // Also get playback state
        const state = await TrackPlayer.getPlaybackState();
        if (state && state.state) {
          setPlayerState(state.state);
        }
      } catch (error) {
        console.log('MiniPlayer loadTrackInfo error:', error);
        setHasActiveTrack(false);
      }
    };
    loadTrackInfo();
  }, []);

  const togglePlayback = async () => {
    if (playerState === State.Paused || playerState === State.Ready) {
      await TrackPlayer.play();
    } else {
      await TrackPlayer.pause();
    }
  };

  const skipToNext = async () => {
    await TrackPlayer.skipToNext();
  };

  const skipToPrevious = async () => {
    await TrackPlayer.skipToPrevious();
  };

  // Ẩn MiniPlayer nếu không có track active hoặc player đã dừng
  if (
    !hasActiveTrack ||
    playerState === State.None ||
    playerState === State.Stopped
  ) {
    return null;
  }

  const progressPercent =
    progress.duration > 0 ? (progress.position / progress.duration) * 100 : 0;

  // Handler for navigating to Player screen
  const handleNavigateToPlayer = () => {
    // Try getParent first (for screens inside BottomTabNavigator)
    const parentNavigation = navigation.getParent();
    if (parentNavigation) {
      parentNavigation.navigate('Player');
    } else {
      // Fallback to direct navigation (for screens in Stack Navigator)
      navigation.navigate('Player');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {backgroundColor: colors.card, borderTopColor: colors.border},
      ]}
      onPress={handleNavigateToPlayer}
      activeOpacity={0.95}>
      {/* Progress Bar */}
      <View style={[styles.progressBar, {backgroundColor: colors.border}]}>
        <View
          style={[
            styles.progressFill,
            {width: `${progressPercent}%`, backgroundColor: colors.primary},
          ]}
        />
      </View>

      <View style={styles.content}>
        {/* Album Artwork */}
        <View style={styles.artworkContainer}>
          {trackArtwork ? (
            <Image source={{uri: trackArtwork}} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.artworkPlaceholder]}>
              <Icon name="music" size={20} color="#999" />
            </View>
          )}
        </View>

        {/* Song Info */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, {color: colors.text}]} numberOfLines={1}>
            {trackTitle || 'No Track'}
          </Text>
          <Text
            style={[styles.artist, {color: colors.textSecondary}]}
            numberOfLines={1}>
            {trackArtist || 'Unknown Artist'}
          </Text>
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          {/* Previous Button */}
          <TouchableOpacity
            onPress={skipToPrevious}
            style={styles.controlButton}>
            <Icon name="skip-previous" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Play/Pause Button */}
          <TouchableOpacity
            onPress={togglePlayback}
            style={[styles.playButton, {backgroundColor: colors.primary}]}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={24} color="#fff" />
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity onPress={skipToNext} style={styles.controlButton}>
            <Icon name="skip-next" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    height: 70,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  artworkContainer: {
    marginRight: 12,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  artworkPlaceholder: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 3,
  },
  artist: {
    fontSize: 13,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
});

export default MiniPlayer;
