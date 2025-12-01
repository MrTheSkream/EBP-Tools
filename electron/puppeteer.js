// Copyright (c) 2025, Antoine Duval
// This file is part of a source-visible project.
// See LICENSE for terms. Unauthorized use is prohibited.

//#region Imports

const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const { destroyMainWindow } = require('./core/window-manager');

//#endregion

/**
 * This function adds an EVA game to a game list.
 * @param {*} games List of games to complete.
 * @param {*} game Game to add.
 */
function addGame(games, game) {
    const DATE = new Date(game.createdAt);
    const NEW_GAME = {
        mode: game.mode.identifier,
        map: game.map.name,
        date: DATE.toLocaleDateString('fr-FR'),
        hour: DATE.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        duration: game.data.duration,
        orangeTeam: {
            name: game.data.teamOne.name,
            score: game.data.teamOne.score,
            players: []
        },
        blueTeam: {
            name: game.data.teamTwo.name,
            score: game.data.teamTwo.score,
            players: []
        }
    };
    game.players.forEach((player) => {
        const NEW_PLAYER = {
            name: player.data.niceName,
            kills: player.data.kills,
            deaths: player.data.deaths,
            assists: player.data.assists,
            score: player.data.score,
            inflictedDamage: player.data.inflictedDamage,
            bulletsFiredAccuracy: player.data.bulletsFiredAccuracy
        };
        if (player.data.team == NEW_GAME.orangeTeam.name) {
            NEW_GAME.orangeTeam.players.push(NEW_PLAYER);
        } else if (player.data.team == NEW_GAME.blueTeam.name) {
            NEW_GAME.blueTeam.players.push(NEW_PLAYER);
        }
    });

    games.push(NEW_GAME);
}

