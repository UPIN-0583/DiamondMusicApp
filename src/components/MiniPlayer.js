import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import TrackPlayer, {
  useTrackPlayerEvents,
  Event,
  State,
} from 'react-native-track-player';
import Icon from 'react-native-vector-icons/Ionicons';
import {usePlayerStore} from '../store/usePlayerStore';
import {useNavigation} from '@react-navigation/native';

const MiniPlayer = () => {
  const navigation = useNavigation();
  const [playerState, setPlayerState] = useState(State.None);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');

  const isPlaying = playerState === State.Playing;

  useTrackPlayerEvents(
    [Event.PlaybackState, Event.PlaybackActiveTrackChanged],
    async event => {
      if (event.type === Event.PlaybackState) {
        setPlayerState(event.state);
      }
      if (event.type === Event.PlaybackActiveTrackChanged && event.track) {
        setTrackTitle(event.track.title);
        setTrackArtist(event.track.artist);
      }
    },
  );

  const togglePlayback = async () => {
    if (playerState === State.Paused || playerState === State.Ready) {
      await TrackPlayer.play();
    } else {
      await TrackPlayer.pause();
    }
  };

  if (playerState === State.None || playerState === State.Stopped) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Player')}
      activeOpacity={0.9}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {trackTitle}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {trackArtist}
          </Text>
        </View>
        <TouchableOpacity onPress={togglePlayback} style={{padding: 5}}>
          <Icon name={isPlaying ? 'pause' : 'play'} size={32} color="#ea5455" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderTopWidth: 2,
    borderTopColor: '#ea5455',
    padding: 15,
    height: 70,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#eaf0f1',
    marginBottom: 4,
  },
  artist: {
    fontSize: 13,
    color: '#b8c1c8',
  },
});

export default MiniPlayer;
