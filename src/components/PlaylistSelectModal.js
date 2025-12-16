import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../themes/ThemeContext';

const {height} = Dimensions.get('window');

/**
 * Playlist Selection Bottom Sheet Modal
 * @param {Boolean} visible - Modal visibility
 * @param {Function} onClose - Close callback
 * @param {Array} playlists - Array of user playlists
 * @param {Function} onSelect - Playlist selected callback (playlistId)
 * @param {String} title - Modal title (default "Add to Playlist")
 */
const PlaylistSelectModal = ({
  visible,
  onClose,
  playlists = [],
  onSelect,
  title = 'Thêm vào Playlist',
}) => {
  const {colors} = useTheme();

  const renderPlaylistItem = ({item}) => (
    <TouchableOpacity
      style={[styles.playlistItem, {borderBottomColor: colors.border}]}
      onPress={() => onSelect(item.playlist_id)}>
      <View
        style={[
          styles.playlistItemIcon,
          {backgroundColor: colors.primaryLight},
        ]}>
        <Icon name="playlist-music" size={24} color={colors.primary} />
      </View>
      <View style={{flex: 1}}>
        <Text style={[styles.playlistName, {color: colors.text}]}>
          {item.name}
        </Text>
        <Text style={[styles.playlistCount, {color: colors.textSecondary}]}>
          {item.songs?.length || 0} bài hát
        </Text>
      </View>
      <Icon name="chevron-right" size={22} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={[styles.sheet, {backgroundColor: colors.card}]}>
          <View style={[styles.dragHandle, {backgroundColor: colors.border}]} />
          <Text style={[styles.title, {color: colors.text}]}>{title}</Text>

          <FlatList
            data={playlists}
            keyExtractor={item => item.playlist_id.toString()}
            renderItem={renderPlaylistItem}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon
                  name="playlist-plus"
                  size={50}
                  color={colors.textTertiary}
                />
                <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                  Chưa có playlist
                </Text>
                <Text
                  style={[styles.emptySubtext, {color: colors.textTertiary}]}>
                  Hãy tạo playlist trước!
                </Text>
              </View>
            }
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: height * 0.6,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
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
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 3,
  },
  playlistCount: {
    fontSize: 13,
    color: '#888',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
  },
});

export default PlaylistSelectModal;
