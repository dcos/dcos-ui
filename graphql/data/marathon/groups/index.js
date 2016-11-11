import config from '../../../config';

let path = './server';

if (config.mockEndpoints) {
  path = './mock';
}

if (config.runInClient) {
  path = './client';
}

module.exports = require(path);
