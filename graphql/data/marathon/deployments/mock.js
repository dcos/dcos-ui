import clone from 'clone';

import mockResponse from './mock-data/deployments';

export default class MockDeploymentsConnector {
  get() {
    return Promise.resolve(clone(mockResponse));
  }
}
