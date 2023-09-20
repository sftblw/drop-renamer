
import { SettingsManager } from 'tauri-settings';

export type SettingsScheme = {
    input: {
        lastRegex: string,
        lastPattern: string
    }
}

const settingsManager = new SettingsManager<SettingsScheme>(
  { // defaults
    input: {
        lastRegex: '^.*$',
        lastPattern: '$1'
    }
  },
  {
    fileName: 'settings'
  }
);

// checks whether the settings file exists and created it if not
// loads the settings if it exists
settingsManager.initialize().then(() => {});

export default settingsManager;