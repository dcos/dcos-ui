import DataLoader from 'dataloader';

import config from '../../../config';
import { fetchWithAuth } from '../../../utils/fetch';

export default class StateServerConnector {
  constructor({ authToken }) {

    const getState = fetchWithAuth(authToken, {
      baseURI: config.endpoints.mesos.state
    });

    this.stateLoader = new DataLoader(getState, { batch: false });
  }

  get() {
    return this.stateLoader.load('');
  }
}
