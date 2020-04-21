import * as mocha from 'mocha';
import * as chai from 'chai';
import { Application } from 'spectron';
import { doesNotReject } from 'assert';
// import 'chai-http';

const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;
// const request = chai.request;

let app: Application;

describe('Sparc', () => {

  before(function () {
    let path = `${__dirname}/../node_modules/.bin/electron`;
    if (process.platform === 'win32')
      path += '.cmd';
    this.app = new Application({
      path,
      args: ['./test/main.js']
    });
    return this.app.start()
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  });

  it('Shows main view', function () {
    return this.app.client
      .getWindowCount()
      .then(count => {
        assert.equal(count, 1);
      })
      .catch(err => {
        console.log(err);
      });
  });

  after(function (done) {
    if (this.app && this.app.isRunning()) {
      this.app.stop()
        .then(done)
        .catch(err => {
          done();
        });
    }
    else {
      done();
    }
  });

});
