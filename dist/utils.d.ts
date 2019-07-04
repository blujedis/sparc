import { IApp } from './types';
export default class Utils {
    protected app: IApp;
    constructor(app: IApp);
    isDebug(): boolean;
    isTest(): any;
    isWindows(): boolean;
    isDarwin(): boolean;
    isLinux(): boolean;
    hasOwn(obj: object, key: string): boolean;
    promject<T = any>(prom: Promise<T>): Promise<{
        err: Error | null;
        res: T | null;
    }>;
    toViewPath(path: string, proto?: string, base?: string): string;
}
