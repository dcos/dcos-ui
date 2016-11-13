jest.unmock('../FrameworkStore');

import FrameworkStore from '../FrameworkStore';
import StateData from '../../../data/mesos/state/state';

function getEndpoints(stateResponse) {
  return {
    mesos: {
      state: new StateData(stateResponse)
    }
  };
}

describe('fetchFrameworks()', () => {
  var stateResponse = {
    frameworks: []
  };
  var endpoints = getEndpoints(stateResponse);

  it('returns a promise', () => {
    var store = new FrameworkStore({ endpoints });
    var r = store.fetchFrameworks();

    expect(typeof r.then).toEqual('function');
  });

  it('parses endpoint response once resolved', async () => {
    var store = new FrameworkStore({ endpoints });
    store.parseState = jest.fn();

    var r = await store.fetchFrameworks();

    expect(store.parseState.mock.calls[0][0]).toEqual(stateResponse);
  });

});

describe('parseState()', () => {

  it('respects empty frameworks', () => {
    var store = new FrameworkStore({ endpoints: {}});
    var state = {
      frameworks: []
    };
    store.parseState(state);

    expect([...store.frameworksByName.values()]).toEqual([]);
  });

  it('parses frameworks by name', () => {
    var store = new FrameworkStore({ endpoints: {}});
    var state = {
      frameworks: [
        {
          name: 'kafka',
        },
        {
          name: 'marathon'
        }
      ]
    };
    store.parseState(state);

    expect([...store.frameworksByName.values()]).toEqual([
      {
        name: 'kafka'
      },
      {
        name: 'marathon'
      }
    ]);
  });

});

describe('getStatePromise()', () => {
  var state = {
    frameworks: []
  };
  var endpoints = getEndpoints(state);

  it('returns a promise', () => {
    var store = new FrameworkStore({ endpoints });
    var r = store.getStatePromise();

    expect(typeof r.then).toEqual('function');
  });

  it('returns same promise if called multiple times', () => {
    var store = new FrameworkStore({ endpoints });
    var firstPromise = store.getStatePromise();
    var secondPromise = store.getStatePromise();

    expect(firstPromise).toEqual(secondPromise);
  });

});

describe('getAllByName()', () => {
  it('returns all frameworks as a Map by name', async () => {
    var state = {
      frameworks: [
        {
          name: 'kafka',
        },
        {
          name: 'marathon'
        }
      ]
    };
    var endpoints = getEndpoints(state);
    var store = new FrameworkStore({ endpoints });
    var frameworks = await store.getAllByName();

    expect(typeof frameworks).toEqual('object');
    expect(typeof frameworks.has).toEqual('function');
    expect(frameworks.get('kafka')).toEqual({
      name: 'kafka'
    });
    expect(frameworks.get('marathon')).toEqual({
      name: 'marathon'
    })
  });

})
