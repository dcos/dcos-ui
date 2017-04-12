jest.unmock('../GroupModels');
jest.unmock('../../../utils/ServiceUtil');

import Groups from '../GroupModels';
import createStore from '../../../store';
import MockEndpointsConnector from '../../../data/EndpointsConnector';

describe('Groups', () => {
  var mockData = {
    marathon: {
      groups: {
        id: '/',
        apps: [],
        groups: [{
          id: '/test',
          apps: [{
            id: '/test/app'
          }],
          groups: [{
            id: '/test/group',
            apps: [],
            groups: []
          }]
        }]
      }
    }
  };
  var endpoints = MockEndpointsConnector(mockData);
  var store = createStore(endpoints);
  var groups = new Groups({ store });

  describe('getById()', () => {

    it('returns null if group not found', async () => {
      var group = await groups.getById('/fail');

      expect(group).toBeNull();
    });

    it('returns correct group', async () => {
      var group = await groups.getById('/test');

      expect(group.id).toEqual('/test');
    });

  });

  describe('getContents()', () => {

    it('returns all contents within group', async () => {
      var contents = await groups.getContents('/test');

      expect(contents.map((c) => c.id)).toEqual([
        '/test/app',
        '/test/group'
      ]);
    });

    it('respects empty contents', async () => {
      var contents = await groups.getContents('/test/group');

      expect(contents.map((c) => c.id)).toEqual([]);
    });

  });

});
