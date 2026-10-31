import { defineConfig, Schema } from '@julr/vite-plugin-validate-env';

export default defineConfig({
  validator: 'builtin',
  schema: {
    VITE_PORT: Schema.number(),
    VITE_API_ENDPOINT: Schema.string(),
    VITE_KAKAO_MAP_API_KEY: Schema.string.optional(),
  },
});
