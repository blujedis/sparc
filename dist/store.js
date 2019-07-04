"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_store_1 = __importDefault(require("electron-store"));
class Store extends electron_store_1.default {
    constructor(name, options, app) {
        super({ name, ...options });
        this.name = name;
        this.options = options;
        this.app = app;
    }
    getAs(name, defaultValue) {
        return this.get(name, defaultValue);
    }
    setAs(key, value) {
        this.set(key, value);
    }
}
exports.Store = Store;
//# sourceMappingURL=store.js.map