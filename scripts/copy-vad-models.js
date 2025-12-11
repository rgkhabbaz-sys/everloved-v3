const fs = require('fs');
const path = require('path');

console.log('[VAD-SETUP] Starting VAD asset copy process...');

const publicVadPath = path.join(process.cwd(), 'public', 'vad');

// Ensure public/vad exists
if (!fs.existsSync(publicVadPath)) {
    console.log(`[VAD-SETUP] Creating directory: ${publicVadPath}`);
    fs.mkdirSync(publicVadPath, { recursive: true });
}

// Source paths
const vadPackagePath = path.join(process.cwd(), 'node_modules', '@ricky0123', 'vad-web', 'dist');
const onnxPackagePath = path.join(process.cwd(), 'node_modules', 'onnxruntime-web', 'dist');

const filesToCopy = [
    { srcDir: vadPackagePath, fileName: 'vad.worklet.bundle.min.js' },
    { srcDir: vadPackagePath, fileName: 'silero_vad_v5.onnx' },
    { srcDir: vadPackagePath, fileName: 'silero_vad_legacy.onnx' },
    { srcDir: onnxPackagePath, fileName: 'ort-wasm-simd-threaded.wasm' },
    { srcDir: onnxPackagePath, fileName: 'ort-wasm-simd.wasm' },
    { srcDir: onnxPackagePath, fileName: 'ort-wasm-threaded.wasm' },
    { srcDir: onnxPackagePath, fileName: 'ort-wasm.wasm' }
];

let successCount = 0;
let failCount = 0;

filesToCopy.forEach(({ srcDir, fileName }) => {
    const srcPath = path.join(srcDir, fileName);
    const destPath = path.join(publicVadPath, fileName);

    try {
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`[VAD-SETUP] SUCCESS: Copied ${fileName}`);
            successCount++;
        } else {
            console.error(`[VAD-SETUP] ERROR: Source file not found: ${srcPath}`);
            failCount++;
        }
    } catch (error) {
        console.error(`[VAD-SETUP] ERROR: Failed to copy ${fileName}:`, error);
        failCount++;
    }
});

console.log(`[VAD-SETUP] Completed. Success: ${successCount}, Failed: ${failCount}`);

if (failCount > 0) {
    console.warn('[VAD-SETUP] WARNING: Some assets failed to copy. This may determine deployment failure.');
    process.exit(1); // Fail the build if assets are missing
}
