jest.unmock('../FrameworkModels');

import Frameworks from '../FrameworkModels';
import createStore from '../../../store';
import MockEndpointsConnector from '../../../data/EndpointsConnector';

describe('Frameworks', () => {

  describe('getAllByName()', () => {

    it('returns a Map of all frameworks', async () => {
      var mockData = {
        mesos: {
          state: {
            frameworks: [
              {
                id: '1',
                name: 'foo'
              },
              {
                id: '2',
                name: 'bar'
              },
              {
                id: '3',
                name: 'foo-bar'
              }
            ]
          }
        }
      };
      var endpoints = MockEndpointsConnector(mockData);
      var store = createStore(endpoints);
      var frameworks = new Frameworks({ store });
      var frameworksByName = await frameworks.getAllByName();

      expect(typeof frameworksByName.has).toEqual('function');
      expect(frameworksByName.get('foo')).toEqual({
        id: '1',
        name: 'foo'
      });
      expect(frameworksByName.get('bar')).toEqual({
        id: '2',
        name: 'bar'
      });
      expect(frameworksByName.get('foo-bar')).toEqual({
        id: '3',
        name: 'foo-bar'
      });
    });

    it('respects empty array of frameworks from mesos', async () => {
      var mockData = {
        mesos: {
          state: {
            frameworks: []
          }
        }
      };
      var endpoints = MockEndpointsConnector(mockData);
      var store = createStore(endpoints);
      var frameworks = new Frameworks({ store });
      var frameworksByName = await frameworks.getAllByName();

      expect(frameworksByName.size).toEqual(0);
    });

  });

});
