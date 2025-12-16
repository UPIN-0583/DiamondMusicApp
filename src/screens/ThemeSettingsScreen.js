import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../themes/ThemeContext';

const ThemeSettingsScreen = () => {
  const navigation = useNavigation();
  const {theme, setTheme, colors} = useTheme();

  const ThemeOption = ({value, icon, title, subtitle}) => {
    const isSelected = theme === value;

    return (
      <TouchableOpacity
        style={[
          styles.optionCard,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => setTheme(value)}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isSelected
                ? colors.primaryLight
                : colors.surfaceVariant,
            },
          ]}>
          <Icon
            name={icon}
            size={28}
            color={isSelected ? colors.primary : colors.textSecondary}
          />
        </View>
        <View style={styles.optionText}>
          <Text style={[styles.optionTitle, {color: colors.text}]}>
            {title}
          </Text>
          <Text style={[styles.optionSubtitle, {color: colors.textSecondary}]}>
            {subtitle}
          </Text>
        </View>
        {isSelected && (
          <Icon name="check-circle" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      {/* Header */}
      <View style={[styles.header, {borderBottomColor: colors.border}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>
          Giao diện
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Theme Options */}
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>
          Chọn giao diện
        </Text>

        <ThemeOption
          value="light"
          icon="white-balance-sunny"
          title="Sáng"
          subtitle="Giao diện sáng mặc định"
        />

        <ThemeOption
          value="dark"
          icon="moon-waning-crescent"
          title="Tối"
          subtitle="Giao diện tối, dễ nhìn ban đêm"
        />

        <ThemeOption
          value="system"
          icon="cellphone"
          title="Theo hệ thống"
          subtitle="Tự động theo cài đặt điện thoại"
        />
      </View>

      {/* Info */}
      <View style={[styles.infoCard, {backgroundColor: colors.surfaceVariant}]}>
        <Icon
          name="information-outline"
          size={20}
          color={colors.textSecondary}
        />
        <Text style={[styles.infoText, {color: colors.textSecondary}]}>
          Giao diện sẽ được áp dụng ngay lập tức và lưu lại cho lần sử dụng sau.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default ThemeSettingsScreen;
