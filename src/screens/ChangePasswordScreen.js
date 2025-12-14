import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {changePassword} from '../services/api';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const {token} = useSelector(state => state.auth);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs to prevent re-rendering issues
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
    }
    if (newPassword.length < 8) {
      return Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 8 ký tự');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
    }

    setIsLoading(true);
    try {
      const response = await changePassword(token, oldPassword, newPassword);
      if (response.success) {
        Alert.alert('Thành công', 'Đổi mật khẩu thành công', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        Alert.alert('Lỗi', response.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}>
            <Icon name="chevron-left" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
          <View style={{width: 40}} />
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Icon name="information-outline" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Mật khẩu mới phải có ít nhất 8 ký tự
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Old Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor="#aaa"
                secureTextEntry={!showOld}
                returnKeyType="next"
                onSubmitEditing={() => newPasswordRef.current?.focus()}
              />
              <TouchableOpacity
                onPress={() => setShowOld(!showOld)}
                style={styles.eyeBtn}>
                <Icon
                  name={showOld ? 'eye-off' : 'eye'}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                ref={newPasswordRef}
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor="#aaa"
                secureTextEntry={!showNew}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
              <TouchableOpacity
                onPress={() => setShowNew(!showNew)}
                style={styles.eyeBtn}>
                <Icon
                  name={showNew ? 'eye-off' : 'eye'}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                ref={confirmPasswordRef}
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#aaa"
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={handleChangePassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                style={styles.eyeBtn}>
                <Icon
                  name={showConfirm ? 'eye-off' : 'eye'}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isLoading && {opacity: 0.7}]}
          onPress={handleChangePassword}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Đổi mật khẩu</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {fontSize: 18, fontWeight: 'bold', color: '#222'},

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
  },
  infoText: {fontSize: 13, color: '#2196F3', marginLeft: 10, flex: 1},

  form: {paddingHorizontal: 25, marginTop: 20},
  inputGroup: {marginBottom: 20},
  label: {fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8},
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
  },
  passwordInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  eyeBtn: {paddingHorizontal: 15},

  submitBtn: {
    marginHorizontal: 25,
    marginTop: 30,
    marginBottom: 30,
    height: 52,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {fontSize: 16, fontWeight: '600', color: '#fff'},
});

export default ChangePasswordScreen;
