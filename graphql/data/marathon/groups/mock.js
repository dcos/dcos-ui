import clone from 'clone';

import mockResponse from './mock-data/groups';

export default class MockGroupsConnector {
  get() {
    return Promise.resolve(clone(mockResponse));
  }
}
