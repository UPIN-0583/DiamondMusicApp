import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../themes/ThemeContext';

const {height} = Dimensions.get('window');

/**
 * Song Options Bottom Sheet Modal
 */
const SongOptionsModal = ({
  visible,
  onClose,
  song,
  isLiked = false,
  onLike,
  onAddToPlaylist,
  onViewArtist,
  showRemoveFromPlaylist = false,
  onRemoveFromPlaylist,
  onShare,
}) => {
  const {colors} = useTheme();
  if (!song) return null;

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

          {/* Song Info Header */}
          <View style={styles.songInfoHeader}>
            <Image
              source={{uri: song.artwork || 'https://picsum.photos/100/100'}}
              style={styles.songImage}
            />
            <View style={{flex: 1}}>
              <Text
                style={[styles.songTitle, {color: colors.text}]}
                numberOfLines={1}>
                {song.title}
              </Text>
              <Text
                style={[styles.songArtist, {color: colors.textSecondary}]}
                numberOfLines={1}>
                {song.artist}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, {backgroundColor: colors.border}]} />

          {/* Like Song */}
          {onLike && (
            <TouchableOpacity style={styles.option} onPress={onLike}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isLiked
                      ? colors.error + '20'
                      : colors.error + '15',
                  },
                ]}>
                <Icon
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={colors.error}
                />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, {color: colors.text}]}>
                  {isLiked ? 'Bỏ thích' : 'Yêu thích'}
                </Text>
                <Text style={[styles.optionSub, {color: colors.textSecondary}]}>
                  {isLiked
                    ? 'Xóa khỏi danh sách yêu thích'
                    : 'Thêm vào yêu thích'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Remove from Playlist */}
          {showRemoveFromPlaylist && onRemoveFromPlaylist && (
            <TouchableOpacity
              style={styles.option}
              onPress={onRemoveFromPlaylist}>
              <View
                style={[
                  styles.iconCircle,
                  {backgroundColor: colors.accent + '20'},
                ]}>
                <Icon name="playlist-minus" size={22} color={colors.accent} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, {color: colors.text}]}>
                  Xóa khỏi playlist
                </Text>
                <Text style={[styles.optionSub, {color: colors.textSecondary}]}>
                  Xóa bài hát này
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Add to Playlist */}
          {onAddToPlaylist && (
            <TouchableOpacity style={styles.option} onPress={onAddToPlaylist}>
              <View
                style={[
                  styles.iconCircle,
                  {backgroundColor: colors.success + '20'},
                ]}>
                <Icon name="playlist-plus" size={22} color={colors.success} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, {color: colors.text}]}>
                  Thêm vào playlist
                </Text>
                <Text style={[styles.optionSub, {color: colors.textSecondary}]}>
                  Lưu vào playlist của bạn
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* View Artist */}
          {onViewArtist && (
            <TouchableOpacity style={styles.option} onPress={onViewArtist}>
              <View
                style={[
                  styles.iconCircle,
                  {backgroundColor: colors.primary + '20'},
                ]}>
                <Icon name="account-music" size={22} color={colors.primary} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, {color: colors.text}]}>
                  Xem nghệ sĩ
                </Text>
                <Text style={[styles.optionSub, {color: colors.textSecondary}]}>
                  Đến trang nghệ sĩ
                </Text>
              </View>
            </TouchableOpacity>
          )}
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
  songInfoHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 5},
  songImage: {width: 55, height: 55, borderRadius: 10, marginRight: 15},
  songTitle: {fontSize: 17, fontWeight: 'bold', color: '#222', marginBottom: 3},
  songArtist: {fontSize: 14, color: '#888'},
  divider: {height: 1, backgroundColor: '#f0f0f0', marginVertical: 15},
  option: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14},
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: {flex: 1},
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 3,
  },
  optionSub: {fontSize: 13, color: '#888'},
});

export default SongOptionsModal;
