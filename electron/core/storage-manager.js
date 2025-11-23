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
    static get settings() {
        if (fs.existsSync(SETTINGS_PATH)) {
            return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
        }
        return {};
    }

    static set settings(newSettings) {
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(newSettings), 'utf-8');
    }
}

module.exports = StorageManager;
