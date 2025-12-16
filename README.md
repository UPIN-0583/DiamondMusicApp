# DiamondMusic App

Ứng dụng nghe nhạc React Native.

## ⚡Quick Start

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy patches (BẮT BUỘC sau mỗi npm install)
node fix_build_patch.js
node fix_screens_patch.js

# 3. Chạy app
npm start          # Terminal 1: Metro
npm run android    # Terminal 2: Android
```

## 🔧 Xử lý lỗi

| Lỗi                 | Giải pháp                   |
| ------------------- | --------------------------- |
| TurboModule error   | `node fix_build_patch.js`   |
| Kotlin Insets error | `node fix_screens_patch.js` |
| Build failed        | Chạy lại cả 2 patch scripts |

## � Lưu ý

- **Backend**: Phải chạy backend tại `http://localhost:5000` trước
- **Patches**: Chạy lại sau mỗi lần `npm install`
