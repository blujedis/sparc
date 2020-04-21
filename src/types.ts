import { App, BrowserWindowConstructorOptions, 
    MenuItemConstructorOptions, MenuItem, Menu, Event, 
    IpcMain, LoadURLOptions, MessageBoxOptions } from 'electron';
import ElectronStore from 'electron-store';
import { View } from './view';
import Utils from './utils';
import { Store } from './store';

export type ReadyHandler = (instance: IApp) => void;

export interface IViewOptions extends BrowserWindowConstructorOptions {
  name?: string;                // name of the view.
  path?: string;                // url or file path to load.
  defer?: boolean;              // defers loading view (default: true)
  graceful?: boolean;           // when true gracefully loads view (default: true)
  loadOptions?: LoadURLOptions; // BrowserWindow loadURL options.
}

export type ChannelHandler<T = any> = (event: Event, arg: T) => void;

export interface IMenuItems {
  [key: string]: MenuItemConstructorOptions;
}

export interface IStores {
  [key: string]: Store;
}

export interface IMenus {
  [key: string]: Menu;
}

export interface IViews {
  [key: string]: View;
}

export interface IDefinedViews {
  [key: string]: () => View;
}

export interface IDefinedStores {
  [key: string]: () => Store;
}

export interface IDefinedMenus {
  [key: string]: () => Menu;
}

export interface IQuitCommands {
  mac?: string;
  other?: string;
}

export interface IMainState {
  isMaximized?: boolean;
  x?: number;
  y?: number;
  height?: number;
  width?: number;
}

export interface IStoreState {
  main: IMainState;
}

export type ConfirmExitConfig = boolean | string | MessageBoxOptions;

export interface IAppOptions {
  mainView?: string;                  // name of the main view/window defaults to "main".
  viewsDir?: string;                  // directory where views are stored.
  viewsExt?: string;                  // views extension.
  confirmExit?: ConfirmExitConfig;    // if not undefined shows confirm on exit.        
  allowDevTools?: boolean;            // when true allow dev tools to open (default: true when isDev)
  preserveState?: boolean;            // when true view state/settings preserved w, h & position.
  autoInit?: boolean;                 // when true auto inits views, menus & stores. (default: true)
  width?: number;                     // default app width. (default: 800)
  height?: number;                    // default app height.  (default: 600)
}

export interface IApp extends App {
  options: IAppOptions;
  utils: Utils;
  definedViews: IDefinedViews;
  definedStores: IDefinedStores;
  definedMenus: IDefinedMenus;
  views: IViews;
  menuItems: IMenuItems;
  menus: IMenus;
  stores: IStores;
  channel: IpcMain;
  registeredQuitCommands: IQuitCommands;
  isForcedQuit: boolean;
  isHandleQuit: boolean;
  isConfirmExit: boolean;
  isHandleActivate: boolean;
  store: Store<IStoreState>;
  canDevTools: boolean;
  getView(name: string): View;
  createView(name: string, options?: IViewOptions): View;
  defineView(name: string, opts?: IViewOptions): this;
  initViews(...names: string[]): this;
  initView(name: string): View;
  getMenuItem(name: string): MenuItemConstructorOptions;
  defineMenuItem(name: string, config: MenuItemConstructorOptions): this;
  getMenu(name: string): Menu;
  defineMenu(name: string, config: MenuItemConstructorOptions): this;
  defineMenu(name: string, ...items: MenuItem[]): this;
  createMenu(name: string, config: MenuItemConstructorOptions): Menu;
  createMenu(name: string, ...items: (string | MenuItem)[]): Menu;
  initMenus(...names: string[]): this;
  initMenu(name: string): Menu;
  getStore<T = any>(name: string): Store<T>;
  defineStore<T = any>(name: string, options?: ElectronStore.Options<T>): this;
  createStore<T = any>(name: string, options?: ElectronStore.Options<T>): Store<T>;
  initStores(...names: string[]): this;
  initStore<T = any>(name: string): Store<T>;
  handleQuit(register?: boolean): this;
  handleActivate(): this;
  setApplicationMenu(name: string, force?: boolean): this;
  registerQuit(opts?: IQuitCommands): this;
  unregisterQuit(opts?: IQuitCommands): this;
  storeState(view: View): IMainState;
  resetState(state?: IStoreState): this;
  initialize(...groups: ('stores' | 'views' | 'menus')[]): this;
  ready(fn?: ReadyHandler): this;
  ready(menu: string, fn?: ReadyHandler): this;
}