function getBrowserPath(mainWindow, callback) {
    let browserPaths = [];

    switch (os.platform()) {
        case 'win32':
            browserPaths = [
                'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
            ];
            break;
        case 'darwin':
            browserPaths = [
                '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            ];
            break;
        case 'linux':
            browserPaths = [
                execSync('which chromium-browser').toString().trim()
            ];
            break;
        default:
            return null;
    }

    let found = false;
    for (let i = 0; i < browserPaths.length; i++) {
        if (fs.existsSync(browserPaths[i])) {
            found = true;
            callback(browserPaths[i]);
            break;
        }
    }

    if (!found) {
        mainWindow.webContents.send(
            'error',
            'view.game_history.edgeIsNotInstalled'
        );
    }
}

/**
 * Cette fonction extrait les games à partir d'une session EVA.
 * @param {*} app
 * @param {*} browser
 * @param {*} page
 * @param {*} nbPages Number of game pages to extract.
 * @param {*} tag Player Name.
 * @param {*} seasonIndex Season ID to extract.
 * @param {*} publicMode
 * @param {*} callback Callback function
 */
async function extractGames(
    app /* Electron.App */,
    browser,
    page,
    nbPages,
    seasonIndex,
    skip,
    timeToWait,
    dialog,
    publicMode,
    start,
    callback
) {
    let index = 0;
    const GAMES = [];
    let isExtractingStopped = false;
    let loadIndex = 0;
    const QUERY = '.btn-group > button:last-child';
    let onEVAWebSite = false;

    setTimeout(async () => {
        if (!onEVAWebSite) {
            await browser.close();
            destroyMainWindow();
            app.relaunch();
            app.exit(0);
        }
    }, 3 * 1000);

    // Detect when the user closes the page
    page.on('close', () => {
        console.log('Page closed by user');
        isExtractingStopped = true;
    });

    // Detect when the user closes the browser
    browser.on('disconnected', () => {
        console.log('Browser closed by user');
        isExtractingStopped = true;
    });

    // Detect page reload
    page.on('load', async () => {
        loadIndex++;
        if (loadIndex > (publicMode ? 1 : 2)) {
            console.log('Page reloaded by user');
            isExtractingStopped = true;

            page.close();
        }
    });

    page.on('request', async (request) => {
        if (!isExtractingStopped) {
            const RESOURCE_TYPE = request.resourceType();

            if (publicMode) {
                if (['image', 'font', 'media'].includes(RESOURCE_TYPE)) {
                    request.abort();
                    return;
                }
            }

            const URL = request.url();

            if (!onEVAWebSite && URL.includes('eva.gg')) {
                onEVAWebSite = true;
                const ELAPSED_SECONDS = (
                    (new Date().getTime() - start) /
                    1000
                ).toFixed(2);
                console.log(
                    `[PUPPETEER] Extraction terminée en ${ELAPSED_SECONDS}s`
                );
            }

            if (publicMode) {
                if (
                    (URL.includes('stripe.com') ||
                        URL.includes('matomo') ||
                        URL.includes('facebook') ||
                        URL.includes('youtube') ||
                        URL.includes('snapchat') ||
                        URL.includes('sst.eva.gg') ||
                        URL.includes('cdn.eva.gg') ||
                        URL.includes('axept.io') ||
                        URL.includes('tiktok.com') ||
                        URL.includes('sentry.io') ||
                        URL.includes('fonts.googleapis') ||
                        URL.includes('licdn.com') ||
                        URL.includes('inkedin.com') ||
                        URL.includes('google.com') ||
                        URL.endsWith('.css') ||
                        URL.includes('googletagmanager.com')) &&
                    !URL.includes('recaptcha')
                ) {
                    request.abort();
                    return;
                }
            }

            if (URL.includes('graphql')) {
                try {
                    const DATA = request.postData();
                    if (DATA) {
                        const JSON_DATA = JSON.parse(DATA);
                        if (JSON_DATA.operationName === 'listGameHistories') {
                            if (JSON_DATA.variables.page.page == 1) {
                                JSON_DATA.variables.page.page += skip;
                            }
                            JSON_DATA.variables.seasonId = seasonIndex;
                            request.continue({
                                headers: request.headers(),
                                method: 'POST',
                                postData: JSON.stringify(JSON_DATA)
                            });
                        } else {
                            request.continue();
                        }
                    } else {
                        request.continue();
                    }
                } catch (err) {
                    dialog.showErrorBox('Error', err);
                }
            } else {
                request.continue();
            }
        }
    });

    await page.setRequestInterception(true);
    page.on('response', async (response) => {
        if (!isExtractingStopped) {
            if (response.status() === 403) {
                console.log('❌ Accès refusé à l’API :', response.url());
            }
            if (response.url().includes('graphql')) {
                try {
                    const JSON_DATA = await response.json();
                    if (
                        JSON_DATA?.data?.gameHistories?.nodes &&
                        Array.isArray(JSON_DATA.data.gameHistories.nodes)
                    ) {
                        index++;
                        const OLD_INDEX = index;
                        JSON_DATA.data.gameHistories.nodes.forEach((game) => {
                            addGame(GAMES, game);
                        });

                        if (index < nbPages) {
                            const RANDOM = 200;
                            const MIN = timeToWait * 1000 - RANDOM;
                            const MAX = timeToWait * 1000 + RANDOM;
                            setTimeout(
                                async () => {
                                    await page.waitForSelector(QUERY);

                                    const END =
                                        (await page.$(QUERY + ':disabled')) !==
                                        null;
                                    if (END) {
                                        const ELAPSED_SECONDS = (
                                            (new Date().getTime() - start) /
                                            1000
                                        ).toFixed(2);
                                        console.log(
                                            `[PUPPETEER] Extraction terminée en ${ELAPSED_SECONDS}s`
                                        );
                                        callback(GAMES);
                                        browser.close();
                                    } else {
                                        await page.click(QUERY);

                                        setTimeout(async () => {
                                            if (OLD_INDEX == index) {
                                                await page.waitForSelector(
                                                    QUERY
                                                );
                                                await page.click(QUERY);
                                            }
                                        }, MAX + 1000);
                                    }
                                },
                                Math.floor(Math.random() * (MAX - MIN + 1)) +
                                    MIN
                            );
                        } else {
                            const ELAPSED_SECONDS = (
                                (new Date().getTime() - start) /
                                1000
                            ).toFixed(2);
                            console.log(
                                `[PUPPETEER] Extraction terminée en ${ELAPSED_SECONDS}s`
                            );
                            callback(GAMES);
                            browser.close();
                        }
                    }
                } catch (err) {
                    dialog.showErrorBox('Error', err);
                }
            }
        }
    });
}

function extractPublicPseudoGames(
    app /* Electron.App */,
    tag,
    nbPages,
    seasonIndex,
    skip,
    timeToWait,
    dialog,
    mainWindow,
    debug,
    callback
) {
    const START = new Date().getTime();
    getBrowserPath(mainWindow, async (browserPath) => {
        try {
            const BROWSER = await puppeteer.launch({
                executablePath: browserPath,
                headless: false,
                defaultViewport: debug
                    ? null
                    : {
                          width: 1920,
                          height: 1080
                      },
                args: debug
                    ? ['--start-maximized']
                    : [
                          '--disable-blink-features=AutomationControlled',
                          '--no-sandbox',
                          '--disable-setuid-sandbox',
                          `--window-position=-${Number.MAX_SAFE_INTEGER},-${Number.MAX_SAFE_INTEGER}`,
                          '--window-size=1,1',
                          '--disable-notifications',
                          '--disable-infobars',
                          '--disable-session-crashed-bubble',
                          '--mute-audio'
                      ]
            });

            const PAGE = (await BROWSER.pages())[0];

            // Définir le viewport à une taille normale si non en debug
            if (!debug) {
                await PAGE.setViewport({ width: 1920, height: 1080 });
            }

            await extractGames(
                app /* Electron.App */,
                BROWSER,
                PAGE,
                nbPages,
                seasonIndex,
                skip,
                timeToWait,
                dialog,
                true,
                START,
                callback
            );

            await PAGE.goto(
                `https://app.eva.gg/profile/public/${tag}/history/`,
                {
                    waitUntil: 'networkidle2'
                }
            );
        } catch (err) {
            dialog.showErrorBox('Error', err);
        }
    });
}

async function extractPrivatePseudoGames(
    app /* Electron.App */,
    nbPages,
    seasonIndex,
    skip,
    timeToWait,
    dialog,
    mainWindow,
    debug,
    callback
) {
    const START = new Date().getTime();
    getBrowserPath(mainWindow, async (browserPath) => {
        try {
            const BROWSER = await puppeteer.launch({
                executablePath: browserPath,
                headless: false,
                defaultViewport: null,
                args: ['--start-maximized']
            });

            // Cet espion permet de relancer la fonction si elle ne s'est pas bien passée.
            setTimeout(async () => {
                const PAGE = (await BROWSER.pages())[0];
                const URL = await PAGE.url();
                if (URL == 'about:blank') {
                    BROWSER.close();
                    extractPrivatePseudoGames(
                        nbPages,
                        seasonIndex,
                        skip,
                        timeToWait,
                        dialog,
                        callback
                    );
                }
            }, 2000);

            const PAGE = (await BROWSER.pages())[0];

            // Définir le viewport à une taille normale si non en debug
            if (!debug) {
                await PAGE.setViewport({ width: 1920, height: 1080 });
            }

            PAGE.on('framenavigated', async (frame) => {
                // When the user is logged in, he is redirected to the games page.
                if (frame.url().endsWith('/profile/dashboard')) {
                    await PAGE.goto(
                        `https://app.eva.gg/fr-FR/profile/history/`
                    );
                }
            });

            await extractGames(
                app /* Electron.App */,
                BROWSER,
                PAGE,
                nbPages,
                seasonIndex,
                skip,
                timeToWait,
                dialog,
                false,
                START,
                callback
            );

            await PAGE.goto(`https://app.eva.gg/fr-FR/login`, {
                waitUntil: 'networkidle2'
            });
        } catch (err) {
            dialog.showErrorBox('Error', err);
        }
    });
}

module.exports = {
    extractPublicPseudoGames,
    extractPrivatePseudoGames
};
