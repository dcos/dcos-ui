jest.unmock('../GroupStore');
jest.unmock('../../../utils/ServiceUtil');

import GroupsData from '../../../data/marathon/groups/group';
import GroupStore from '../GroupStore';

function getEndpoints(groupResponse) {
  return {
    marathon: {
      groups: new GroupsData(groupResponse)
    }
  };
}

describe('fetchGroups()', () => {
  var groupResponse = {
    id: '/',
    apps: [],
    groups: []
  };
  var endpoints = getEndpoints(groupResponse);

  it('returns a promise', () => {
    var store = new GroupStore({ endpoints });
    var r = store.fetchGroups();

    expect(typeof r.then).toEqual('function');
  });

  it('parses endpoint response once resolved', async () => {
    var store = new GroupStore({ endpoints });

    store.parseGroups = jest.fn();

    var r = await store.fetchGroups();

    expect(store.parseGroups.mock.calls[0][0]).toEqual(groupResponse);
  });

});

describe('parseGroups()', () => {

  it('respects empty root group', () => {
    var store = new GroupStore({ endpoints: {}});
    var rootGroup = {
      id: '/',
      apps: [],
      groups: []
    };
    store.parseGroups(rootGroup);

    expect([...store.contentsById.values()]).toEqual([rootGroup]);
  });

  it('attaches parentId, resources, taskStatus', () => {
    var store = new GroupStore({ endpoints: {}});
    var rootGroup = {
      id: '/',
      apps: [],
      groups: []
    };
    store.parseGroups(rootGroup);

    expect([...store.contentsById.values()]).toEqual([
      {
        id: '/',
        parentId: null,
        resources: {
          cpus: 0,
          mem: 0,
          disk: 0
        },
        taskStatus: {
          healthy: 0,
          running: 0,
          staged: 0,
          unhealthy: 0,
          unknown: 0,
          overCapacity: 0
        }
      }
    ]);
  });

  it('attaches correct __graphQLType__', () => {
    var store = new GroupStore({ endpoints: {}});
    var rootGroup = {
      id: '/',
      apps: [],
      groups: []
    };
    store.parseGroups(rootGroup);
    var [result] = [...store.contentsById.values()];

    expect(result.__graphQLType__).toEqual('Group');
  });

  it('accumulates values from nested groups and apps', () => {
    var store = new GroupStore({ endpoints: {}});
    var rootGroup = {
      id: '/',
      apps: [],
      groups: [
        {
          id: '/nested',
          groups: [],
          apps: [
            {
              id: '/nested/foo',
              mem: 1,
              cpus: 1,
              disk: 1,
              instances: 2,
              tasksHealthy: 2,
              tasksStaged: 2,
              tasksRunning: 2,
              tasksUnhealthy: 2
            }
          ]
        }
      ]
    };
    store.parseGroups(rootGroup);

    expect([...store.contentsById.values()]).toEqual([
      {
        id: '/',
        parentId: null,
        resources: {
          cpus: 1,
          mem: 1,
          disk: 1
        },
        taskStatus: {
          healthy: 2,
          running: 2,
          staged: 2,
          unhealthy: 2,
          unknown: 0,
          overCapacity: 4
        }
      },
      {
        id: '/nested',
        parentId: '/',
        resources: {
          cpus: 1,
          mem: 1,
          disk: 1
        },
        taskStatus: {
          healthy: 2,
          running: 2,
          staged: 2,
          unhealthy: 2,
          unknown: 0,
          overCapacity: 4
        }
      },
      {
        id: '/nested/foo',
        mem: 1,
        cpus: 1,
        disk: 1,
        instances: 2,
        tasksHealthy: 2,
        tasksStaged: 2,
        tasksRunning: 2,
        tasksUnhealthy: 2,
        parentId: '/nested',
        resources: {
          cpus: 1,
          mem: 1,
          disk: 1
        },
        taskStatus: {
          healthy: 2,
          running: 2,
          staged: 2,
          unhealthy: 2,
          unknown: 0,
          overCapacity: 4
        }
      }
    ]);
  });

});

