# 💎 DiamondMusic App

Ứng dụng nghe nhạc React Native với nhiều tính năng hiện đại.

## ✨ Tính năng chính

| Tính năng                 | Mô tả                                                |
| ------------------------- | ---------------------------------------------------- |
| 🎵 **Music Player**       | Phát nhạc với điều khiển đầy đủ, background playback |
| 🎤 **Voice Search**       | Tìm kiếm bằng giọng nói                              |
| 🤖 **AI Recommendations** | Gợi ý nhạc theo tâm trạng với Gemini AI              |
| 🔍 **Lyrics Search**      | Tìm bài hát theo lời bài hát                         |
| 📋 **Playlists**          | Tạo, quản lý playlist cá nhân                        |
| ❤️ **Favorites**          | Lưu bài hát và nghệ sĩ yêu thích                     |
| 🌙 **Theme Toggle**       | Chế độ Sáng/Tối/Theo hệ thống                        |
| 🎨 **MiniPlayer**         | Mini player hiển thị trên mọi màn hình               |

## 🚀 Tech Stack

| Công nghệ                 | Phiên bản |
| ------------------------- | --------- |
| React Native              | 0.76.6    |
| React Navigation          | 7.x       |
| Redux Toolkit             | 2.x       |
| Zustand                   | 5.x       |
| react-native-track-player | 4.1.2     |
| react-native-voice        | 3.x       |

## 📁 Cấu trúc Project

```
DiamondMusicApp/
├── src/
│   ├── components/           # Reusable components
│   │   ├── MiniPlayer.js
│   │   ├── SongItem.js
│   │   ├── SongOptionsModal.js
│   │   └── ...
│   ├── screens/              # App screens
│   │   ├── HomeScreen.js
│   │   ├── PlayerScreen.js
│   │   ├── SearchScreen.js
│   │   └── ...
│   ├── navigation/           # React Navigation
│   ├── redux/                # Redux store & slices
│   ├── store/                # Zustand stores
│   ├── services/             # API & TrackPlayer services
│   └── themes/               # Theme colors & context
├── android/                  # Android native code
├── ios/                      # iOS native code
├── App.tsx                   # Root component
└── package.json
```

## ⚡ Quick Start

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Chạy patch scripts (BẮT BUỘC)

```bash
node fix_build_patch.js
node fix_screens_patch.js
```

### 3. Chạy ứng dụng

```bash
# Terminal 1: Metro bundler
npm start

# Terminal 2: Android
npm run android
```

## 📱 Cấu hình Android

| Config            | Giá trị  |
| ----------------- | -------- |
| minSdkVersion     | 23       |
| targetSdkVersion  | 34       |
| compileSdkVersion | 34       |
| Kotlin            | 1.9.22   |
| Gradle            | 8.10.2   |
| New Architecture  | Disabled |

## 🛠️ Các lệnh hữu ích

```bash
# Clean build
cd android && gradlew clean && cd ..

# Reset Metro cache
npm start -- --reset-cache

# Chạy lại patches sau npm install
node fix_build_patch.js && node fix_screens_patch.js
```

## 🐛 Xử lý lỗi thường gặp

| Lỗi                          | Giải pháp                        |
| ---------------------------- | -------------------------------- |
| TurboModule parsing error    | Chạy `node fix_build_patch.js`   |
| Kotlin Insets error          | Chạy `node fix_screens_patch.js` |
| Metro không kết nối          | `npm start -- --reset-cache`     |
| Build failed sau npm install | Chạy lại cả 2 patch scripts      |

## 📋 Dependencies chính

```json
{
  "react-native": "0.76.6",
  "react-native-track-player": "4.1.2",
  "@react-navigation/native": "7.x",
  "@reduxjs/toolkit": "2.x",
  "zustand": "5.x",
  "@react-native-voice/voice": "3.x",
  "react-native-linear-gradient": "2.x",
  "react-native-vector-icons": "10.x"
}
```

## 📝 Lưu ý

1. **Patch Scripts**: Phải chạy sau mỗi lần `npm install`
2. **New Architecture**: Đang tắt để tương thích với track-player
3. **Backend**: Đảm bảo Backend đang chạy tại `http://localhost:5000`

## 🔗 Liên kết

- [Backend README](../DiamondMusic_BE/README.md)
- [React Native Docs](https://reactnative.dev/)
- [react-native-track-player](https://react-native-track-player.js.org/)

---

**Developed with ❤️ using React Native**
