import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../themes/ThemeContext';

/**
 * Reusable Song Item Component
 * @param {Object} song - Song object with title, artist, artwork
 * @param {Function} onPress - Callback when item is pressed (play song)
 * @param {Function} onOptionsPress - Callback when options button is pressed
 * @param {Boolean} showOptions - Show/hide options button (default: true)
 * @param {Object} style - Additional container styles
 */
const SongItem = ({
  song,
  onPress,
  onOptionsPress,
  showOptions = true,
  style,
}) => {
  const {colors} = useTheme();
  if (!song) return null;

  return (
    <TouchableOpacity
      style={[styles.container, {borderBottomColor: colors.border}, style]}
      onPress={onPress}>
      <Image
        source={{uri: song.artwork || 'https://picsum.photos/100/100'}}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={[styles.title, {color: colors.text}]} numberOfLines={1}>
          {song.title || 'Unknown Title'}
        </Text>
        <Text
          style={[styles.artist, {color: colors.textSecondary}]}
          numberOfLines={1}>
          {song.artist || 'Unknown Artist'}
        </Text>
      </View>
      {showOptions && onOptionsPress && (
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => onOptionsPress(song)}>
          <Icon name="dots-horizontal" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  image: {
    width: 55,
    height: 55,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#888',
  },
  optionsButton: {
    padding: 8,
  },
});

export default SongItem;
