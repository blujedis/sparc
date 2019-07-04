"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const url_1 = require("url");
class Utils {
    constructor(app) {
        this.app = app;
    }
    isDebug() {
        return typeof v8debug === 'object' ||
            /--debug|--inspect/.test(process.execArgv.join(' ')) ||
            /--debug|--inspect/.test(process.argv.join(' '));
    }
    isTest() {
        return this.app._testing;
    }
    isWindows() {
        return process.platform === 'win32';
    }
    isDarwin() {
        return process.platform === 'darwin';
    }
    isLinux() {
        return process.platform === 'linux';
    }
    hasOwn(obj, key) {
        return obj.hasOwnProperty(key);
    }
    promject(prom) {
        return prom
            .then(res => ({ err: null, res }))
            .catch(err => ({ err, res: null }));
    }
    toViewPath(path, proto = 'file:', base = '') {
        const options = this.app.options;
        // Already contains protocol/full path.
        if (/^(file:|https?:)/.test(path))
            return path;
        path =
            path.replace(new RegExp(options.viewsExt + '$'), '') + options.viewsExt;
        base = (base || options.viewsDir);
        proto = proto.replace(/:$/, '') + ':';
        return url_1.format({
            pathname: path_1.join(base, path),
            protocol: proto,
            slashes: true
        });
    }
}
exports.default = Utils;
//# sourceMappingURL=utils.js.map