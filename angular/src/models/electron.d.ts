// Copyright (c) 2025, Antoine Duval
// This file is part of a source-visible project.
// See LICENSE for terms. Unauthorized use is prohibited.

//#region Imports

import { VideoPlatform } from './video-platform.enum';
import { Versions } from './versions';
import { JWT } from './jwt';
import { CropperPosition } from 'ngx-image-cropper';
import { Game } from '../app/views/replay_cutter/models/game';
import { Message } from '../app/views/notification/models/message.model';

//#endregion

export interface ElectronAPI {
  //#region Client to Server

  setWindowSize: (width?: number, height?: number) => Promise<void>;
  cutVideoFile: (
    game: Game,
    videoPath: string,
    customText: string
  ) => Promise<string>;
  cutVideoFiles: (
    games: Game[],
    videoPath: string,
    customText: string
  ) => Promise<string>;
  debugMode: () => Promise<void>;
  downloadReplay: (url: string, platform: VideoPlatform) => Promise<void>;
  extractPublicPseudoGames: (
    tag: string,
    nbPages: number,
    seasonIndex: number,
    skip: number,
    timeToWait: number
  ) => Promise<void>;
  extractPrivatePseudoGames: (
    nbPages: number,
    seasonIndex: number,
    skip: number,
    timeToWait: number
  ) => Promise<void>;
  getExpressPort: () => Promise<number>;
  getJWTAccessToken: () => Promise<string>;
  getGameHistoryOutputPath: () => Promise<string>;
  getOS: () => Promise<NodeJS.Platform>;
  getPublicPseudoGamesOutputPath: () => Promise<string>;
  getPrivatePseudoGamesOutputPath: () => Promise<string>;
  getReplayCutterOutputPath: () => Promise<string>;
  getReplayDownloaderOutputPath: () => Promise<string>;
  getVersion: () => Promise<Versions>;
  getVideoCutterOutputPath: () => Promise<string>;
  isDevMode: () => Promise<boolean>;
  logout: () => Promise<void>;
  checkJwtToken: () => Promise<void>;
  openFile: (pathFile: string) => Promise<void>;
  openFiles: (extensions: string[]) => Promise<string[]>;
  openURL: (url: string) => void;
  setSetting: (setting: string) => Promise<string>;
  setVideoFile: (callback: (path: string) => void) => Promise<void>;
  uploadGameMiniMap: (
    gameIndex: number,
    game: Game,
    c: CropperPosition,
    margedC: CropperPosition,
    videoPath: string,
    gameID: number,
    orangeTeamInfosPosition: CropperPosition,
    blueTeamInfosPosition: CropperPosition,
    topInfosPosition: CropperPosition,
    sortedOrangePlayersNames: string[],
    sortedBluePlayersNames: string[]
  ) => void;
  manualCutVideoFile: (
    videoPath?: string,
    chunks: VideoChunk[],
    notificationData: string
  ) => Promise<string>;
  setLanguage: (language?: string) => void;
  showNotification: (
    hideMainWindow: boolean,
    width: number,
    height: number,
    notificationData: string
  ) => void;
  removeNotification: (showMainWindow: boolean) => void;
  saveConsoleLogs: (logs: ElectronLogData[]) => Promise<string>;
  removeBorders: (cropperPosition: CropperPosition, videoPath: string) => void;
  setVideoResolution: (
    videoPath: string,
    width: number,
    height: number
  ) => Promise<string>;
  getSettings: (key: string) => Promise<any | undefined>;
  setSettings: (key: string, value: any) => void;
  socketEmit: (socket: string, path: string, value: any) => void;

  //#endregion

  //#region Server to Client

  setManualCutPercent: (callback: (percent: number) => void) => void;
  setUpscalePercent: (callback: (percent: number) => void) => void;
  setRemoveBordersPercent: (callback: (percent: number) => void) => void;
  setJWTAccessToken: (callback: (accessToken: string) => void) => void;
  gameIsUploaded: (callback: (gameIndex: number) => void) => void;
  analyzeVideoFile: (
    callback: (
      socket: string,
      filePath: string,
      forcedTraining: boolean | undefined
    ) => void
  ) => void;
  gamesAreExported: (callback: (filePath: string | undefined) => void) => void;
  replayDownloaderError: (callback: (error: string) => void) => void;
  replayDownloaderSuccess: (callback: (path: string) => void) => void;
  replayDownloaderPercent: (callback: (percent: number) => void) => void;
  globalMessage: (
    callback: (i18nPath: string, i18nVariables: object) => void
  ) => void;
  onConsoleLog: (callback: (logData: ElectronLogData) => void) => void;
  toast: (
    callback: (
      type: 'success' | 'error' | 'warning' | 'info',
      i18nPath: string,
      i18nVariables: object
    ) => void
  ) => void;
  setNotificationData: (callback: (data: Message) => void) => void;

  //#endregion
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
