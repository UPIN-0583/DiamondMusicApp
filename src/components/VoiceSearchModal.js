import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Voice from '@react-native-voice/voice';
import {useTheme} from '../themes/ThemeContext';

const VoiceSearchModal = ({visible, onClose, onResult}) => {
  const {colors} = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [partialText, setPartialText] = useState('');
  const [error, setError] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Check if Voice is available
  useEffect(() => {
    const checkVoice = async () => {
      try {
        const available = await Voice.isAvailable();
        console.log('Voice available:', available);
        setIsAvailable(available);
        if (!available) {
          setError('Nhận dạng giọng nói không khả dụng trên thiết bị này.');
        }
      } catch (e) {
        console.error('Check voice error:', e);
        setIsAvailable(false);
        setError('Không thể kiểm tra dịch vụ giọng nói.');
      }
    };
    checkVoice();
  }, []);

  // Setup Voice handlers
  useEffect(() => {
    const onSpeechStart = e => {
      console.log('onSpeechStart:', e);
      setIsListening(true);
      setError('');
    };

    const onSpeechEnd = e => {
      console.log('onSpeechEnd:', e);
      setIsListening(false);
    };

    const onSpeechResults = e => {
      console.log('onSpeechResults:', e);
      if (e.value && e.value.length > 0) {
        const text = e.value[0];
        setRecognizedText(text);
        setPartialText('');
      }
    };

    const onSpeechPartialResults = e => {
      console.log('onSpeechPartialResults:', e);
      if (e.value && e.value.length > 0) {
        setPartialText(e.value[0]);
      }
    };

    const onSpeechError = e => {
      console.error('onSpeechError:', e);
      const errorCode = e.error?.code || e.error?.message || e.error;
      setError(getErrorMessage(errorCode));
      setIsListening(false);
    };

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    if (visible) {
      // Reset state when modal opens - do NOT auto start recording
      setRecognizedText('');
      setPartialText('');
      setError('');
      setIsListening(false);
    } else {
      stopListening();
    }
  }, [visible]);

  useEffect(() => {
    // Pulse animation when listening
    if (isListening) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  const getErrorMessage = code => {
    console.log('Error code:', code);
    switch (code) {
      case 'no-speech':
      case '7': // No speech input
        return 'Không nghe thấy giọng nói. Vui lòng thử lại.';
      case 'audio':
      case '3': // Audio recording error
        return 'Lỗi âm thanh. Vui lòng thử lại.';
      case 'network':
      case '2': // Network error
        return 'Lỗi mạng. Vui lòng kiểm tra kết nối.';
      case 'not-allowed':
      case 'permission':
      case '9': // Insufficient permissions
        return 'Chưa cấp quyền microphone.';
      case 'service-not-allowed':
      case '4': // Client side error
        return 'Dịch vụ nhận dạng giọng nói không khả dụng.';
      case '5': // Server error
        return 'Lỗi máy chủ. Vui lòng thử lại.';
      case '6': // Speech timeout
        return 'Hết thời gian. Vui lòng thử lại.';
      default:
        return `Đã xảy ra lỗi (${code}). Vui lòng thử lại.`;
    }
  };

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Quyền truy cập Microphone',
            message: 'Ứng dụng cần quyền microphone để tìm kiếm bằng giọng nói',
            buttonPositive: 'Đồng ý',
            buttonNegative: 'Từ chối',
          },
        );
        console.log('Permission result:', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const startListening = async () => {
    console.log('Starting voice recognition...');
    try {
      // Cancel any existing session
      try {
        await Voice.cancel();
        await Voice.destroy();
      } catch (e) {
        // Ignore errors from cancel/destroy
        console.log('Cancel/destroy (ignored):', e.message);
      }

      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setError('Vui lòng cấp quyền microphone để sử dụng tính năng này.');
        return;
      }

      // Check availability directly
      console.log('Checking Voice.isAvailable...');
      const available = await Voice.isAvailable();
      console.log('Voice.isAvailable result:', available);

      if (!available) {
        setError('Nhận dạng giọng nói không khả dụng trên thiết bị này.');
        return;
      }

      setError('');
      setRecognizedText('');
      setPartialText('');
      setIsListening(true); // Set listening state immediately

      console.log('Calling Voice.start with vi-VN...');
      await Voice.start('vi-VN'); // Vietnamese language
      console.log('Voice.start completed successfully');
    } catch (e) {
      console.error('Start listening error:', e);
      setError(`Không thể bắt đầu: ${e.message || e}`);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      await Voice.destroy();
    } catch (e) {
      console.error('Stop listening error:', e);
    }
    setIsListening(false);
  };

  const handleRetry = () => {
    startListening();
  };

  const handleCancel = () => {
    stopListening();
    onClose();
  };

  const handleSubmit = () => {
    const text = recognizedText || partialText;
    if (text.trim()) {
      onResult(text.trim());
      onClose();
    }
  };

  const displayText = recognizedText || partialText;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={[styles.content, {backgroundColor: colors.card}]}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={handleCancel}>
            <Icon name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={[styles.title, {color: colors.text}]}>
            Tìm kiếm bằng giọng nói
          </Text>
          <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
            {isListening
              ? 'Đang lắng nghe...'
              : error
              ? 'Có lỗi xảy ra'
              : displayText
              ? 'Đã nhận dạng'
              : 'Nhấn để bắt đầu'}
          </Text>

          {/* Microphone button with animation */}
          <TouchableOpacity
            style={styles.micContainer}
            onPress={isListening ? stopListening : startListening}
            activeOpacity={0.8}>
            <Animated.View
              style={[
                styles.micPulse,
                {
                  transform: [{scale: pulseAnim}],
                  opacity: isListening ? 0.3 : 0,
                },
              ]}
            />
            <View
              style={[
                styles.micButton,
                isListening && [
                  styles.micButtonActive,
                  {backgroundColor: colors.primary},
                ],
                error && styles.micButtonError,
                !isListening && !error && {backgroundColor: colors.primary},
              ]}>
              <Icon
                name={isListening ? 'microphone' : 'microphone-outline'}
                size={40}
                color="#fff"
              />
            </View>
          </TouchableOpacity>

          {/* Display recognized text */}
          {displayText ? (
            <View
              style={[
                styles.textContainer,
                {backgroundColor: colors.surfaceVariant},
              ]}>
              <Text style={[styles.recognizedText, {color: colors.text}]}>
                "{displayText}"
              </Text>
            </View>
          ) : null}

          {/* Error message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color="#f44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Help message when not available */}
          {error && error.includes('không khả dụng') ? (
            <View
              style={[
                styles.helpContainer,
                {backgroundColor: colors.surfaceVariant},
              ]}>
              <Text style={[styles.helpTitle, {color: colors.text}]}>
                Để sử dụng tính năng này:
              </Text>
              <Text style={[styles.helpText, {color: colors.textSecondary}]}>
                1. Cài đặt app "Google" từ Play Store
              </Text>
              <Text style={[styles.helpText, {color: colors.textSecondary}]}>
                2. Mở app Google và cấu hình giọng nói
              </Text>
              <Text style={[styles.helpText, {color: colors.textSecondary}]}>
                3. Khởi động lại ứng dụng
              </Text>
            </View>
          ) : null}

          {/* Hint */}
          {isListening && !displayText && (
            <Text style={[styles.hint, {color: colors.textSecondary}]}>
              Nói tên bài hát hoặc nghệ sĩ bạn muốn tìm...
            </Text>
          )}

          {/* Action buttons */}
          <View style={styles.actions}>
            {error ? (
              <TouchableOpacity
                style={[styles.retryBtn, {borderColor: colors.primary}]}
                onPress={handleRetry}>
                <Icon name="refresh" size={20} color={colors.primary} />
                <Text style={[styles.retryText, {color: colors.primary}]}>
                  Thử lại
                </Text>
              </TouchableOpacity>
            ) : displayText && !isListening ? (
              <TouchableOpacity
                style={[styles.searchBtn, {backgroundColor: colors.primary}]}
                onPress={handleSubmit}>
                <Icon name="magnify" size={20} color="#fff" />
                <Text style={styles.searchText}>Tìm kiếm</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  closeBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 30,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  micPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2196F3',
  },
  micButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  micButtonActive: {
    backgroundColor: '#1976D2',
  },
  micButtonError: {
    backgroundColor: '#f44336',
  },
  textContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
    maxWidth: '100%',
  },
  recognizedText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    marginLeft: 8,
    flex: 1,
  },
  helpContainer: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#f57c00',
    marginBottom: 4,
  },
  hint: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  retryText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  searchText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default VoiceSearchModal;
