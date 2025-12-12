# Music App - React Native

Ứng dụng nghe nhạc được xây dựng bằng React Native với tính năng phát nhạc nền sử dụng `react-native-track-player`.

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 18
- **React Native**: 0.76.6
- **Java Development Kit (JDK)**: 17 hoặc cao hơn
- **Android Studio**: Phiên bản mới nhất với Android SDK
- **Gradle**: 8.10.2 (tự động cài đặt)

### Cho Windows:

- Android SDK Platform 34
- Android Build Tools
- Android Emulator hoặc thiết bị Android thật

## 🚀 Cài đặt

### 1. Clone repository (nếu cần)

```bash
git clone <repository-url>
cd DiamondMusicApp
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. **QUAN TRỌNG**: Chạy patch scripts

Sau khi cài đặt dependencies, bạn **BẮT BUỘC** phải chạy các script patch để sửa lỗi tương thích:

```bash
node fix_build_patch.js
node fix_screens_patch.js
```

> **Lưu ý**: Các script này sửa lỗi trong `react-native-track-player` và `react-native-screens` để tương thích với React Native 0.76.6.

### 4. Cài đặt iOS dependencies (chỉ cho macOS)

```bash
cd ios
pod install
cd ..
```

## 🏃 Chạy ứng dụng

### Android

#### Bước 1: Khởi động Metro Bundler

Mở terminal đầu tiên và chạy:

```bash
npm start
```

#### Bước 2: Chạy app trên Android

Mở terminal thứ hai và chạy:

```bash
npm run android
```

Hoặc nếu muốn chạy trên thiết bị cụ thể:

```bash
npx react-native run-android --deviceId=<device-id>
```

### iOS (chỉ cho macOS)

```bash
npm run ios
```

## 🛠️ Các lệnh hữu ích

### Làm sạch build cache

Nếu gặp lỗi build, hãy thử làm sạch cache:

```bash
# Làm sạch Metro bundler cache
npm start -- --reset-cache

# Làm sạch Android build
cd android
gradlew clean
cd ..

# Làm sạch iOS build (macOS only)
cd ios
pod deintegrate
pod install
cd ..
```

### Kiểm tra thiết bị đã kết nối

```bash
# Android
adb devices

# iOS (macOS only)
xcrun simctl list devices
```

### Chạy lại patch sau khi npm install

Mỗi khi chạy `npm install`, bạn cần chạy lại các patch:

```bash
node fix_build_patch.js
node fix_screens_patch.js
```

## 📱 Tính năng

- ✅ Phát nhạc với điều khiển phát/tạm dừng
- ✅ Chuyển bài tiếp theo/trước đó
- ✅ Hiển thị danh sách bài hát
- ✅ Mini player trên màn hình chính
- ✅ Màn hình player đầy đủ
- ✅ Phát nhạc nền (background playback)
- ✅ Navigation giữa các màn hình

## 🏗️ Cấu trúc thư mục

```
MusicAppNew/
├── src/
│   ├── components/
│   │   └── MiniPlayer.js          # Component mini player
│   ├── screens/
│   │   ├── HomeScreen.js          # Màn hình chính
│   │   └── PlayerScreen.js        # Màn hình player
│   ├── services/
│   │   ├── SetupService.js        # Cấu hình TrackPlayer
│   │   └── PlaybackService.js     # Service phát nhạc nền
│   └── store/
│       └── usePlayerStore.js      # Zustand store quản lý state
├── android/                        # Code Android native
├── ios/                           # Code iOS native
├── fix_build_patch.js             # Patch cho react-native-track-player
├── fix_screens_patch.js           # Patch cho react-native-screens
├── App.tsx                        # Component gốc
└── package.json
```

## 🐛 Xử lý lỗi thường gặp

### Lỗi 1: TurboModule parsing error

```
Exception in HostObject :: get for prop 'TrackPlayerModule'
```

**Giải pháp**: Đã được fix bằng cách tắt New Architecture trong `android/gradle.properties`:

```properties
newArchEnabled=false
```

### Lỗi 2: Kotlin compilation error trong react-native-screens

```
Operator '!=' cannot be applied to 'Insets' and 'EdgeInsets'
```

**Giải pháp**: Chạy `node fix_screens_patch.js`

### Lỗi 3: Bundle type mismatch trong react-native-track-player

```
Type mismatch: inferred type is Bundle? but Bundle was expected
```

**Giải pháp**: Chạy `node fix_build_patch.js`

### Lỗi 4: Metro bundler không kết nối

```bash
# Dừng tất cả Metro processes
npx react-native start --reset-cache

# Hoặc trên Windows
taskkill /F /IM node.exe
npm start
```

### Lỗi 5: Build failed sau khi npm install

```bash
# Chạy lại các patch scripts
node fix_build_patch.js
node fix_screens_patch.js

# Làm sạch và rebuild
cd android
gradlew clean
cd ..
npm run android
```

## 📦 Dependencies chính

- **react-native**: 0.76.6
- **react-navigation**: Navigation giữa các màn hình
- **react-native-track-player**: Phát nhạc với hỗ trợ background
- **zustand**: State management
- **react-native-linear-gradient**: Gradient backgrounds
- **react-native-vector-icons**: Icons
- **@miblanchard/react-native-slider**: Slider component

## ⚙️ Cấu hình

### Android

- **minSdkVersion**: 23
- **targetSdkVersion**: 34
- **compileSdkVersion**: 34
- **New Architecture**: Disabled (để tương thích với react-native-track-player)
- **Hermes Engine**: Enabled

### Gradle

- **Gradle Version**: 8.10.2
- **Android Gradle Plugin**: 8.10.2
- **Kotlin Version**: 1.9.22

## 🔧 Development

### Chạy tests

```bash
npm test
```

### Lint code

```bash
npm run lint
```

### Format code

```bash
npx prettier --write .
```

## 📝 Ghi chú

1. **Patch Scripts**: Các file `fix_build_patch.js` và `fix_screens_patch.js` tự động tạo backup trước khi patch. Backup được lưu tại:

   - `temp_music_module.kt`
   - `temp_safe_area_view.kt`

2. **New Architecture**: Hiện tại app đang tắt New Architecture do vấn đề tương thích với `react-native-track-player` v4.1.2. Có thể bật lại khi library được cập nhật.

3. **Hot Reload**: Hỗ trợ Fast Refresh để phát triển nhanh hơn.

## 🆘 Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra lại các bước cài đặt
2. Chạy lại patch scripts
3. Làm sạch build cache
4. Kiểm tra log chi tiết với: `npm run android -- --verbose`
