import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { usePlayerStore } from '../store/usePlayerStore';
import TrackPlayer from 'react-native-track-player';
import MiniPlayer from '../components/MiniPlayer';

const HomeScreen = ({ navigation }) => {
  const { trackList, setCurrentTrackIndex } = usePlayerStore();

  const handlePlayTrack = async index => {
    setCurrentTrackIndex(index);
    await TrackPlayer.reset();
    await TrackPlayer.add(trackList);
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
    navigation.navigate('Player');
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handlePlayTrack(index)}
    >
      <Image source={{ uri: item.artwork }} style={styles.artwork} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.artist}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={trackList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
      <MiniPlayer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  infoContainer: {
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  artist: {
    color: '#666',
  },
});

export default HomeScreen;
