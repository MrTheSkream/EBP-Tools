// Copyright (c) 2025, Antoine Duval
// This file is part of a source-visible project.
// See LICENSE for terms. Unauthorized use is prohibited.

/**
 * Console Manager - Handles console log redirection to the frontend.
 * This module manages the redirection of Electron console output to the frontend application, with proper sanitization of sensitive data like image URLs.
 */

/**
 * Setup console log redirection to send Electron console output to the frontend.
 * @param {BrowserWindow} mainWindow The main application window.
 */
function setupConsoleRedirection(mainWindow) {
    // Store original console methods.
    const ORIGINAL_CONSOLE = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug
    };

    /**
     * Helper function to sanitize objects by replacing data:image/ URLs with "...".
     * @param {any} obj The object to sanitize.
     * @returns {any} The sanitized object.
     */
    const SANITIZE_IMAGE_DATA = (obj) => {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (typeof obj === 'string') {
            return obj.startsWith('data:image/') ? '...' : obj;
        }

        if (Array.isArray(obj)) {
            return obj.map((item) => SANITIZE_IMAGE_DATA(item));
        }

        if (typeof obj === 'object') {
            const SANITIZED = {};
            for (const KEY in obj) {
                if (obj.hasOwnProperty(KEY)) {
                    SANITIZED[KEY] = SANITIZE_IMAGE_DATA(obj[KEY]);
                }
            }
            return SANITIZED;
        }

        return obj;
    };

    /**
     * Function to send log to frontend.
     * @param {string} level Log level (log, error, warn, info, debug).
     * @param {...any} args Arguments to log.
     */
    const sendLogToFrontend = (level, ...args) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            const SANITIZE_ARG = (arg) => {
                if (typeof arg === 'object' && arg !== null) {
                    const SANITIZED = SANITIZE_IMAGE_DATA(arg);
                    return JSON.stringify(SANITIZED, null, 2);
                }
                return String(arg);
            };

            const LOG_DATA = {
                level: level,
                message: args.map(SANITIZE_ARG).join(' '),
                timestamp: new Date().toISOString(),
                source: 'electron'
            };

            try {
                mainWindow.webContents.send('console-log', LOG_DATA);
            } catch (error) {
                // Silently ignore if window is not ready
            }
        }
    };

    // Override console methods
    console.log = (...args) => {
        ORIGINAL_CONSOLE.log(...args);
        sendLogToFrontend('log', ...args);
    };

    console.error = (...args) => {
        ORIGINAL_CONSOLE.error(...args);
        sendLogToFrontend('error', ...args);
    };

    console.warn = (...args) => {
        ORIGINAL_CONSOLE.warn(...args);
        sendLogToFrontend('warn', ...args);
    };

    console.info = (...args) => {
        ORIGINAL_CONSOLE.info(...args);
        sendLogToFrontend('info', ...args);
    };

    console.debug = (...args) => {
        ORIGINAL_CONSOLE.debug(...args);
        sendLogToFrontend('debug', ...args);
    };

    return ORIGINAL_CONSOLE;
}

module.exports = {
    setupConsoleRedirection
};
