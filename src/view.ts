import { BrowserWindow, dialog, MessageBoxOptions } from 'electron';
import { IApp, IViewOptions, IMainState } from './types';

const WINDOW_DEFAULTS = {};

const DEFAULTS: IViewOptions = {
  defer: true,
  graceful: true,
  loadOptions: {}
};

export class View extends BrowserWindow {

  isMain: boolean = false;

  constructor(protected options: IViewOptions, protected app: IApp) {

    super({ ...WINDOW_DEFAULTS, ...options } as any);

    this.options = { ...DEFAULTS, ...options };

    this.isMain = options.name === this.app.options.mainView;

    if (this.isMain)
      this.options.defer = false;

    this.options.path = this.app.utils.toViewPath(options.path);

    const title = (this.getTitle() || '').toLowerCase();
    if ((!title || title === 'electron') && options.name)
      this.setTitle(options.name.charAt(0).toUpperCase() + options.name.slice(1));

    this.configureMain();

    this.configureDevTools();

    if (!this.options.defer)
      this.load();

  }

  configureDevTools() {
    if (!this.app.canDevTools)
      this.webContents.on('devtools-opened', this.webContents.closeDevTools);
  }

  configureMain() {

    if (!this.isMain) return;

    // Handle view state preservation.
    if (this.app.options.preserveState) {

      // Bind handlers.
      ['resize', 'move', 'close'].forEach(e => {
        this.on(e as any, () => this.app.storeState(this));
      });

      // Set bounds.
      const viewState = this.app.store.getAs<IMainState>('main');

      if (viewState.isMaximized)
        this.maximize();
      else
        this.setBounds(viewState);

    }

    // Configure confirm exit.

    let config = this.app.options.confirmExit;

    if (config) {

      if (config === true || typeof config === 'string') {

        config = {
          title: 'Confirm',
          type: 'question',
          message: config === true ? 'Are you sure you want to quit?' : config,
          buttons: ['Yes', 'No']
        };

      }

    }

    // Set close handler.
    this.on('close', (e) => {

      if (config && this.app.isConfirmExit) {

        e.preventDefault();

        dialog.showMessageBox(null, config as MessageBoxOptions)
          .then(res => {

            if (res.checkboxChecked) {
              // set to false or will loop.
              this.app.isConfirmExit = false;

              if (!this.app.isForcedQuit && this.app.utils.isDarwin()) {
                this.hide();
              }
              else {
                this.close();
              }

            }

          })
          .catch(err => {
            console.log(err);
          });

      }

      else {

        if (!this.app.isForcedQuit && this.app.utils.isDarwin()) {
          e.preventDefault();
          this.hide();
        }

      }

    });

  }

  load() {

    this.loadURL(this.options.path, this.options.loadOptions);

    if (this.options.graceful) {
      this.once('ready-to-show', () => {
        this.show();
        if (this.isMain && !this.app.utils.isTest())
          this.focus();
      });
    }

    else {
      this.show();
      if (this.isMain && !this.app.utils.isTest())
        this.focus();
    }

    return this;

  }

}