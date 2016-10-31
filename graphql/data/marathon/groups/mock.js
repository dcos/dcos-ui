import mockResponse from './mock-data/groups';

export default class MockGroupsConnector {
  get() {
    return Promise.resolve(mockResponse);
  }
}
