import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiOrigin = (env.VITE_API_ENDPOINT || env.VITE_API_URL || '').replace(/\/api\/?$/, '');
  const templateAssetOrigin = env.VITE_TEMPLATE_ASSET_ORIGIN || 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com';

  return {
    plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: Number(env.VITE_PORT),
      proxy: {
        '/__template_assets': {
          target: templateAssetOrigin,
          changeOrigin: true,
          rewrite: (url) => url.replace(/^\/__template_assets/, ''),
        },
        ...(apiOrigin
          ? {
              '/storage': {
                target: apiOrigin,
                changeOrigin: true,
              },
            }
          : {}),
      },
    },
  };
});
