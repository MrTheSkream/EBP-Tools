// Copyright (c) 2025, Antoine Duval
// This file is part of a source-visible project.
// See LICENSE for terms. Unauthorized use is prohibited.

//#region Imports

const fs = require('fs');
const { SETTINGS_PATH } = require('../config/constants');

//#endregion

/**
 * Storage Manager - Handles reading and writing settings to a JSON file.
 * These settings will be retained until the user deletes them, and will be retained with each update.
 */

class StorageManager {
    //#region Functions

    static getSettingsValue(name, defaultValue) {
        const VALUE_FROM_SETTINGS = StorageManager.settings[name];
        if (VALUE_FROM_SETTINGS) return VALUE_FROM_SETTINGS;
        if (defaultValue) return defaultValue;
        return undefined;
    }

    static setSettingsValue(name, value) {
        const SETTINGS = StorageManager.settings;
        SETTINGS[name] = value;
        StorageManager.settings = SETTINGS;
    }

    static get settings() {
        if (fs.existsSync(SETTINGS_PATH)) {
            return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
        }
        return {};
    }

    static set settings(newSettings) {
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(newSettings), 'utf-8');
    }

    //#endregion
}

module.exports = StorageManager;
