import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * Create Playlist Center Modal
 */
const CreatePlaylistModal = ({
  visible,
  onClose,
  onSubmit,
  value,
  onChangeText,
  title = 'Playlist mới',
  subtitle = 'Tạo playlist để lưu bài hát yêu thích',
  isLoading = false,
  buttonText = 'Tạo',
  iconName = 'playlist-plus',
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Icon name={iconName} size={32} color="#2196F3" />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên playlist"
            placeholderTextColor="#aaa"
            value={value}
            onChangeText={onChangeText}
            autoFocus
          />
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={onClose}
              disabled={isLoading}>
              <Text style={styles.btnOutlineText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, isLoading && {opacity: 0.7}]}
              onPress={onSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnPrimaryText}>{buttonText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 8},
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#333',
    marginBottom: 25,
    backgroundColor: '#fafafa',
  },
  buttons: {flexDirection: 'row', gap: 12, width: '100%'},
  btnOutline: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  btnOutlineText: {color: '#666', fontWeight: '600', fontSize: 16},
  btnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {color: '#fff', fontWeight: '600', fontSize: 16},
});

export default CreatePlaylistModal;