describe('parseApplications()', () => {

  it('attaches correct __graphQLType__ and returns nested applications after parent group',
    () => {
      var store = new GroupStore({ endpoints: {}});
      var rootGroup = {
        id: '/',
        apps: [
          {
            id: '/foo',
            mem: 1,
            cpus: 1,
            disk: 1,
            instances: 2,
            tasksHealthy: 2,
            tasksStaged: 2,
            tasksRunning: 2,
            tasksUnhealthy: 2
          }
        ],
        groups: []
      };
      store.parseGroups(rootGroup);
      // Groups should be returned before their nested applications
      var [group, application] = [...store.contentsById.values()];

      expect(group.__graphQLType__).toEqual('Group');
      expect(application.__graphQLType__).toEqual('Application');
    });

});

describe('getGroupsPromise()', () => {
  var groupResponse = {
    id: '/',
    apps: [],
    groups: []
  };
  var endpoints = getEndpoints(groupResponse);

  it('returns a promise', () => {
    var store = new GroupStore({ endpoints });
    var r = store.getGroupsPromise();

    expect(typeof r.then).toEqual('function');
  });

  it('returns same promise if called multiple times', () => {
    var store = new GroupStore({ endpoints });
    var firstPromise = store.getGroupsPromise();
    var secondPromise = store.getGroupsPromise();

    expect(firstPromise).toEqual(secondPromise);
  });

});

describe('getById()', () => {
  var groupResponse = {
    id: '/',
    apps: [
      {
        id: '/foo',
        mem: 1,
        cpus: 1,
        disk: 1,
        instances: 2,
        tasksHealthy: 2,
        tasksStaged: 2,
        tasksRunning: 2,
        tasksUnhealthy: 2
      }
    ],
    groups: []
  };
  var endpoints = getEndpoints(groupResponse);
  var store = new GroupStore({ endpoints });

  it('returns the correct group', async () => {
    var response = await store.getById('/foo');

    expect(response).toEqual(
      {
        id: '/foo',
        mem: 1,
        cpus: 1,
        disk: 1,
        instances: 2,
        tasksHealthy: 2,
        tasksStaged: 2,
        tasksRunning: 2,
        tasksUnhealthy: 2,
        parentId: '/',
        resources: {
          cpus: 1,
          mem: 1,
          disk: 1
        },
        taskStatus: {
          healthy: 2,
          running: 2,
          staged: 2,
          unhealthy: 2,
          unknown: 0,
          overCapacity: 4
        }
      }
    )
  });

  it('returns null when content does not exist', async () => {
    var response = await store.getById('/bar');

    expect(response).toEqual(null);
  });

});

describe('getAll()', () => {
  it('returns all applications and groups', async () => {
    var rootGroup = {
      id: '/',
      apps: [],
      groups: [
        {
          id: '/nested',
          groups: [],
          apps: [
            {
              id: '/nested/foo',
              mem: 1,
              cpus: 1,
              disk: 1,
              instances: 2,
              tasksHealthy: 2,
              tasksStaged: 2,
              tasksRunning: 2,
              tasksUnhealthy: 2
            }
          ]
        }
      ]
    };
    var endpoints = getEndpoints(rootGroup);
    var store = new GroupStore({ endpoints });
    var allContent = await store.getAll();

    expect(allContent).toEqual([
      {
        id: '/',
        parentId: null,
        resources: {
          cpus: 1,
          mem: 1,
          disk: 1
        },
        taskStatus: {
          healthy: 2,
          running: 2,
          staged: 2,
          unhealthy: 2,
          unknown: 0,
          overCapacity: 4
        }
      },
      {
        id: '/nested',
        parentId: '/',
        resources: {
          cpus: 1,
          mem: 1,
          disk: 1
        },
        taskStatus: {
          healthy: 2,
          running: 2,
          staged: 2,
          unhealthy: 2,
          unknown: 0,
          overCapacity: 4
        }
      },
      {
        id: '/nested/foo',
        mem: 1,
        cpus: 1,
        disk: 1,
        instances: 2,
        tasksHealthy: 2,
        tasksStaged: 2,
        tasksRunning: 2,
        tasksUnhealthy: 2,
        parentId: '/nested',
        resources: {
          cpus: 1,
          mem: 1,
          disk: 1
        },
        taskStatus: {
          healthy: 2,
          running: 2,
          staged: 2,
          unhealthy: 2,
          unknown: 0,
          overCapacity: 4
        }
      }
    ]);
  });

})
