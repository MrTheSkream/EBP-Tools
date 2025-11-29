// Copyright (c) 2025, Antoine Duval
// This file is part of a source-visible project.
// See LICENSE for terms. Unauthorized use is prohibited.

//#region Imports

const fs = require('fs');
const { PERMANENT_SETTINGS_PATH, TEMPORARY_SETTINGS_PATH } = require('../config/constants');

//#endregion

/**
 * Storage Manager - Handles reading and writing settings to a JSON file.
 * These settings will be retained until the user deletes them, and will be retained with each update.
 */

class StorageManager {
    //#region Functions

    //#region Permanent

    static getPermanentSettingsValue(name, defaultValue) {
        const VALUE_FROM_SETTINGS = StorageManager.permanentSettings[name];
        if (VALUE_FROM_SETTINGS != undefined) return VALUE_FROM_SETTINGS;
        if (defaultValue) return defaultValue;
        return undefined;
    }

    static setPermanentSettingsValue(name, value) {
        const SETTINGS = StorageManager.permanentSettings;
        SETTINGS[name] = value;
        StorageManager.permanentSettings = SETTINGS;
    }

    static get permanentSettings() {
        if (fs.existsSync(PERMANENT_SETTINGS_PATH)) {
            return JSON.parse(fs.readFileSync(PERMANENT_SETTINGS_PATH, 'utf-8'));
        }
        return {};
    }

    static set permanentSettings(newSettings) {
        fs.writeFileSync(PERMANENT_SETTINGS_PATH, JSON.stringify(newSettings), 'utf-8');
    }

    //#endregion

    //#region Temporary

    static getTemporarySettingsValue(name, defaultValue) {
        const VALUE_FROM_SETTINGS = StorageManager.temporarySettings[name];
        if (VALUE_FROM_SETTINGS != undefined) return VALUE_FROM_SETTINGS;
        if (defaultValue) return defaultValue;
        return undefined;
    }

    static setTemporarySettingsValue(name, value) {
        const SETTINGS = StorageManager.temporarySettings;
        SETTINGS[name] = value;
        StorageManager.temporarySettings = SETTINGS;
    }

    static get temporarySettings() {
        if (fs.existsSync(TEMPORARY_SETTINGS_PATH)) {
            return JSON.parse(fs.readFileSync(TEMPORARY_SETTINGS_PATH, 'utf-8'));
        }
        return {};
    }

    static set temporarySettings(newSettings) {
        fs.writeFileSync(TEMPORARY_SETTINGS_PATH, JSON.stringify(newSettings), 'utf-8');
    }

    //#endregion

    //#endregion
}

module.exports = StorageManager;
