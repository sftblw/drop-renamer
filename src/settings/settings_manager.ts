
import { fs } from '@tauri-apps/api';
import { SettingsManager } from 'tauri-settings';

export type DropRenamerSettingsSchema = {
    input: {
      lastRegex: string,
      lastRenamePattern: string,
    },
    renameConf: {
      includeExt: boolean,
      includeFullPath: boolean,
      renameWhenDropped: boolean,
    }
}

export const settingsDefault: DropRenamerSettingsSchema =   { // defaults
  input: {
    lastRegex: '^(.*)$',
    lastRenamePattern: '$1'
  },
  renameConf: {
    includeExt: false,
    includeFullPath: false,
    renameWhenDropped: true,
  }
};

const settingsManager = new SettingsManager<DropRenamerSettingsSchema>(
  settingsDefault,
  {
    fileName: 'settings'
  }
);

// checks whether the settings file exists and created it if not
// loads the settings if it exists
try {
  await settingsManager.initialize();
} catch (ex: any) {
  console.error('failed to load settings: ', ex);
  console.error(`log path is ${settingsManager.path}, removing it and re-initializing`);
  let path = settingsManager.path;
  await fs.removeFile(path);
  await settingsManager.initialize();
}

export default settingsManager;