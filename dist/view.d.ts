import { BrowserWindow } from 'electron';
import { IApp, IViewOptions } from './types';
export declare class View extends BrowserWindow {
    protected options: IViewOptions;
    protected app: IApp;
    isMain: boolean;
    constructor(options: IViewOptions, app: IApp);
    configureDevTools(): void;
    configureMain(): void;
    load(): this;
}
