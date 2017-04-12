jest.unmock('../AgentStore');

import AgentStore from '../AgentStore';
import StateData from '../../../data/mesos/state/state';

function getEndpoints(stateResponse) {
  return {
    mesos: {
      state: new StateData(stateResponse)
    }
  };
}

describe('fetchAgents()', () => {
  var stateResponse = {
    slaves: []
  };
  var endpoints = getEndpoints(stateResponse);

  it('returns a promise', () => {
    var store = new AgentStore({ endpoints });
    var r = store.fetchAgents();

    expect(typeof r.then).toEqual('function');
  });

  it('parses endpoint response once resolved', async () => {
    var store = new AgentStore({ endpoints });
    store.parseState = jest.fn();

    var r = await store.fetchAgents();

    expect(store.parseState.mock.calls[0][0]).toEqual(stateResponse);
  });

});

describe('parseState()', () => {

  it('respects empty slaves', () => {
    var store = new AgentStore({ endpoints: {}});
    var state = {
      slaves: []
    };
    store.parseState(state);

    expect([...store.agentsById.values()]).toEqual([]);
  });

  it('parses slaves by id', () => {
    var store = new AgentStore({ endpoints: {}});
    var state = {
      slaves: [
        {
          id: '123',
        },
        {
          id: '246'
        }
      ]
    };
    store.parseState(state);

    expect([...store.agentsById.values()]).toEqual([
      {
        id: '123'
      },
      {
        id: '246'
      }
    ]);
  });

});

describe('getStatePromise()', () => {
  var state = {
    slaves: []
  };
  var endpoints = getEndpoints(state);

  it('returns a promise', () => {
    var store = new AgentStore({ endpoints });
    var r = store.getStatePromise();

    expect(typeof r.then).toEqual('function');
  });

  it('returns same promise if called multiple times', () => {
    var store = new AgentStore({ endpoints });
    var firstPromise = store.getStatePromise();
    var secondPromise = store.getStatePromise();

    expect(firstPromise).toEqual(secondPromise);
  });

});

describe('getById()', () => {
  var state = {
    slaves: [
      {
        id: '123',
      },
      {
        id: '246'
      }
    ]
  };
  var endpoints = getEndpoints(state);
  var store = new AgentStore({ endpoints });

  it('returns the correct agent', async () => {
    var response = await store.getById('246');

    expect(response).toEqual(
      {
        id: '246'
      }
    )
  });

  it('returns null when content does not exist', async () => {
    var response = await store.getById('111');

    expect(response).toEqual(null);
  });

});

describe('getAll()', () => {
  it('returns all Agents', async () => {
    var state = {
      slaves: [
      {
        id: '123',
      },
      {
        id: '246'
      }
    ]
    };
    var endpoints = getEndpoints(state);
    var store = new AgentStore({ endpoints });
    var agents = await store.getAll();

    expect(agents).toEqual([
      {
        id: '123'
      },
      {
        id: '246'
      }
    ]);
  });

})
