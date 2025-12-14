import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const TopPlaylistsScreen = () => {
  const navigation = useNavigation();
  const {playlists: globalPlaylists} = useSelector(state => state.music);

  // Use API data or fallback to mock
  const playlists =
    globalPlaylists.length > 0
      ? globalPlaylists
      : [
          {
            id: '1',
            name: 'Bollywood Romance',
            category: 'Bollywood Music',
            image: 'https://picsum.photos/200/200?random=30',
          },
          {
            id: '2',
            name: 'New Music Daily',
            category: 'Music Hits',
            image: 'https://picsum.photos/200/200?random=31',
          },
          {
            id: '3',
            name: 'All Day Dance',
            category: 'Music Dance',
            image: 'https://picsum.photos/200/200?random=32',
          },
          {
            id: '4',
            name: 'New in Hip-Hop',
            category: 'Hip-Hop Music',
            image: 'https://picsum.photos/200/200?random=33',
          },
          {
            id: '5',
            name: 'Everyday Hits',
            category: 'Music Hits',
            image: 'https://picsum.photos/200/200?random=34',
          },
          {
            id: '6',
            name: 'Lofi Sunday',
            category: 'Chill Music',
            image: 'https://picsum.photos/200/200?random=35',
          },
          {
            id: '7',
            name: 'Workout Mix',
            category: 'Fitness',
            image: 'https://picsum.photos/200/200?random=36',
          },
          {
            id: '8',
            name: 'Study Vibes',
            category: 'Focus Music',
            image: 'https://picsum.photos/200/200?random=37',
          },
        ];

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.playlistCard}
      onPress={() => navigation.navigate('PlaylistDetail', {playlist: item})}>
      <Image source={{uri: item.image}} style={styles.playlistImage} />
      <Text style={styles.playlistName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.playlistCategory} numberOfLines={1}>
        {item.category}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Playlists</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Playlists Grid */}
      <FlatList
        data={playlists}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  playlistCard: {
    width: CARD_WIDTH,
  },
  playlistImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 12,
    marginBottom: 10,
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 3,
  },
  playlistCategory: {
    fontSize: 13,
    color: '#888',
  },
});

export default TopPlaylistsScreen;
