# Sparc

Bootstrap Electron with static views or socket connection to remote source such as Create React App.

**NOTE** This is a work in progress but works as expected. API will change, check back for new features and bug fixes.

## Quick Start

```sh
$ npm install sparc
```

### Configure

```ts
import Sparc from 'sparc';
import { join } from 'path';

// OR for ES5
// const Sparc = require('../dist').Sparc;
// const { join } = require('path');

const app = Sparc({
 // your options here (see below)
});

// Defines the view defers loading 
// until ready is called.
app.defineView('main');

// Handle app quit by platform and
// activate gracefully then call ready.
app
  .handleQuit()
  .handleActivate()
  .ready();
```

## Sparc Options 

```ts
interface IAppOptions {
  mainView?: string;                  // name of the main view/window defaults to "main".
  viewsDir?: string;                  // directory where views are stored.
  viewsExt?: string;                  // views extension.
  confirmExit?: ConfirmExitConfig;    // if not undefined shows confirm on exit.        
  allowDevTools?: boolean;            // when true allow dev tools to open (default: true when isDev)
  preserveState?: boolean;            // when true view state/settings preserved w, h & position.
  autoInit?: boolean;                 // when true auto inits views, menus & stores. (default: true)
  width?: number;                     // default app width. (default: 800)
  height?: number;                    // default app height.  (default: 600)
}
```

**ConfirmExitConfig** - when true will display "Are you sure you want to quit?" If a string is provided that value will be displayed. Otherwise if an Electron showMessageBox options object is provided it will
be used.

## Create React App Example

In order to use Electron with Create React App there are several steps that need to be taken. Although not difficult, there are several. You can take a look at the working Create React App [example](example/cra) if you get stuck but here are the steps:

### Install Dependencies

We need a few dependencies. Concurrently will be used so we can run both Create React App and Knectron in parallel. Knectron will be used to connect to the CRA dev server. Customize-cra and react-app-rewired will allow us to modify the Webpack config without ejecting our app.

```sh
npm install concurrently knectron customize-cra react-app-rewired -s
```

### Configure Scripts

Now that we have react-app-rewired installed we need to change the start/build scripts that ship with Create React App.

For our **start** script we add an environment variable <code>Browser=none</code> to let CRA know not to launch the browser as it will not be needed. 

For windows users you will need to prefix the env variable as <code>set Browser=none</code>.

Change this:

```json
"start": "react-scripts start",
"build": "react-scripts build",
"test": "react-scripts test",
"eject": "react-scripts eject"
```

To this: (where "./app" is path to your Electron app)

```json
"start": "BROWSER=none concurrently \"react-app-rewired start\" \"knectron ./app\" --kill-others",
"build": "react-app-rewired build",
"test": "react-app-rewired test",
"eject": "react-app-rewired eject",
```

### Configure Overrides

Create a file in the root of your CRA project called <code>config-overrides.js</code>. Place the following in this file:

This ensures that Webpack has the correct target, in this case the **electron-renderer**.

```js
const {
  override,
} = require('customize-cra');

const isBrowser = process.env.BROWSER !== 'none';

const plugin = () => config => {
  if (!isBrowser)
    config.target = 'electron-renderer';
  return config;
}

module.exports = override(
  plugin()
);
```

### Configure Sparc Main View

We need to tell our main window/view to use the Create React App url that React is listening on. Knectron does this by providing an environment variable or you can just manually set it. We also need to ensure that **nodeIntegration** is set to true.

```js
app.defineView('main', { 
  path: process.env.APP_URL // provided by Knectron or set manually,
  webPreferences: {
    nodeIntegration: true   // you will get require errors if not enabled.
  }
});
```

## Using Knectron API

To use **Sparc** with a remote source you can use [Knectron](https://github.com/blujedis/knectron).

### Install

```sh
$ npm install knectron
```

Knectron will provide the **APP_URL** for you in an environment variable <code>process.env.APP_URL</code> to make connecting easy. Define your app as show above but for your main view specify this url in options:

```ts
const app = Sparc();

app.defineView('main', { path: process.env.APP_URL });

app
  .handleQuit()
  .handleActivate()
  .ready();
```

### API

Create a file called <code>connect.js</code> or whatever you wish. This is where we'll configure Knectron.

```ts
const knectron = require('knectron');
knectron({
  host: '127.0.0.1'                       // (default: 127.0.0.1)
  port: 3000,                             // (default: 3000)
  args: ['./path/to/electron/main.js']    // all args passed to Electron
});
```

That's it, not much to it! No let's change our main view in our Electron app to point to the correct url that we want **Knectron** to connect to.

### Run Server & App Using Knectron

Configure the following in **package.json** under the **scripts** section. Be sure you have installed <code>$ npm install concurrently</code>.

```json
{
  "scripts": {
    "dev": "concurrently \"node ./path/to/sever.js\" \"node ./path/to/connect.js\"" 
  }
}
```

To run the above simple run the following from your terminal:

```sh
$ npm run dev
```