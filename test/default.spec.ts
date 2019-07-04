import * as mocha from 'mocha';
import * as chai from 'chai';
import { Application } from 'spectron';
// import 'chai-http';

const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;
// const request = chai.request;

describe('Sparc', () => {

  before(function () {
    let path = `${__dirname}/../node_modules/.bin/electron`;
    if (process.platform === 'win32')
      path += '.cmd';
    this.app = new Application({
      path,
      args: ['./test/main.js']
    });
    return this.app.start();
  });

  it('Shows main view', function () {
    return this.app
      .client
      .getWindowCount()
      .then(count => {
        assert.equal(count, 1);
      });
  });

  after(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

});
