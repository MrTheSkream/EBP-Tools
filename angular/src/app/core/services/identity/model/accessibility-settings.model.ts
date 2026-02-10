// Copyright (c) 2026, Antoine Duval
// This file is part of a source-visible project.
// See LICENSE for terms. Unauthorized use is prohibited.

//#region Imports

import { BehaviorSubject } from 'rxjs';

//#endregion

export class AccessibilitySettings {
  //#region Attributes

  //#region Saturation

  private _saturation = new BehaviorSubject<number>(50);
  saturation$ = this._saturation.asObservable();

  public set saturation(value: number) {
    this._saturation.next(value);
  }

  public get saturation(): number {
    return this._saturation.getValue();
  }

  //#endregion

  //#region Contrast

  private _contrast = new BehaviorSubject<number>(0);
  contrast$ = this._contrast.asObservable();

  public set contrast(value: number) {
    this._contrast.next(value);
  }

  public get contrast(): number {
    return this._contrast.getValue();
  }

  //#endregion

  //#region Protanopia

  private _protanopia = new BehaviorSubject<number>(0);
  protanopia$ = this._protanopia.asObservable();

  public set protanopia(value: number) {
    this._protanopia.next(value);
  }

  public get protanopia(): number {
    return this._protanopia.getValue();
  }

  //#endregion

  //#region Deuteranopia

  private _deuteranopia = new BehaviorSubject<number>(0);
  deuteranopia$ = this._deuteranopia.asObservable();

  public set deuteranopia(value: number) {
    this._deuteranopia.next(value);
  }

  public get deuteranopia(): number {
    return this._deuteranopia.getValue();
  }

  //#endregion

  //#region Tritanopia

  private _tritanopia = new BehaviorSubject<number>(0);
  tritanopia$ = this._tritanopia.asObservable();

  public set tritanopia(value: number) {
    this._tritanopia.next(value);
  }

  public get tritanopia(): number {
    return this._tritanopia.getValue();
  }

  //#endregion

  //#endregion
}

export interface AccessibilitySettingsDTO {
  saturation: number;
  contrast: number;
  protanopia: number;
  deuteranopia: number;
  tritanopia: number;
}
