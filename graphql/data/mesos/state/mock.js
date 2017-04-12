import clone from 'clone';

import mockResponse from './mock-data/state';

export default class MockStateConnector {
  get() {
    return Promise.resolve(clone(mockResponse));
  }
}
