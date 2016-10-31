import client from './client';
import mock from './mock';

const cluster = process.env.npm_config_cluster;
const environment = process.env.GRAPHQL_ENV;

const configuration = {
  mockEndpoints: false,
  runInClient: false,
  endpoints: {
    marathon: {
      groups: `${cluster}/marathon/v2/groups`
    },
    mesos: {
      state: `${cluster}/mesos/master/state`
    }
  }
};

if (environment === 'client') {
  Object.assign(configuration, client);
}

if (environment === 'test' || environment === 'mock') {
  Object.assign(configuration, mock);
}

if (!configuration.mockEndpoints && !configuration.runInClient && !cluster) {
  throw new Error('Must configure a cluster.');
}

export default configuration;
