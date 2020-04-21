"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const constants_1 = require("./constants");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const store_1 = require("./store");
const utils_1 = __importDefault(require("./utils"));
const view_1 = require("./view");
let app;
function Sparc(options) {
    if (!app)
        app = electron_1.app;
    options = { ...constants_1.DEFAULTS, ...options };
    options.viewsExt = '.' + options.viewsExt.replace(/^\./, '');
    app.options = options;
    app.utils = new utils_1.default(app);
    app.channel = electron_1.ipcMain;
    app.definedViews = {};
    app.definedStores = {};
    app.definedMenus = {};
    app.views = {};
    app.menuItems = {};
    app.menus = {};
    app.stores = {};
    app.canDevTools = options.allowDevTools || (typeof options.allowDevTools === 'undefined' && electron_is_dev_1.default) ? true : false;
    app.isConfirmExit = typeof options.confirmExit !== 'undefined';
    Object.defineProperty(app, 'store', {
        get() {
            return getStore(constants_1.DEFAULT_STORE_NAME);
        }
    });
    let _menuLoaded;
    let _inits = [];
    function getView(name) {
        return app.views[name];
    }
    function defineView(name, opts) {
        if (app.definedViews[name])
            throw new Error(`Duplicate view ${name} cannot be added`);
        // Defers view creation until ready.
        app.definedViews[name] = () => {
            return createView(name, opts);
        };
        return app;
    }
    function createView(name, opts) {
        if (app.views[name])
            throw new Error(`Duplicate view ${name} cannot be added`);
        opts = opts || {};
        opts.path = opts.path || name;
        opts.name = name;
        opts.webPreferences = opts.webPreferences || {};
        opts.webPreferences.devTools = app.canDevTools;
        // Don't defer main view.
        if (opts.name === options.mainView)
            opts.defer = false;
        const view = new view_1.View(opts, app);
        app.views[name] = view;
        return view;
    }
    /**
     * Initialize defined views when no views
     * names passed inits all in app.definedViews.
     *
     * @param names key names of defined views
     */
    function initViews(...names) {
        if (!names.length)
            names = Object.keys(app.definedViews);
        names.forEach(k => {
            if (!app.views[k])
                app.definedViews[k]();
        });
        return app;
    }
    function initView(name) {
        if (!app.definedViews[name])
            throw new Error(`Failed to initialize view ${name}, not found`);
        return app.definedViews[name]();
    }
    function getMenuItem(name) {
        return app.menuItems[name];
    }
    function defineMenuItem(name, config) {
        if (app.menuItems[name])
            throw new Error(`Duplicate menu item ${name} cannot be added`);
        app.menuItems[name] = config;
        return app;
    }
    function getMenu(name) {
        return app.menus[name];
    }
    function defineMenu(name, ...items) {
        if (app.definedMenus[name])
            throw new Error(`Duplicate menu config ${name} cannot be added`);
        app.definedMenus[name] = () => {
            return createMenu(name, ...items);
        };
        return app;
    }
    function createMenu(name, ...items) {
        if (typeof items[0] === 'object')
            return electron_1.Menu.buildFromTemplate(items[0]);
        const menu = new electron_1.Menu();
        items.forEach(m => {
            const mName = m;
            if (typeof m === 'string')
                m = app.menuItems[m];
            if (!m)
                throw new Error(`Menu item ${mName || 'unknown'} could NOT be found`);
            menu.append(m);
        });
        app.menus[name] = menu;
        return menu;
    }
    function initMenu(name) {
        if (!app.definedMenus[name])
            throw new Error(`Failed to initialize menu ${name}, not found`);
        return app.definedMenus[name]();
    }
    function initMenus(...names) {
        if (!names.length)
            names = Object.keys(app.definedMenus);
        names.forEach(k => {
            if (!app.menus[k])
                app.definedMenus[k]();
        });
        return app;
    }
    function getStore(name) {
        return app.stores[name];
    }
    function defineStore(name, opts) {
        if (app.definedStores[name])
            throw new Error(`Duplicate store ${name} cannot be added`);
        // Defers view creation until ready.
        app.definedStores[name] = () => {
            return createStore(name, opts);
        };
        return app;
    }
    function createStore(name, opts) {
        if (app.stores[name])
            throw new Error(`Duplicate store ${name} cannot be added`);
        const store = new store_1.Store(name, opts, app);
        app.stores[name] = store;
        return store;
    }
    function initStore(name) {
        if (!app.definedStores[name])
            throw new Error(`Failed to initialize store ${name}, not found`);
        return app.definedStores[name]();
    }
    function initStores(...names) {
        if (!names.length)
            names = Object.keys(app.definedStores);
        names.forEach(k => {
            if (!app.stores[k])
                app.definedStores[k]();
        });
        return app;
    }
    function unregisterQuit(opts) {
        opts = opts || app.registeredQuitCommands;
        const isMac = app.utils.isDarwin();
        if (isMac && opts.mac)
            electron_1.globalShortcut.unregister(opts.mac);
        if (!isMac && opts.other)
            electron_1.globalShortcut.unregister(opts.other);
        return app;
    }
    function registerQuit(opts = { mac: 'Command+Q', other: 'Control+X' }) {
        const isMac = app.utils.isDarwin();
        app.registeredQuitCommands = { ...opts };
        app.on('ready', () => {
            if (isMac && opts.mac) {
                electron_1.globalShortcut.register(opts.mac, () => {
                    app.isForcedQuit = true;
                    app.quit();
                });
            }
            else if (!isMac && opts.other) {
                electron_1.globalShortcut.register(opts.other, () => {
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
    function handleQuit(register = true) {
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
    function storeState(view) {
        if (!app.isReady)
            return null;
        let viewState = app.store.getAs('main');
        if (!viewState)
            return null;
        viewState.isMaximized = view.isMaximized();
        if (!viewState.isMaximized)
            viewState = { ...viewState, ...view.getBounds() };
        app.store.setAs('main', viewState);
        return viewState;
    }
    function enableState() {
        app.on('ready', () => {
            const store = createStore(constants_1.DEFAULT_STORE_NAME);
            let main = { ...constants_1.DEFAULT_STORE_STATE.main, width: options.width, height: options.height };
            const defaultState = { ...constants_1.DEFAULT_STORE_STATE, main };
            // Get state or set default.
            let viewState = store.get('main', defaultState);
            // Store defaults.
            store.set('main', viewState);
        });
        return app;
    }
    function resetState(state) {
        if (!app.isReady)
            return app;
        if (!state)
            app.store.clear();
        else
            app.store.store = state; // electron-store has bad typings.
        return app;
    }
    function setApplicationMenu(menu, force = false, onReady = true) {
        function loadMenu() {
            if (_menuLoaded && !force)
                return;
            let _menu = app.menus[menu];
            _menu = (_menu instanceof electron_1.Menu) ? _menu : initMenu(menu);
            electron_1.Menu.setApplicationMenu(_menu);
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
    function initialize(...groups) {
        const map = {
            stores: initStores,
            views: initViews,
            menus: initMenus
        };
        const mapKeys = Object.keys(map);
        groups = groups.length ? groups : mapKeys;
        app.on('ready', () => {
            mapKeys.forEach(k => groups.includes(k) && map[k]());
        });
        return app;
    }
    function test(value) {
        if (typeof value === 'undefined')
            app._testing = !app._testing;
        else
            app._testing = value;
        return app;
    }
    function ready(menu, fn) {
        if (typeof menu === 'function') {
            fn = menu;
            menu = undefined;
        }
        if (menu && !getMenu(menu))
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
                setApplicationMenu(menu, false, false);
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
    app.test = test;
    app.initialize = initialize;
    app.ready = ready;
    return app;
}
exports.Sparc = Sparc;
//# sourceMappingURL=sparc.js.map