import ElectronStore from 'electron-store';
import { IApp } from './types';

export class Store<T = any> extends ElectronStore<T> {

  constructor(public name: string, protected options: ElectronStore.Options<T>, protected app: IApp) {
    super({ name, ...options });
  }

  getAs<S = any>(name: keyof T, defaultValue?: S): S {
    return this.get(name, defaultValue as any) as any;
  }

  setAs<S = any>(key: keyof T, value: S) {
    this.set(key, value as any);
  }

}
