import { defineConfig, Schema } from '@julr/vite-plugin-validate-env';

export default defineConfig({
  validator: 'builtin',
  schema: {
    VITE_PORT: Schema.number.optional(),
    VITE_API_ENDPOINT: Schema.string(),
    VITE_RECAPTCHA_SITE_KEY: Schema.string(),
    VITE_TOSS_CLIENT_KEY: Schema.string.optional(),
    VITE_MALL_HOST: Schema.string(),
    VITE_BRAND_HOST: Schema.string(),
    VITE_VENDOR_HOST: Schema.string(),
    VITE_KAKAO_MAP_APP_KEY: Schema.string.optional(),
    VITE_API_URL: Schema.string(),
    VITE_REVERB_APP_KEY: Schema.string(),
    VITE_REVERB_HOST: Schema.string(),
    VITE_REVERB_PORT: Schema.number(),
    VITE_REVERB_SCHEME: Schema.enum(['http', 'https'] as const),
  },
});
