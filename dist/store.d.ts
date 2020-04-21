import ElectronStore from 'electron-store';
import { IApp } from './types';
export declare class Store<T = any> extends ElectronStore<T> {
    name: string;
    protected options: ElectronStore.Options<T>;
    protected app: IApp;
    constructor(name: string, options: ElectronStore.Options<T>, app: IApp);
    getAs<S = any>(name: keyof T, defaultValue?: S): S;
    setAs<S = any>(key: keyof T, value: S): void;
}
