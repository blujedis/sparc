import { IAppOptions, IStoreState } from 'types';
import { join } from 'path';

export const DEFAULTS: IAppOptions = {
  mainView: 'main',
  viewsDir: join(process.cwd(), 'views'),
  viewsExt: '.html',
  confirmExit: false,
  allowDevTools: undefined,
  preserveState: true,
  autoInit: true,
  width: 800,
  height: 600
};

export const DEFAULT_STORE_STATE: IStoreState = {
  main: {
    isMaximized: false,
    x: undefined,
    y: undefined,
    height: 600,
    width: 800
  }
};

export const DEFAULT_STORE_NAME = '__default_store__';