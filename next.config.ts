import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// --- VAD ASSET COPY LOGIC (Runs at config load time) ---
const copyVadAssets = () => {
  try {
    const publicVadPath = path.join(process.cwd(), "public", "vad");

    // Ensure directory exists
    if (!fs.existsSync(publicVadPath)) {
      fs.mkdirSync(publicVadPath, { recursive: true });
    }

    const vadPackagePath = path.join(process.cwd(), "node_modules", "@ricky0123", "vad-web", "dist");
    const onnxPackagePath = path.join(process.cwd(), "node_modules", "onnxruntime-web", "dist");

    const filesToCopy = [
      { srcDir: vadPackagePath, fileName: 'vad.worklet.bundle.min.js' },
      { srcDir: vadPackagePath, fileName: 'silero_vad_v5.onnx' },
      { srcDir: vadPackagePath, fileName: 'silero_vad_legacy.onnx' },
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
        console.log(`[NextConfig] Copied VAD asset: ${fileName}`);
      } else {
        console.warn(`[NextConfig] Warning: Source file not found: ${srcPath}`);
      }
    });

  } catch (err) {
    console.error("[NextConfig] Error copying VAD assets:", err);
  }
};

// Execute copy immediately
copyVadAssets();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
