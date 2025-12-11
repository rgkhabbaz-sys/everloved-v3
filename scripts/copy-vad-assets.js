const fs = require('fs');
const path = require('path');

const vadPackagePath = path.join(__dirname, '../node_modules/@ricky0123/vad-web/dist');
const onnxPackagePath = path.join(__dirname, '../node_modules/onnxruntime-web/dist');
const publicVadPath = path.join(__dirname, '../public/vad');

// Ensure target directory exists
if (!fs.existsSync(publicVadPath)) {
    fs.mkdirSync(publicVadPath, { recursive: true });
    console.log(`Created directory: ${publicVadPath}`);
}

const filesToCopy = [
    { srcDir: vadPackagePath, fileName: 'vad.worklet.bundle.min.js' },
    { srcDir: vadPackagePath, fileName: 'silero_vad_v5.onnx' },
    { srcDir: vadPackagePath, fileName: 'silero_vad_legacy.onnx' }, // Including legacy model
    { srcDir: onnxPackagePath, fileName: 'ort-wasm-simd-threaded.wasm' },
    { srcDir: onnxPackagePath, fileName: 'ort-wasm-simd.wasm' },
    { srcDir: onnxPackagePath, fileName: 'ort-wasm-threaded.wasm' },
    { srcDir: onnxPackagePath, fileName: 'ort-wasm.wasm' }
];

filesToCopy.forEach(({ srcDir, fileName }) => {
    const srcPath = path.join(srcDir, fileName);
    const destPath = path.join(publicVadPath, fileName);

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${fileName}`);
    } else {
        console.warn(`Warning: Source file not found: ${srcPath}`);
    }
});

console.log('VAD assets verification complete.');
