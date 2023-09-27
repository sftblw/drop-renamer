
import { SettingsManager } from 'tauri-settings';

export type DropRenamerSettingsSchema = {
    input: {
        lastRegex: string,
        lastRenamePattern: string
    }
}

const settingsManager = new SettingsManager<DropRenamerSettingsSchema>(
  { // defaults
    input: {
        lastRegex: '^(.*)$',
        lastRenamePattern: '$1'
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