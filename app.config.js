// Expo config that can safely read local env vars at build/start time.
// NOTE: This still ships the key to the client bundle. For production, proxy OpenAI via a server.

export default ({ config }) => ({
  ...config,
  name: "Verlo AI",
  slug: "verlo-ai",
  scheme: "verlo-ai",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/Screenshot_2026-01-11_at_2.46.45_PM-removebg-preview (1).png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    bundleIdentifier: "com.saleemshaikh.verloai",
    supportsTablet: true
  },
  android: {
    package: "com.anonymous.verloai",
    adaptiveIcon: {
      foregroundImage: "./assets/Screenshot_2026-01-11_at_2.46.45_PM-removebg-preview (1).png",
      backgroundColor: "#ffffff"
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-router",
    "expo-font"
  ],
  extra: {
    ...(config.extra ?? {}),
    // Prefer EXPO_PUBLIC_OPENAI_API_KEY if provided, otherwise fall back to OPENAI_API_KEY.
    EXPO_PUBLIC_OPENAI_API_KEY:
      process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY,
  },
});








