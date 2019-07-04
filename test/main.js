const Sparc = require('../dist')
  .Sparc;
const { join } = require('path');

const app = Sparc({
  viewsDir: join(__dirname, 'views')
});

app.test(); // used ONLY in testing.

app.defineView('main', { defer: false });

app
  .handleQuit()
  .handleActivate()
  .ready();

