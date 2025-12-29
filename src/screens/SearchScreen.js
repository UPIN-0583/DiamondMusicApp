import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import {usePlayerStore} from '../store/usePlayerStore';
import TrackPlayer from 'react-native-track-player';
import MiniPlayer from '../components/MiniPlayer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useRoute, useNavigation} from '@react-navigation/native';
import {searchByLyrics} from '../services/api';
import {useSelector} from 'react-redux';
import {useTheme} from '../themes/ThemeContext';

const SearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {colors} = useTheme();
  const {trackList, playFromQueue} = usePlayerStore();
  const {artists} = useSelector(state => state.music);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Songs');
  const [lyricsResults, setLyricsResults] = useState([]);
  const [isSearchingLyrics, setIsSearchingLyrics] = useState(false);
  const [lyricsSearchMethod, setLyricsSearchMethod] = useState('');

  // Receive initial query from voice search
  useEffect(() => {
    if (route.params?.initialQuery) {
      setSearchQuery(route.params.initialQuery);
      // Auto-search lyrics when coming from voice search
      setActiveFilter('Lyrics');
      handleLyricsSearch(route.params.initialQuery);
    }
  }, [route.params?.initialQuery]);

  const filters = ['Songs', 'Artists', 'Lyrics'];

  // Debounced lyrics search
  const handleLyricsSearch = useCallback(async query => {
    if (!query || query.trim().length < 2) {
      setLyricsResults([]);
      return;
    }

    setIsSearchingLyrics(true);
    try {
      const response = await searchByLyrics(query.trim(), 15);
      if (response.success) {
        setLyricsResults(response.results);
        setLyricsSearchMethod(response.searchMethod);
      } else {
        setLyricsResults([]);
      }
    } catch (error) {
      console.error('Lyrics search error:', error);
      setLyricsResults([]);
    } finally {
      setIsSearchingLyrics(false);
    }
  }, []);

  // Auto search when filter is Lyrics and query changes
  useEffect(() => {
    if (activeFilter === 'Lyrics' && searchQuery.length >= 2) {
      const debounce = setTimeout(() => {
        handleLyricsSearch(searchQuery);
      }, 500);
      return () => clearTimeout(debounce);
    }
  }, [searchQuery, activeFilter, handleLyricsSearch]);

  const handlePlayTrack = async index => {
    await playFromQueue(trackList, index);
    navigation.navigate('Player');
  };

  // Play a song from lyrics search results
  const handlePlayLyricsResult = async item => {
    // Transform lyrics result to track format
    const track = {
      id: item.song_id?.toString(),
      url: item.audio_url,
      title: item.title,
      artist: item.artist_name,
      artwork: item.image_url,
      duration: item.duration,
    };

    // Check if track already exists in trackList
    const existingIndex = trackList.findIndex(
      t => t.id === track.id || t.url === track.url,
    );

    if (existingIndex >= 0) {
      setCurrentTrackIndex(existingIndex);
      await TrackPlayer.reset();
      await TrackPlayer.add(trackList);
      await TrackPlayer.skip(existingIndex);
      await TrackPlayer.play();
    } else {
      // Add to track list and play
      const newTrackList = [track, ...trackList];
      setTrackList(newTrackList);
      setCurrentTrackIndex(0);
      await TrackPlayer.reset();
      await TrackPlayer.add(newTrackList);
      await TrackPlayer.skip(0);
      await TrackPlayer.play();
    }
    navigation.navigate('Player');
  };

  // Navigate to artist detail
  const handleArtistPress = artist => {
    navigation.navigate('ArtistDetail', {artist});
  };

  // Filter tracks for local song search
  const filteredTracks = trackList.filter(
    track =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Filter artists for artist search
  const filteredArtists = artists.filter(artist =>
    artist.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderFilterChip = filter => {
    const getFilterLabel = f => {
      switch (f) {
        case 'Songs':
          return 'Bài hát';
        case 'Artists':
          return 'Nghệ sĩ';
        case 'Lyrics':
          return 'Lời bài hát';
        default:
          return f;
      }
    };

    const getFilterIcon = f => {
      switch (f) {
        case 'Songs':
          return 'music-note';
        case 'Artists':
          return 'account-music';
        case 'Lyrics':
          return 'text-search';
        default:
          return 'magnify';
      }
    };

    return (
      <TouchableOpacity
        key={filter}
        style={[
          styles.filterChip,
          {
            backgroundColor:
              activeFilter === filter ? colors.primary : colors.inputBackground,
          },
          filter === 'Lyrics' &&
            activeFilter !== filter && {backgroundColor: colors.surfaceVariant},
        ]}
        onPress={() => {
          setActiveFilter(filter);
          if (filter === 'Lyrics' && searchQuery.length >= 2) {
            handleLyricsSearch(searchQuery);
          }
        }}>
        <Icon
          name={getFilterIcon(filter)}
          size={16}
          color={
            activeFilter === filter
              ? '#fff'
              : filter === 'Lyrics'
              ? colors.accent
              : colors.textSecondary
          }
          style={{marginRight: 6}}
        />
        <Text
          style={[
            styles.filterChipText,
            {color: activeFilter === filter ? '#fff' : colors.textSecondary},
            filter === 'Lyrics' &&
              activeFilter !== filter && {color: colors.accent},
          ]}>
          {getFilterLabel(filter)}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render song item
  const renderSongItem = ({item, index}) => {
    const originalIndex = trackList.findIndex(t => t.id === item.id);
    return (
      <TouchableOpacity
        style={[styles.songItem, {borderBottomColor: colors.border}]}
        onPress={() => handlePlayTrack(originalIndex)}>
        <Image source={{uri: item.artwork}} style={styles.songImage} />
        <View style={styles.songInfo}>
          <Text
            style={[styles.songTitle, {color: colors.text}]}
            numberOfLines={1}>
            {item.title}
          </Text>
          <Text
            style={[styles.songArtist, {color: colors.textSecondary}]}
            numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        <TouchableOpacity style={styles.playIcon}>
          <Icon name="play-circle-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render artist item (like FavoriteArtist)
  const renderArtistItem = ({item}) => (
    <TouchableOpacity
      style={[styles.artistItem, {borderBottomColor: colors.border}]}
      onPress={() => handleArtistPress(item)}>
      <Image source={{uri: item.image}} style={styles.artistImage} />
      <Text style={[styles.artistName, {color: colors.text}]}>{item.name}</Text>
      <Icon name="chevron-right" size={24} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  // Render lyrics search result item
  const renderLyricsItem = ({item}) => (
    <TouchableOpacity
      style={[styles.lyricsItem, {borderBottomColor: colors.border}]}
      onPress={() => handlePlayLyricsResult(item)}>
      <Image source={{uri: item.image_url}} style={styles.songImage} />
      <View style={styles.lyricsInfo}>
        <Text
          style={[styles.songTitle, {color: colors.text}]}
          numberOfLines={1}>
          {item.title}
        </Text>
        <Text
          style={[styles.songArtist, {color: colors.textSecondary}]}
          numberOfLines={1}>
          {item.artist_name}
        </Text>
        {item.lyrics_snippet && (
          <Text
            style={[styles.lyricsSnippet, {color: colors.accent}]}
            numberOfLines={2}>
            {item.lyrics_snippet
              .replace(/<mark>/g, '')
              .replace(/<\/mark>/g, '')}
          </Text>
        )}
      </View>
      <View style={styles.playIconContainer}>
        <Icon name="play-circle" size={32} color={colors.accent} />
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    // Songs tab
    if (activeFilter === 'Songs') {
      return (
        <FlatList
          data={searchQuery.length > 0 ? filteredTracks : trackList}
          renderItem={renderSongItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon
                name="music-note-off"
                size={60}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                Không tìm thấy bài hát
              </Text>
            </View>
          }
        />
      );
    }

    // Artists tab
    if (activeFilter === 'Artists') {
      return (
        <FlatList
          data={searchQuery.length > 0 ? filteredArtists : artists}
          renderItem={renderArtistItem}
          keyExtractor={item => item.id?.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon
                name="account-music-outline"
                size={60}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                Không tìm thấy nghệ sĩ
              </Text>
            </View>
          }
        />
      );
    }

    // Lyrics tab
    if (activeFilter === 'Lyrics') {
      return (
        <>
          {isSearchingLyrics ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, {color: colors.textSecondary}]}>
                Đang tìm kiếm lời bài hát...
              </Text>
            </View>
          ) : (
            <FlatList
              data={lyricsResults}
              renderItem={renderLyricsItem}
              keyExtractor={item => `lyrics-${item.song_id}`}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                lyricsResults.length > 0 ? (
                  <View style={styles.lyricsHeader}>
                    <Text
                      style={[styles.lyricsHeaderText, {color: colors.text}]}>
                      Tìm thấy {lyricsResults.length} kết quả
                    </Text>
                    {lyricsSearchMethod && (
                      <Text
                        style={[
                          styles.searchMethodText,
                          {color: colors.accent},
                        ]}>
                        {lyricsSearchMethod === 'fulltext'
                          ? '• Full-text'
                          : lyricsSearchMethod === 'fuzzy'
                          ? '• Fuzzy'
                          : ''}
                      </Text>
                    )}
                  </View>
                ) : null
              }
              ListEmptyComponent={
                searchQuery.length >= 2 ? (
                  <View style={styles.emptyContainer}>
                    <Icon
                      name="music-note-off"
                      size={60}
                      color={colors.textTertiary}
                    />
                    <Text
                      style={[styles.emptyText, {color: colors.textSecondary}]}>
                      Không tìm thấy bài hát với lời này
                    </Text>
                    <Text
                      style={[styles.emptyHint, {color: colors.textTertiary}]}>
                      Thử nhập một đoạn lời khác
                    </Text>
                  </View>
                ) : (
                  <View style={styles.hintContainer}>
                    <Icon
                      name="lightbulb-outline"
                      size={40}
                      color={colors.accent}
                    />
                    <Text style={[styles.hintTitle, {color: colors.text}]}>
                      Tìm kiếm bằng lời bài hát
                    </Text>
                    <Text
                      style={[styles.hintText, {color: colors.textSecondary}]}>
                      Nhập một đoạn lời bài hát để tìm kiếm.{'\n'}
                      Có thể nhập tiếng Việt có dấu hoặc không dấu.
                    </Text>
                  </View>
                )
              }
            />
          )}
        </>
      );
    }

    return null;
  };

  const getPlaceholder = () => {
    switch (activeFilter) {
      case 'Songs':
        return 'Tìm kiếm bài hát...';
      case 'Artists':
        return 'Tìm kiếm nghệ sĩ...';
      case 'Lyrics':
        return 'Nhập lời bài hát...';
      default:
        return 'Tìm kiếm...';
    }
  };

  const getSectionTitle = () => {
    switch (activeFilter) {
      case 'Songs':
        return 'Bài hát';
      case 'Artists':
        return 'Nghệ sĩ';
      case 'Lyrics':
        return 'Kết quả tìm theo lời';
      default:
        return 'Kết quả';
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>Tìm kiếm</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[styles.searchBar, {backgroundColor: colors.inputBackground}]}>
          <Icon name="magnify" size={22} color={colors.placeholder} />
          <TextInput
            style={[styles.searchInput, {color: colors.text}]}
            placeholder={getPlaceholder()}
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={colors.placeholder} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Section Title */}
      <Text style={[styles.sectionTitle, {color: colors.text}]}>
        {getSectionTitle()}
      </Text>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        {filters.map(filter => renderFilterChip(filter))}
      </View>

      {/* Content */}
      {renderContent()}

      <MiniPlayer />
    </View>
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
    paddingBottom: 5,
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
  },
  lyricsChip: {
    backgroundColor: '#F3E5F5',
  },
  lyricsChipActive: {
    backgroundColor: '#9C27B0',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  lyricsChipText: {
    color: '#9C27B0',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // Song item
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
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
  playIcon: {
    padding: 5,
  },
  // Artist item (like FavoriteArtist)
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  artistImage: {
    width: 55,
    height: 55,
    borderRadius: 28,
  },
  artistName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginLeft: 15,
  },
  // Lyrics item
  lyricsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lyricsInfo: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  lyricsSnippet: {
    fontSize: 12,
    color: '#9C27B0',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
  playIconContainer: {
    padding: 5,
  },
  // Loading & Empty states
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
    marginTop: 15,
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
  emptyHint: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
  },
  hintContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  hintTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9C27B0',
    marginTop: 15,
    marginBottom: 10,
  },
  hintText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  lyricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  lyricsHeaderText: {
    fontSize: 14,
    color: '#666',
  },
  searchMethodText: {
    fontSize: 12,
    color: '#9C27B0',
    marginLeft: 8,
  },
});

export default SearchScreen;
