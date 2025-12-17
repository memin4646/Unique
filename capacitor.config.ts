import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drivein.cinema',
  appName: 'DriveInCinema',
  webDir: 'public',
  server: {
    url: 'http://192.168.1.105:3001',
    cleartext: true
  }
};

export default config;
