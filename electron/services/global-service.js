// Copyright (c) 2026, Antoine Duval
// This file is part of a source-visible project.
// See LICENSE for terms. Unauthorized use is prohibited.

//#region Imports

const fs = require('fs');
const path = require('node:path');

//#endregion

/**
 * Safely deletes a file/folder if it exists, with Unicode normalization for proper file path handling.
 * @param path The file/folder path to delete.
 */
function unlinkSync(path) {
    const NORMALIZED_CUT_PATH = path.normalize('NFC');
    if (fs.existsSync(NORMALIZED_CUT_PATH)) {
        fs.unlinkSync(NORMALIZED_CUT_PATH);
    }
}

module.exports = {
    unlinkSync
};
