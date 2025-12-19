// Copyright (c) 2025, Antoine Duval
// This file is part of a source-visible project.
// See LICENSE for terms. Unauthorized use is prohibited.

//#region Imports

const express = require('express');
const path = require('path');
const {
    IS_DEV_MODE,
    BROWSER_PATH,
    initializePort
} = require('../config/constants');

//#endregion

/**
 * Sets up and configures the Express server for serving the Angular frontend.
 * @returns {Promise<number>} The port number the server is listening on.
 */
async function setupExpressServer() {
    const PORT = await initializePort();

    return new Promise((resolve) => {
        const APP = express();

        // Configure Express environment
        if (IS_DEV_MODE) {
            APP.set('env', 'development');
        } else {
            APP.use(express.static(BROWSER_PATH));
        }

        // File serving endpoint - allows frontend to access local files
        APP.get('/file', (req, res) => {
            const FILE_PATH = req.query.path;
            if (!FILE_PATH) {
                return res.status(400).send('Missing path');
            }
            res.sendFile(FILE_PATH);
        });

        // Catch-all route handler
        APP.use((req, res, next) => {
            // In development, redirect to Angular dev server
            if (process.env.NODE_ENV !== 'production') {
                return res.redirect('http://localhost:4200');
            }

            // In production, serve the Angular index.html
            const INDEX_FILE = path.join(BROWSER_PATH, 'index.html');
            res.sendFile(INDEX_FILE, (err) => {
                if (err) {
                    console.error('[EXPRESS] Error serving index.html:', err);
                    res.status(500).send('Server error');
                }
            });
        });

        // Start the server
        APP.listen(PORT, '127.0.0.1', () => {
            console.log(`[EXPRESS] Listening on http://localhost:${PORT}.`);
            resolve(PORT);
        });
    });
}

module.exports = {
    setupExpressServer
};
