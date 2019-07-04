import { join } from 'path';
import { format } from 'url';
import { IApp } from './types';

declare var v8debug;

export default class Utils {

  constructor(protected app: IApp) {}

  isDebug() {
    return typeof v8debug === 'object' ||
      /--debug|--inspect/.test(process.execArgv.join(' ')) ||
      /--debug|--inspect/.test(process.argv.join(' '));
  }

  isTest() {
    return (this.app as any)._testing;
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

  hasOwn(obj: object, key: string) {
    return obj.hasOwnProperty(key);
  }

  promject<T = any>(prom: Promise<T>): Promise<{ err: Error | null; res: T | null }> {
    return prom
      .then(res => ({ err: null, res }))
      .catch(err => ({ err, res: null }));
  }

  toViewPath(path: string, proto = 'file:', base = '') {

    const options = this.app.options;

    // Already contains protocol/full path.
    if (/^(file:|https?:)/.test(path))
      return path;

    path =
      path.replace(new RegExp(options.viewsExt + '$'), '') + options.viewsExt;

    base = (base || options.viewsDir);
    proto = proto.replace(/:$/, '') + ':';

    return format({
      pathname: join(base, path),
      protocol: proto,
      slashes: true
    });

  }

}