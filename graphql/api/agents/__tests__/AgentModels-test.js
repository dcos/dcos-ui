jest.unmock('../AgentModels');

import Agents from '../AgentModels';
import createStore from '../../../store';
import MockEndpointsConnector from '../../../data/EndpointsConnector';

describe('Agents', () => {
  var mockData = {
    mesos: {
      state: {
        slaves: [
          {
            id: '1',
            hostname: 'foo'
          },
          {
            id: '2',
            hostname: 'bar'
          },
          {
            id: '3',
            hostname: 'foo-bar'
          }
        ]
      }
    }
  };
  var endpoints = MockEndpointsConnector(mockData);
  var store = createStore(endpoints);
  var agents = new Agents({ store });

  describe('getById()', () => {

    it('returns null if agent not found', async () => {
      var agent = await agents.getById('4');

      expect(agent).toBeNull();
    });

    it('returns correct agent', async () => {
      var agent = await agents.getById('2');

      expect(agent).toEqual({
        id: '2',
        hostname: 'bar'
      });
    });

  });

  describe('getAll()', () => {

    it('returns all agents', async () => {
      var agent = await agents.getAll();

      expect(agent).toEqual([
        {
          id: '1',
          hostname: 'foo'
        },
        {
          id: '2',
          hostname: 'bar'
        },
        {
          id: '3',
          hostname: 'foo-bar'
        }
      ]);
    });

    it('respects empty array of slaves from mesos', async () => {
      var mockData = {
        mesos: {
          state: {
            slaves: []
          }
        }
      };
      var endpoints = MockEndpointsConnector(mockData);
      var store = createStore(endpoints);
      var agents = new Agents({ store });
      var agent = await agents.getAll();

      expect(agent).toEqual([]);
    });

  });

});
