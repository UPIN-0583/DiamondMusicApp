const fs = require('fs');
const pathToFix =
  'node_modules/react-native-track-player/android/src/main/java/com/doublesymmetry/trackplayer/module/MusicModule.kt';
const backupPath = 'temp_music_module.kt';

console.log('=== React Native Track Player Bundle Fix ===');

try {
  // Restore from backup first
  if (fs.existsSync(backupPath)) {
    console.log('Restoring from backup...');
    fs.copyFileSync(backupPath, pathToFix);
  } else {
    console.error('Backup file not found! Creating one now...');
    fs.copyFileSync(pathToFix, backupPath);
  }

  // Read the file
  let content = fs.readFileSync(pathToFix, 'utf8');
  const lines = content.split('\n');

  console.log('\nBefore fix:');
  console.log('Line 548:', lines[547]);
  console.log('Line 588:', lines[587]);

  // Fix line 548: callback.resolve(Arguments.fromBundle(musicService.tracks[index].originalItem))
  // The issue is that originalItem is Bundle?, but Arguments.fromBundle expects Bundle
  lines[547] = lines[547].replace(
    'Arguments.fromBundle(musicService.tracks[index].originalItem)',
    'Arguments.fromBundle(musicService.tracks[index].originalItem ?: Bundle())',
  );

  // Fix line 588: Arguments.fromBundle(
  //                 musicService.tracks[musicService.getCurrentTrackIndex()].originalItem
  //             )
  // This is a multi-line call, we need to fix just the .originalItem part
  lines[587] = lines[587].replace(
    'musicService.tracks[musicService.getCurrentTrackIndex()].originalItem',
    'musicService.tracks[musicService.getCurrentTrackIndex()].originalItem ?: Bundle()',
  );

  console.log('\nAfter fix:');
  console.log('Line 548:', lines[547]);
  console.log('Line 588:', lines[587]);

  // Write back
  fs.writeFileSync(pathToFix, lines.join('\n'));
  console.log('\n✅ Successfully patched MusicModule.kt');
  console.log('The fix adds "?: Bundle()" to handle nullable Bundle types.');
} catch (e) {
  console.error('❌ Failed to patch:', e.message);
  process.exit(1);
}
