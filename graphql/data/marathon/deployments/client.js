import mockResponse from './mock-data/deployments';

/**
 * Currently using a mock response.
 *
 * This will connect to our MarathonActions file to trigger requests
 * and listen to action responses via the AppDispatcher.
 */

export default class ClientDeploymentsConnector {
  get() {
    return Promise.resolve(mockResponse);
  }
}
