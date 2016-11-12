import mockResponse from './mock-data/state';

/**
 * Currently using a mock response.
 *
 * This will connect to our MesosStateActions file to trigger requests
 * and listen to action responses via the AppDispatcher.
 */

export default class ClientStateConnector {
  get() {
    return Promise.resolve(mockResponse);
  }
}
