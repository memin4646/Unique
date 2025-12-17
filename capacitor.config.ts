import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drivein.cinema',
  appName: 'Unique',
  webDir: 'public',
  server: {
    // BURAYA KENDİ VERCEL ADRESİNİ YAZMALISIN
    // Örnek: https://unique-project.vercel.app
    url: 'https://unique-cinema.vercel.app',
    cleartext: true,
    allowNavigation: [
      "unique-cinema.vercel.app",
      "*.vercel.app"
    ]
  }
};

export default config;
