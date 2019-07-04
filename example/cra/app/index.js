const Sparc = require('sparc')
  .Sparc;

const app = Sparc();

app.defineView('main', {
  path: process.env.APP_URL,
  webPreferences: {
    nodeIntegration: true
  }
});

app
  .handleQuit()
  .handleActivate()
  .ready();
