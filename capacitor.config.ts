import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drivein.cinema',
  appName: 'Unique',
  webDir: 'public',
  server: {
    url: 'https://unique-lime-one.vercel.app',
    cleartext: true,
    allowNavigation: [
      "unique-lime-one.vercel.app",
      "*.vercel.app"
    ]
  }
};

export default config;
