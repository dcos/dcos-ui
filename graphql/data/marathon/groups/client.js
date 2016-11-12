import mockResponse from './mock-data/groups';

/**
 * Currently using a mock response.
 *
 * This will connect to our MarathonActions file to trigger requests
 * and listen to action responses via the AppDispatcher.
 */

export default class ClientGroupsConnector {
  get() {
    return Promise.resolve(mockResponse);
  }
}
