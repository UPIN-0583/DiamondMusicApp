import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector, useDispatch} from 'react-redux';
import {usePlayerStore} from '../store/usePlayerStore';

import {getAIRecommendations, createPlaylistWithSongs} from '../services/api';
import SongItem from '../components/SongItem';
import SongOptionsModal from '../components/SongOptionsModal';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import PlaylistSelectModal from '../components/PlaylistSelectModal';
import MiniPlayer from '../components/MiniPlayer';
import {
  fetchUserPlaylists,
  addSongToPlaylistThunk,
} from '../redux/slices/musicSlice';
import {toggleLikeSong} from '../redux/slices/authSlice';
import {useTheme} from '../themes/ThemeContext';

const {width} = Dimensions.get('window');

const AIChatScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {colors} = useTheme();
  const {playFromQueue} = usePlayerStore();
  const {token, likedSongs} = useSelector(state => state.auth);
  const {userPlaylists, artists} = useSelector(state => state.music);

  // Chat state
  const [messages, setMessages] = useState([
    {
      id: '0',
      type: 'bot',
      text: 'Xin chào! Tôi là trợ lý AI âm nhạc. Hãy cho tôi biết tâm trạng hoặc sở thích của bạn và tôi sẽ gợi ý nhạc phù hợp nhé! 🎵',
      songs: [],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  // Song options modal state
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  // Playlist modals state
  const [playlistSelectVisible, setPlaylistSelectVisible] = useState(false);
  const [createPlaylistVisible, setCreatePlaylistVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [currentRecommendedSongs, setCurrentRecommendedSongs] = useState([]);

  // Create playlist with all recommended songs modal
  const [createFromRecommendVisible, setCreateFromRecommendVisible] =
    useState(false);
  const [recommendPlaylistName, setRecommendPlaylistName] = useState('');

  useEffect(() => {
    if (token) {
      dispatch(fetchUserPlaylists(token));
    }
  }, [token, dispatch]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await getAIRecommendations(inputText.trim());

      if (response.success) {
        const songs = response.data.songs.map(song => ({
          id: song.song_id.toString(),
          url: song.audio_url,
          title: song.title,
          artist: song.artist_name,
          artistId: song.artist_id,
          artwork: song.image_url,
          duration: song.duration,
          views: song.views,
          genreName: song.genre_name,
        }));

        const botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: response.data.reason,
          genres: response.data.suggestedGenres,
          songs: songs,
          totalSongs: response.data.totalSongs,
        };

        setMessages(prev => [...prev, botMessage]);
        setCurrentRecommendedSongs(songs);
      } else {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại!',
          songs: [],
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: 'Đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra kết nối mạng và thử lại.',
        songs: [],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaySong = async (song, songs) => {
    try {
      const queue = songs.map(s => ({
        id: s.id,
        url: s.url,
        title: s.title,
        artist: s.artist,
        artistId: s.artistId,
        artwork: s.artwork,
      }));

      const songIndex = songs.findIndex(s => s.id === song.id);
      await playFromQueue(queue, songIndex !== -1 ? songIndex : 0);
      navigation.navigate('Player');
    } catch (error) {
      console.error('Error playing song:', error);
      Alert.alert('Lỗi', 'Không thể phát bài hát');
    }
  };

  const handleOpenOptions = song => {
    setSelectedSong(song);
    setOptionsModalVisible(true);
  };

  const handleLikeSong = () => {
    if (!selectedSong || !token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài hát');
      setOptionsModalVisible(false);
      return;
    }

    const isLiked = likedSongs?.some(
      s => s.song_id?.toString() === selectedSong.id?.toString(),
    );

    dispatch(
      toggleLikeSong({
        token,
        songId: selectedSong.id,
        isLiked,
      }),
    );

    Alert.alert(
      'Thành công',
      isLiked ? 'Đã bỏ yêu thích bài hát' : 'Đã thêm vào yêu thích',
    );
    setOptionsModalVisible(false);
  };

  const handleAddToPlaylist = () => {
    setOptionsModalVisible(false);
    setPlaylistSelectVisible(true);
  };

  const handleSelectPlaylist = async playlistId => {
    if (!selectedSong || !token) return;

    try {
      await dispatch(
        addSongToPlaylistThunk({
          token,
          playlistId,
          songId: selectedSong.id,
        }),
      ).unwrap();

      Alert.alert('Thành công', 'Đã thêm bài hát vào playlist');
      setPlaylistSelectVisible(false);
      setSelectedSong(null);
    } catch (error) {
      Alert.alert('Lỗi', error || 'Không thể thêm bài hát vào playlist');
    }
  };

  const handleViewArtist = () => {
    if (!selectedSong) return;
    setOptionsModalVisible(false);
    // Tìm ảnh nghệ sĩ đúng từ danh sách artists
    const artistData = artists.find(
      a => a.id?.toString() === selectedSong.artistId?.toString(),
    );
    navigation.navigate('ArtistDetail', {
      artist: {
        id: selectedSong.artistId,
        name: selectedSong.artist,
        image: artistData?.image || selectedSong.artwork,
      },
    });
  };

  const handleCreatePlaylistFromRecommend = songs => {
    setCurrentRecommendedSongs(songs);
    setRecommendPlaylistName('');
    setCreateFromRecommendVisible(true);
  };

  const submitCreatePlaylistFromRecommend = async () => {
    if (!recommendPlaylistName.trim() || !token) return;

    setIsCreatingPlaylist(true);

    try {
      const songIds = currentRecommendedSongs.map(s => parseInt(s.id));
      const response = await createPlaylistWithSongs(
        token,
        recommendPlaylistName.trim(),
        songIds,
      );

      if (response.success) {
        Alert.alert(
          'Thành công',
          `Đã tạo playlist "${recommendPlaylistName}" với ${songIds.length} bài hát`,
        );
        dispatch(fetchUserPlaylists(token));
        setCreateFromRecommendVisible(false);
        setRecommendPlaylistName('');
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tạo playlist');
      }
    } catch (error) {
      console.error('Create playlist error:', error);
      Alert.alert('Lỗi', 'Không thể tạo playlist');
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const renderMessage = ({item}) => {
    const isUser = item.type === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}>
        {!isUser && (
          <View
            style={[styles.botAvatar, {backgroundColor: colors.primaryLight}]}>
            <Icon name="robot" size={20} color={colors.primary} />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userBubble, {backgroundColor: colors.primary}]
              : [styles.botBubble, {backgroundColor: colors.card}],
          ]}>
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : {color: colors.text},
            ]}>
            {item.text}
          </Text>

          {/* Genres pills */}
          {item.genres && item.genres.length > 0 && (
            <View style={styles.genresContainer}>
              {item.genres.map((genre, index) => (
                <View
                  key={index}
                  style={[
                    styles.genrePill,
                    {backgroundColor: colors.primaryLight},
                  ]}>
                  <Text style={[styles.genreText, {color: colors.primary}]}>
                    {genre}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Songs list */}
          {item.songs && item.songs.length > 0 && (
            <View
              style={[
                styles.songsContainer,
                {
                  borderTopColor: colors.border,
                  backgroundColor: colors.surfaceVariant,
                },
              ]}>
              <View style={styles.songsHeader}>
                <Text style={[styles.songsTitle, {color: colors.text}]}>
                  🎵 {item.totalSongs} bài hát gợi ý
                </Text>
                <TouchableOpacity
                  style={[
                    styles.createPlaylistBtn,
                    {backgroundColor: colors.primaryLight},
                  ]}
                  onPress={() => handleCreatePlaylistFromRecommend(item.songs)}>
                  <Icon name="playlist-plus" size={18} color={colors.primary} />
                  <Text
                    style={[
                      styles.createPlaylistText,
                      {color: colors.primary},
                    ]}>
                    Tạo playlist
                  </Text>
                </TouchableOpacity>
              </View>
              {item.songs.slice(0, 5).map((song, index) => (
                <SongItem
                  key={song.id}
                  song={{
                    ...song,
                    artwork: song.artwork,
                  }}
                  onPress={() => handlePlaySong(song, item.songs)}
                  onOptionsPress={() => handleOpenOptions(song)}
                  style={[styles.songItem, {backgroundColor: colors.card}]}
                />
              ))}
              {item.songs.length > 5 && (
                <TouchableOpacity
                  style={styles.viewMoreBtn}
                  onPress={() =>
                    navigation.navigate('RecommendedSongs', {
                      songs: item.songs,
                      genres: item.genres,
                    })
                  }>
                  <Text style={[styles.viewMoreText, {color: colors.primary}]}>
                    Xem tất cả {item.songs.length} bài hát
                  </Text>
                  <Icon name="chevron-right" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark || colors.primary]}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.aiIconContainer}>
            <Icon name="robot-happy" size={28} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Music Assistant</Text>
            <Text style={styles.headerSubtitle}>Gợi ý nhạc theo tâm trạng</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Chat messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({animated: true})
        }
        onLayout={() => flatListRef.current?.scrollToEnd({animated: true})}
      />

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <View
            style={[styles.botAvatar, {backgroundColor: colors.primaryLight}]}>
            <Icon name="robot" size={20} color={colors.primary} />
          </View>
          <View
            style={[styles.typingIndicator, {backgroundColor: colors.card}]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.typingText, {color: colors.textSecondary}]}>
              AI đang suy nghĩ...
            </Text>
          </View>
        </View>
      )}

      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View
          style={[
            styles.inputContainer,
            {backgroundColor: colors.card, borderTopColor: colors.border},
          ]}>
          <TextInput
            style={[
              styles.input,
              {backgroundColor: colors.inputBackground, color: colors.text},
            ]}
            placeholder="Nhập tâm trạng hoặc yêu cầu của bạn..."
            placeholderTextColor={colors.placeholder}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {backgroundColor: colors.primary},
              (!inputText.trim() || isLoading) && styles.sendBtnDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}>
            <Icon
              name="send"
              size={22}
              color={
                inputText.trim() && !isLoading ? '#fff' : colors.textTertiary
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Song Options Modal */}
      <SongOptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        song={selectedSong}
        isLiked={likedSongs?.some(
          s => s.song_id?.toString() === selectedSong?.id?.toString(),
        )}
        onLike={handleLikeSong}
        onAddToPlaylist={handleAddToPlaylist}
        onViewArtist={handleViewArtist}
      />

      {/* Playlist Select Modal */}
      <PlaylistSelectModal
        visible={playlistSelectVisible}
        onClose={() => setPlaylistSelectVisible(false)}
        playlists={userPlaylists}
        onSelect={handleSelectPlaylist}
      />

      {/* Create Playlist from Recommended Songs */}
      <CreatePlaylistModal
        visible={createFromRecommendVisible}
        onClose={() => setCreateFromRecommendVisible(false)}
        onSubmit={submitCreatePlaylistFromRecommend}
        value={recommendPlaylistName}
        onChangeText={setRecommendPlaylistName}
        title="Tạo playlist từ gợi ý"
        subtitle={`Tạo playlist mới với ${currentRecommendedSongs.length} bài hát được AI gợi ý`}
        isLoading={isCreatingPlaylist}
        buttonText="Tạo playlist"
        iconName="playlist-star"
      />

      <MiniPlayer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  aiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  chatContainer: {
    padding: 15,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  messageBubble: {
    maxWidth: width * 0.78,
    borderRadius: 18,
    padding: 14,
  },
  userBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  userMessageText: {
    color: '#fff',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  genrePill: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  genreText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '600',
  },
  songsContainer: {
    marginTop: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  songsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  songsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  createPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  createPlaylistText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
    marginLeft: 4,
  },
  songItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 3,
    borderBottomWidth: 0,
  },
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 5,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 70,
  },
  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    marginRight: 10,
  },
  sendBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#e0e0e0',
  },
});

export default AIChatScreen;
