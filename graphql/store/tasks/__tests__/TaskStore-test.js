jest.unmock('../TaskStore');
jest.unmock('../../../utils/ServiceUtil');

import GroupsData from '../../../data/marathon/groups/group';
import TaskStore from '../TaskStore';
import StateData from '../../../data/mesos/state/state';

function getEndpoints(groupResponse, stateResponse) {
  return {
    marathon: {
      groups: new GroupsData(groupResponse)
    },
    mesos: {
      state: new StateData(stateResponse)
    }
  };
}

describe('fetchTasks()', () => {
  var groupResponse = {
    id: '/',
    apps: [],
    groups: []
  };
  var stateResponse = {
    frameworks: []
  };
  var endpoints = getEndpoints(groupResponse, stateResponse);

  it('returns a promise', () => {
    var store = new TaskStore({ endpoints });
    var r = store.fetchTasks();

    expect(typeof r.then).toEqual('function');
  });

  it('parses endpoint response once resolved', async () => {
    var store = new TaskStore({ endpoints });

    store.parseGroups = jest.fn();
    store.parseState = jest.fn();

    var r = await store.fetchTasks();

    expect(store.parseGroups.mock.calls[0][0]).toEqual(groupResponse);
    expect(store.parseState.mock.calls[0][0]).toEqual(stateResponse);
  });

});

