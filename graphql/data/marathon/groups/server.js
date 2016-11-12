import DataLoader from 'dataloader';

import config from '../../../config';
import { fetchWithAuth } from '../../../utils/fetch';

export default class GroupsServerConnector {
  constructor({ authToken }) {
    const query = {
      embed: [
        'group.groups',
        'group.apps',
        'group.pods',
        'group.apps.deployments',
        'group.apps.counts',
        'group.apps.tasks',
        'group.apps.taskStats',
        'group.apps.lastTaskFailure'
      ]
    };

    const getGroup = fetchWithAuth(authToken, {
      baseURI: config.endpoints.marathon.groups,
      query
    });

    this.groupsLoader = new DataLoader(getGroup, { batch: false });
  }

  get(groupId = '/') {
    if (groupId === '/') {
      // Load root /groups endpoint
      groupId = '';
    } else {
      // Load /groups/groupId endpoint
      groupId = `/${encodeURIComponent(groupId)}`;
    }

    return this.groupsLoader.load(groupId);
  }
}
