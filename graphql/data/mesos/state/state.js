import { mockEndpoints, runInClient } from '../../../Config';

let path = './server';

if (mockEndpoints) {
  path = './mock';
}

if (runInClient) {
  path = './client';
}

module.exports = require(path);
