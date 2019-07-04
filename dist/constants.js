"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.DEFAULTS = {
    mainView: 'main',
    viewsDir: path_1.join(process.cwd(), 'views'),
    viewsExt: '.html',
    confirmExit: false,
    allowDevTools: undefined,
    preserveState: true,
    autoInit: true,
    width: 800,
    height: 600
};
exports.DEFAULT_STORE_STATE = {
    main: {
        isMaximized: false,
        x: undefined,
        y: undefined,
        height: 600,
        width: 800
    }
};
exports.DEFAULT_STORE_NAME = '__default_store__';
//# sourceMappingURL=constants.js.map