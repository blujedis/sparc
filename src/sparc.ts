import {
  app as electron, MenuItem, MenuItemConstructorOptions,
  Menu, ipcMain, globalShortcut, remote
} from 'electron';
import { IApp, IAppOptions, IViewOptions, ReadyHandler, IQuitCommands, IMainState, IStoreState } from './types';
import { DEFAULTS, DEFAULT_STORE_NAME, DEFAULT_STORE_STATE } from './constants';
import ElectronStore from 'electron-store';
import isDev from 'electron-is-dev';
import { Store } from './store';
import Utils from './utils';
import { View } from './view';

let app: IApp;

function Sparc(options?: IAppOptions): IApp {

  if (!app)
    app = electron as IApp;

  options = { ...DEFAULTS, ...options };
  options.viewsExt = '.' + options.viewsExt.replace(/^\./, '');

  app.options = options;
  app.utils = new Utils(app);
  app.channel = ipcMain;
  app.definedViews = {};
  app.definedStores = {};
  app.definedMenus = {};
  app.views = {};
  app.menuItems = {};
  app.menus = {};
  app.stores = {};
  app.canDevTools = options.allowDevTools || (typeof options.allowDevTools === 'undefined' && isDev) ? true : false;
  app.isConfirmExit = typeof options.confirmExit !== 'undefined';

  Object.defineProperty(app, 'store', {
    get() {
      return getStore(DEFAULT_STORE_NAME);
    }
  });

  let _menuLoaded;
  let _inits = [];

  function getView(name: string) {
    return app.views[name];
  }

  function defineView(name: string, opts?: IViewOptions) {

    if (app.definedViews[name])
      throw new Error(`Duplicate view ${name} cannot be added`);
    // Defers view creation until ready.
    app.definedViews[name] = () => {
      return createView(name, opts);
    };

    return app;

  }

  function createView(name: string, opts?: IViewOptions) {

    if (app.views[name])
      throw new Error(`Duplicate view ${name} cannot be added`);

    opts = opts || {} as IViewOptions;
    opts.path = opts.path || name;
    opts.name = name;

    opts.webPreferences = opts.webPreferences || {};
    opts.webPreferences.devTools = app.canDevTools;

    // Don't defer main view.
    if (opts.name === options.mainView)
      opts.defer = false;

    const view = new View(opts, app);
    app.views[name] = view;

    return view;

  }

  /**
   * Initialize defined views when no views
   * names passed inits all in app.definedViews.
   * 
   * @param names key names of defined views
   */
  function initViews(...names: string[]) {

    if (!names.length)
      names = Object.keys(app.definedViews);

    names.forEach(k => {
      if (!app.views[k])
        app.definedViews[k]();
    });

    return app;

  }

  function initView(name: string) {
    if (!app.definedViews[name])
      throw new Error(`Failed to initialize view ${name}, not found`);
    return app.definedViews[name]();
  }

  function getMenuItem(name: string) {
    return app.menuItems[name];
  }

  function defineMenuItem(name: string, config: MenuItemConstructorOptions) {

    if (app.menuItems[name])
      throw new Error(`Duplicate menu item ${name} cannot be added`);
    app.menuItems[name] = config;

    return app;

  }

  function getMenu(name: string) {
    return app.menus[name];
  }

  function defineMenu(name: string, ...items: (MenuItem | MenuItemConstructorOptions)[]) {

    if (app.definedMenus[name])
      throw new Error(`Duplicate menu config ${name} cannot be added`);

    app.definedMenus[name] = () => {
      return createMenu(name, ...items);
    };

    return app;

  }

  function createMenu(name: string, ...items: (string | MenuItem | MenuItemConstructorOptions)[]) {

    if (typeof items[0] === 'object')
      return Menu.buildFromTemplate(items[0] as any);

    const menu = new Menu();

    items.forEach(m => {
      const mName = m;
      if (typeof m === 'string')
        m = app.menuItems[m];
      if (!m)
        throw new Error(`Menu item ${mName || 'unknown'} could NOT be found`);
      menu.append(m as any);
    });

    app.menus[name] = menu;

    return menu;

  }

  function initMenu(name: string) {
    if (!app.definedMenus[name])
      throw new Error(`Failed to initialize menu ${name}, not found`);
    return app.definedMenus[name]();
  }

  function initMenus(...names: string[]) {

    if (!names.length)
      names = Object.keys(app.definedMenus);

    names.forEach(k => {
      if (!app.menus[k])
        app.definedMenus[k]();
    });

    return app;

  }

  function getStore(name: string) {
    return app.stores[name];
  }

  function defineStore<T = any>(name: string, opts?: ElectronStore.Options<T>) {

    if (app.definedStores[name])
      throw new Error(`Duplicate store ${name} cannot be added`);
    // Defers view creation until ready.
    app.definedStores[name] = () => {
      return createStore(name, opts);
    };

    return app;
  }

  function createStore<T = any>(name: string, opts?: ElectronStore.Options<T>) {

    if (app.stores[name])
      throw new Error(`Duplicate store ${name} cannot be added`);

    const store = new Store<T>(name, opts, app);
    app.stores[name] = store;

    return store;

  }

  function initStore(name: string) {
    if (!app.definedStores[name])
      throw new Error(`Failed to initialize store ${name}, not found`);
    return app.definedStores[name]();
  }

  function initStores(...names: string[]) {

    if (!names.length)
      names = Object.keys(app.definedStores);

    names.forEach(k => {
      if (!app.stores[k])
        app.definedStores[k]();
    });

    return app;

  }

  function unregisterQuit(opts?: IQuitCommands) {

    opts = opts || app.registeredQuitCommands;

    const isMac = app.utils.isDarwin();

    if (isMac && opts.mac)
      globalShortcut.unregister(opts.mac);

    if (!isMac && opts.other)
      globalShortcut.unregister(opts.other);

    return app;

  }

  function registerQuit(opts: IQuitCommands = { mac: 'Command+Q', other: 'Control+X' }) {

    const isMac = app.utils.isDarwin();

    app.registeredQuitCommands = { ...opts };

    app.on('ready', () => {

      if (isMac && opts.mac) {

        globalShortcut.register(opts.mac, () => {
          app.isForcedQuit = true;
          app.quit();
        });

      }

      else if (!isMac && opts.other) {

        globalShortcut.register(opts.other, () => {
          app.isForcedQuit = true;
          app.quit();
        });

      }

    });

    app.on('will-quit', () => {
      unregisterQuit(opts);
    });

    return app;

  }

  function handleQuit(register: boolean = true) {

    app.isHandleQuit = true;

    if (register)
      registerQuit();

    app.on('window-all-closed', (e) => {
      if (app.isForcedQuit || !app.utils.isDarwin())
        app.quit();
    });

    return app;

  }

  function handleActivate() {

    app.isHandleActivate = true;

    app.on('activate', () => {
      const hasMain = Object.keys(app.views).includes(app.options.mainView);
      if (!hasMain)
        throw new Error(`Cannot handle activate, missing view main`);
      const main = app.views.main;
      main.show();
    });

    return app;

  }

  function storeState(view: View) {

    if (!app.isReady) return null;

    let viewState = app.store.getAs<IMainState>('main');

    viewState.isMaximized = view.isMaximized();

    if (!viewState.isMaximized)
      viewState = { ...viewState, ...view.getBounds() };

    app.store.setAs('main', viewState);

    return viewState;

  }

  function enableState() {

    app.on('ready', () => {

      const store = createStore<IStoreState>(DEFAULT_STORE_NAME);

      let main = { ...DEFAULT_STORE_STATE.main, width: options.width, height: options.height };
      const defaultState = { ...DEFAULT_STORE_STATE, main };

      // Get state or set default.
      let viewState = store.get('main', defaultState);

      // Store defaults.
      store.set('main', viewState);

    });

    return app;

  }

  function resetState(state?: IStoreState) {

    if (!app.isReady) return app;

    if (!state)
      app.store.clear();
    else
      app.store.store = state as any; // electron-store has bad typings.

    return app;

  }

  function setApplicationMenu(menu: string, force: boolean = false, onReady: boolean = true) {

    function loadMenu() {

      if (_menuLoaded && !force)
        return;

      let _menu = app.menus[menu];

      _menu = (_menu instanceof Menu) ? _menu : initMenu(menu);
      Menu.setApplicationMenu(_menu);

      _menuLoaded = true;

    }

    // Directly called just load.
    if (!onReady)
      loadMenu();

    // Otherwise wait until ready.
    else
      app.on('ready', loadMenu);

    return app;

  }

  function initialize(...groups: ('views' | 'menus' | 'stores')[]) {

    const map = {
      stores: initStores,
      views: initViews,
      menus: initMenus
    };

    const mapKeys = Object.keys(map);

    groups = groups.length ? groups : mapKeys as any;

    app.on('ready', () => {
      mapKeys.forEach(k => groups.includes(k as any) && map[k]());
    });

    return app;

  }

  function test(value?: boolean) {
    if (typeof value === 'undefined')
      (app as any)._testing = !(app as any)._testing;
    else
      (app as any)._testing = value;
    return app;
  }

  function ready(menu: string | ReadyHandler, fn?: ReadyHandler) {

    if (typeof menu === 'function') {
      fn = menu;
      menu = undefined;
    }

    if (menu && !getMenu(menu as string))
      throw new Error(`Could NOT find menu "${menu}"`);

    if (app.options.preserveState)
      enableState();

    if (app.options.autoInit)
      initialize();

    app.on('ready', (instance) => {

      // User defined ready handler
      if (fn)
        return fn(instance);

      // Must have "main" view if handling auto.
      if (!app.utils.hasOwn(app.views, app.options.mainView))
        throw new Error(`Missing "main" view try: app.defineView(${app.options.mainView}, { options... })`);

      if (menu && !_menuLoaded)
        setApplicationMenu(menu as string, false, false);

    });

    return app;

  }

  app.getView = getView;
  app.createView = createView;
  app.defineView = defineView;
  app.initViews = initViews;
  app.initView = initView;
  app.getMenuItem = getMenuItem;
  app.defineMenuItem = defineMenuItem;
  app.getMenu = getMenu;
  app.defineMenu = defineMenu;
  app.createMenu = createMenu;
  app.initMenus = initMenus;
  app.initMenu = initMenu;
  app.getStore = getStore;
  app.createStore = createStore;
  app.defineStore = defineStore;
  app.initStores = initStores;
  app.initStore = initStore;
  app.registerQuit = registerQuit;
  app.unregisterQuit = unregisterQuit;
  app.handleQuit = handleQuit;
  app.handleActivate = handleActivate;
  app.setApplicationMenu = setApplicationMenu;
  app.storeState = storeState;
  app.resetState = resetState;

  (app as any).test = test;
  app.initialize = initialize;
  app.ready = ready;

  return app;

}

export { Sparc };
