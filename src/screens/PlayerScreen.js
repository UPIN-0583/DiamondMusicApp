import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import TrackPlayer, {
  useTrackPlayerEvents,
  Event,
  State,
  useProgress,
  Capability,
} from 'react-native-track-player';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {Slider} from '@miblanchard/react-native-slider';
import {usePlayerStore} from '../store/usePlayerStore';

const {width} = Dimensions.get('window');

const PlayerScreen = () => {
  const {trackList, currentTrackIndex} = usePlayerStore();
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackArtwork, setTrackArtwork] = useState('');
  const [playerState, setPlayerState] = useState(State.None);

  const progress = useProgress();

  const isPlaying = playerState === State.Playing;

  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackError], event => {
    if (event.type === Event.PlaybackState) {
      setPlayerState(event.state);
    }
  });

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async event => {
    if (event.type === Event.PlaybackActiveTrackChanged && event.track) {
      const track = event.track;
      setTrackTitle(track.title);
      setTrackArtist(track.artist);
      setTrackArtwork(track.artwork);
    }
  });

  useEffect(() => {
    // Initial load
    const loadTrackInfo = async () => {
      const track = await TrackPlayer.getActiveTrack();
      if (track) {
        setTrackTitle(track.title);
        setTrackArtist(track.artist);
        setTrackArtwork(track.artwork);
      }
    };
    loadTrackInfo();
  }, []);

  const togglePlayback = async () => {
    const currentTrack = await TrackPlayer.getActiveTrackIndex();
    if (currentTrack != null) {
      if (playerState === State.Paused || playerState === State.Ready) {
        await TrackPlayer.play();
      } else {
        await TrackPlayer.pause();
      }
    }
  };

  const skipToNext = async () => {
    await TrackPlayer.skipToNext();
  };

  const skipToPrevious = async () => {
    await TrackPlayer.skipToPrevious();
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.artworkContainer}>
          {trackArtwork ? (
            <Image source={{uri: trackArtwork}} style={styles.artwork} />
          ) : (
            <View
              style={[
                styles.artwork,
                {
                  backgroundColor: '#2d4059',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}>
              <Icon name="musical-notes" size={100} color="#eaf0f1" />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{trackTitle || 'No Track'}</Text>
          <Text style={styles.artist}>{trackArtist || 'Unknown Artist'}</Text>
        </View>

        <View style={styles.sliderContainer}>
          <Slider
            value={progress.position}
            minimumValue={0}
            maximumValue={progress.duration}
            thumbTintColor="#ea5455"
            minimumTrackTintColor="#ea5455"
            maximumTrackTintColor="rgba(234, 84, 85, 0.3)"
            onSlidingComplete={async value => {
              await TrackPlayer.seekTo(value[0]);
            }}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {new Date(progress.position * 1000).toISOString().substr(14, 5)}
            </Text>
            <Text style={styles.timeText}>
              {new Date(progress.duration * 1000).toISOString().substr(14, 5)}
            </Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={skipToPrevious}
            style={styles.controlButton}>
            <Icon name="play-skip-back" size={32} color="#eaf0f1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={40} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={skipToNext} style={styles.controlButton}>
            <Icon name="play-skip-forward" size={32} color="#eaf0f1" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  artworkContainer: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.8,
    shadowRadius: 15,
    marginBottom: 40,
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#eaf0f1',
    marginBottom: 8,
    textAlign: 'center',
  },
  artist: {
    fontSize: 18,
    color: '#b8c1c8',
  },
  sliderContainer: {
    width: width * 0.85,
    marginBottom: 30,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#b8c1c8',
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.8,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(234, 240, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ea5455',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    elevation: 10,
    shadowColor: '#ea5455',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});

export default PlayerScreen;
