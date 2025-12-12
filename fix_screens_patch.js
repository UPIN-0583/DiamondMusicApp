const fs = require('fs');
const pathToFix =
  'node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/safearea/SafeAreaView.kt';
const backupPath = 'temp_safe_area_view.kt';

console.log('=== React Native Screens SafeAreaView Fix ===');

try {
  // Create backup if it doesn't exist
  if (!fs.existsSync(backupPath)) {
    console.log('Creating backup...');
    fs.copyFileSync(pathToFix, backupPath);
  } else {
    console.log('Restoring from backup...');
    fs.copyFileSync(backupPath, pathToFix);
  }

  // Read the file
  let content = fs.readFileSync(pathToFix, 'utf8');
  const lines = content.split('\n');

  console.log('\nBefore fix:');
  console.log('Line 109:', lines[108]);

  // Fix line 109: The issue is comparing Insets with EdgeInsets
  // We need to convert newSystemInsets to EdgeInsets before comparison
  // Change: if (newSystemInsets != currentSystemInsets) {
  // To: if (EdgeInsets.fromInsets(newSystemInsets) != currentSystemInsets) {

  if (lines[108].includes('if (newSystemInsets != currentSystemInsets)')) {
    lines[108] = lines[108].replace(
      'if (newSystemInsets != currentSystemInsets)',
      'if (EdgeInsets.fromInsets(newSystemInsets) != currentSystemInsets)',
    );
  }

  console.log('\nAfter fix:');
  console.log('Line 109:', lines[108]);

  // Write back
  fs.writeFileSync(pathToFix, lines.join('\n'));
  console.log('\n✅ Successfully patched SafeAreaView.kt');
  console.log('The fix converts Insets to EdgeInsets before comparison.');
} catch (e) {
  console.error('❌ Failed to patch:', e.message);
  process.exit(1);
}
