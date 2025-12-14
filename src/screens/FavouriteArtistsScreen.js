import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

const FavouriteArtistsScreen = () => {
  const navigation = useNavigation();
  const {artists: apiArtists} = useSelector(state => state.music);
  const [searchQuery, setSearchQuery] = useState('');

  // Use API data or fallback to mock
  const artists =
    apiArtists.length > 0
      ? apiArtists
      : [
          {
            id: '1',
            name: 'Arman Malik',
            image: 'https://picsum.photos/100/100?random=20',
          },
          {
            id: '2',
            name: 'Justin Bieber',
            image: 'https://picsum.photos/100/100?random=21',
          },
          {
            id: '3',
            name: 'Katy Perry',
            image: 'https://picsum.photos/100/100?random=22',
          },
          {
            id: '4',
            name: 'Sonu Nigam',
            image: 'https://picsum.photos/100/100?random=23',
          },
          {
            id: '5',
            name: 'Arijit Singh',
            image: 'https://picsum.photos/100/100?random=24',
          },
          {
            id: '6',
            name: 'Shakira',
            image: 'https://picsum.photos/100/100?random=25',
          },
          {
            id: '7',
            name: 'Dua Lipa',
            image: 'https://picsum.photos/100/100?random=26',
          },
          {
            id: '8',
            name: 'Ed Sheeran',
            image: 'https://picsum.photos/100/100?random=27',
          },
          {
            id: '9',
            name: 'Taylor Swift',
            image: 'https://picsum.photos/100/100?random=28',
          },
          {
            id: '10',
            name: 'The Weeknd',
            image: 'https://picsum.photos/100/100?random=29',
          },
        ];

  // Filter artists by name
  const filteredArtists = artists.filter(a =>
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.artistItem}
      onPress={() => navigation.navigate('ArtistDetail', {artist: item})}>
      <Image source={{uri: item.image}} style={styles.artistImage} />
      <Text style={styles.artistName}>{item.name}</Text>
      <Icon name="chevron-right" size={24} color="#ccc" />
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
        <Text style={styles.headerTitle}>Nghệ sĩ yêu thích</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm nghệ sĩ..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Artists List */}
      <FlatList
        data={filteredArtists}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="account-music-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>Không tìm thấy nghệ sĩ</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {fontSize: 20, fontWeight: 'bold', color: '#222'},
  placeholder: {width: 40},

  // Search Bar
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

  listContent: {paddingHorizontal: 20, paddingBottom: 20},
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  artistImage: {width: 55, height: 55, borderRadius: 28},
  artistName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginLeft: 15,
  },

  emptyState: {alignItems: 'center', marginTop: 60},
  emptyText: {fontSize: 16, color: '#999', marginTop: 15},
});

export default FavouriteArtistsScreen;
