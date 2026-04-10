import type { ExpoConfig, ConfigContext } from "expo/config";
import appJson from "./app.json";

const baseConfig = appJson.expo as ExpoConfig;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  ...baseConfig,
  extra: {
    ...(baseConfig.extra ?? {}),
    PUBLIC_ENABLE_SUPABASE: process.env.PUBLIC_ENABLE_SUPABASE,
    PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_APP_NAME: process.env.PUBLIC_APP_NAME,
    PUBLIC_DEFAULT_LOCALE: process.env.PUBLIC_DEFAULT_LOCALE,
  },
});
