import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {usePlayerStore} from '../store/usePlayerStore';
import TrackPlayer from 'react-native-track-player';
import MiniPlayer from '../components/MiniPlayer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SearchScreen = ({navigation}) => {
  const {trackList, setCurrentTrackIndex} = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Artist', 'Album', 'Playlist'];

  const handlePlayTrack = async index => {
    setCurrentTrackIndex(index);
    await TrackPlayer.reset();
    await TrackPlayer.add(trackList);
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
    navigation.getParent().navigate('Player');
  };

  const filteredTracks = trackList.filter(
    track =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderFilterChip = filter => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterChip,
        activeFilter === filter && styles.filterChipActive,
      ]}
      onPress={() => setActiveFilter(filter)}>
      <Text
        style={[
          styles.filterChipText,
          activeFilter === filter && styles.filterChipTextActive,
        ]}>
        {filter}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({item, index}) => {
    const originalIndex = trackList.findIndex(t => t.id === item.id);
    return (
      <TouchableOpacity
        style={styles.songItem}
        onPress={() => handlePlayTrack(originalIndex)}>
        <Image source={{uri: item.artwork}} style={styles.songImage} />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={22} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Top Result Title */}
      <Text style={styles.sectionTitle}>Top Result</Text>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        {filters.map(filter => renderFilterChip(filter))}
      </View>

      {/* Results List */}
      <FlatList
        data={searchQuery.length > 0 ? filteredTracks : trackList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="music-note-off" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
          </View>
        }
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 18,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  songImage: {
    width: 55,
    height: 55,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: '#888',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 15,
  },
});

export default SearchScreen;