describe('parseGroups()', () => {

  it('respects empty root group', () => {
    var store = new TaskStore({ endpoints: {}});
    var rootGroup = {
      id: '/',
      apps: [],
      groups: []
    };
    store.parseGroups(rootGroup);

    expect([...store.tasksById.values()]).toEqual([]);
  });

  it('parses nested tasks and nests data under "marathon" key', () => {
    var store = new TaskStore({ endpoints: {}});
    var rootGroup = {
      id: '/',
      apps: [
        {
          id: '/sleep',
          tasks: [
            {
              id: 'bar',
              statuses: [
                {
                  healthy: false
                }
              ]
            }
          ]
        }
      ],
      groups: [
        {
          id: '/nested',
          groups: [],
          apps: [
            {
              id: '/nested/foo',
              tasks: [
                {
                  id: 'foo',
                  statuses: [
                    {
                      healthy: true
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
    store.parseGroups(rootGroup);

    expect([...store.tasksById.values()]).toEqual([
      {
        marathon: {
          id: 'bar',
          statuses: [
            {
              healthy: false
            }
          ]
        }
      },
      {
        marathon: {
          id: 'foo',
          statuses: [
            {
              healthy: true
            }
          ]
        }
      }
    ]);
  });

});

describe('parseState()', () => {

  it('respects empty tasks and completed tasks', () => {
    var store = new TaskStore({ endpoints: {}});
    var state = {
      frameworks: [
        {
          tasks: [],
          completed_tasks: []
        }
      ]
    };
    store.parseState(state);

    expect([...store.tasksById.values()]).toEqual([]);
  });

  it('parses framework tasks & completed_tasks, nests data under "mesos" key', () => {
    var store = new TaskStore({ endpoints: {}});
    var state = {
      frameworks: [
        {
          tasks: [
            {
              id: 'foo'
            },
            {
              id: 'bar'
            }
          ],
          completed_tasks: [
            {
              id: 'completed_foo'
            },
            {
              id: 'completed_bar'
            }
          ]
        }
      ]
    };
    store.parseState(state);

    expect([...store.tasksById.values()]).toEqual([
      {
        mesos: {
          id: 'foo'
        }
      },
      {
        mesos: {
          id: 'bar'
        }
      },
      {
        mesos: {
          id: 'completed_foo'
        }
      },
      {
        mesos: {
          id: 'completed_bar'
        }
      }
    ]);
  });

});

describe('mergeTasks()', () => {

  it('merges marathon and mesos tasks', async () => {
    var rootGroup = {
      id: '/',
      apps: [
        {
          id: '/sleep',
          tasks: [
            {
              id: 'bar',
              statuses: [
                {
                  healthy: false
                }
              ]
            }
          ]
        }
      ],
      groups: [
        {
          id: '/nested',
          groups: [],
          apps: [
            {
              id: '/nested/foo',
              tasks: [
                {
                  id: 'foo',
                  statuses: [
                    {
                      healthy: true
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
    var state = {
      frameworks: [
        {
          tasks: [
            {
              id: 'foo',
              state: 'TASK_RUNNING'
            }
          ],
          completed_tasks: [
            {
              id: 'bar',
              state: 'TASK_ERROR'
            }
          ]
        }
      ]
    };
    var endpoints = getEndpoints(rootGroup, state);
    var store = new TaskStore({ endpoints });
    var results = await store.getAll();

    expect(results).toEqual([
      {
        marathon: {
          id: 'foo',
          statuses: [
            {
              healthy: true
            }
          ]
        },
        mesos: {
          id: 'foo',
          state: 'TASK_RUNNING'
        }
      },
      {
        marathon: {
          id: 'bar',
          statuses: [
            {
              healthy: false
            }
          ]
        },
        mesos: {
          id: 'bar',
          state: 'TASK_ERROR'
        }
      }
    ]);
  });

});


describe('getTasksPromise()', () => {
  var groupResponse = {
    id: '/',
    apps: [],
    groups: []
  };
  var state = {
    frameworks: []
  };
  var endpoints = getEndpoints(groupResponse, state);

  it('returns a promise', () => {
    var store = new TaskStore({ endpoints });
    var r = store.getTasksPromise();

    expect(typeof r.then).toEqual('function');
  });

  it('returns same promise if called multiple times', () => {
    var store = new TaskStore({ endpoints });
    var firstPromise = store.getTasksPromise();
    var secondPromise = store.getTasksPromise();

    expect(firstPromise).toEqual(secondPromise);
  });

});

describe('getById()', () => {
  var groupResponse = {
    id: '/',
    apps: [
      {
        id: '/foo',
        tasks: [
          {
            id: 'foo-task',
            foo: 'bar'
          }
        ]
      }
    ],
    groups: []
  };
  var state = {
    frameworks: []
  };
  var endpoints = getEndpoints(groupResponse, state);
  var store = new TaskStore({ endpoints });

  it('returns the correct group', async () => {
    var response = await store.getById('foo-task');

    expect(response).toEqual(
      {
        marathon: {
          id: 'foo-task',
          foo: 'bar'
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
  it('returns all tasks', async () => {
    var rootGroup = {
      id: '/',
      apps: [
        {
          id: '/sleep',
          tasks: [
            {
              id: 'bar',
              statuses: [
                {
                  healthy: false
                }
              ]
            }
          ]
        }
      ],
      groups: [
        {
          id: '/nested',
          groups: [],
          apps: [
            {
              id: '/nested/foo',
              tasks: [
                {
                  id: 'foo',
                  statuses: [
                    {
                      healthy: true
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
    var state = {
      frameworks: [
        {
          tasks: [
            {
              id: 'foo',
              state: 'TASK_RUNNING'
            }
          ],
          completed_tasks: [
            {
              id: 'bar',
              state: 'TASK_ERROR'
            }
          ]
        }
      ]
    };
    var endpoints = getEndpoints(rootGroup, state);
    var store = new TaskStore({ endpoints });
    var results = await store.getAll();

    expect(results).toEqual([
      {
        marathon: {
          id: 'foo',
          statuses: [
            {
              healthy: true
            }
          ]
        },
        mesos: {
          id: 'foo',
          state: 'TASK_RUNNING'
        }
      },
      {
        marathon: {
          id: 'bar',
          statuses: [
            {
              healthy: false
            }
          ]
        },
        mesos: {
          id: 'bar',
          state: 'TASK_ERROR'
        }
      }
    ]);
  });

})
