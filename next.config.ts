import type { NextConfig } from "next";
import CopyPlugin from "copy-webpack-plugin";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js'),
            to: path.join(__dirname, 'public/vad'),
          },
          {
            from: path.resolve(__dirname, 'node_modules/@ricky0123/vad-web/dist/*.onnx'),
            to: path.join(__dirname, 'public/vad/[name][ext]'),
          },
          {
            from: path.resolve(__dirname, 'node_modules/onnxruntime-web/dist/*.wasm'),
            to: path.join(__dirname, 'public/vad/[name][ext]'),
          },
        ],
      })
    );
    return config;
  },
};

export default nextConfig;
