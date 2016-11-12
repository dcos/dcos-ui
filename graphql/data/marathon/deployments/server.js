import DataLoader from 'dataloader';

import config from '../../../config';
import { fetchWithAuth } from '../../../utils/fetch';

export default class DeploymentsServerConnector {
  constructor({ authToken }) {

    const getDeployments = fetchWithAuth(authToken, {
      baseURI: config.endpoints.deployments
    });

    this.deploymentsLoader = new DataLoader(getDeployments, { batch: false });
  }

  get() {
    return this.deploymentsLoader.load('');
  }
}
