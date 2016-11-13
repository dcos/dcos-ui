jest.unmock('../TaskModels');
jest.unmock('../../../utils/ServiceUtil');

import Tasks from '../TaskModels';
import createStore from '../../../store';
import MockEndpointsConnector from '../../../data/EndpointsConnector';

describe('Tasks', () => {
  var mockData = {
    marathon: {
      groups: {
        id: '/',
        apps: [],
        groups: [{
          id: '/test',
          groups: [],
          apps: [
            {
              id: '/test/app',
              tasks: [
                {
                  id: 'foo'
                },
                {
                  id: 'bar'
                }
              ],
              labels: {
                DCOS_PACKAGE_FRAMEWORK_NAME: 'test/app'
              }
            }
          ],
        }]
      }
    },
    mesos: {
      state: {
        frameworks: [
          {
            id: 'test-framework',
            name: 'test/app',
            completed_tasks: [
              {
                id: 'bar',
                name: 'app.test',
                slave_id: '2',
                framework_id: 'test-framework'
              }
            ],
            tasks: [
              {
                id: 'foo',
                name: 'app.test',
                slave_id: '1',
                framework_id: 'test-framework'
              },
              {
                id: 'broker',
                name: 'broker-0',
                slave_id: '1',
                framework_id: 'test-framework'
              }
            ]
          }
        ]
      }
    }
  };
  var endpoints = MockEndpointsConnector(mockData);
  var store = createStore(endpoints);
  var tasks = new Tasks({ store });

  describe('getById()', () => {

    it('returns null if task not found', async () => {
      var task = await tasks.getById('/fail');

      expect(task).toBeNull();
    });

    it('returns correct task', async () => {
      var task = await tasks.getById('foo');

      expect(task.mesos.id).toEqual('foo');
      expect(task.marathon.id).toEqual('foo');
    });

  });

  describe('getByAgentId()', () => {

    it('returns all tasks for Agent', async () => {
      var agentTasks = await tasks.getByAgentId('1');

      expect(agentTasks.map((t) => t.mesos.id)).toEqual([
        'foo',
        'broker'
      ]);
    });

    it('respects empty tasks', async () => {
      var agentTasks = await tasks.getByAgentId('3');

      expect(agentTasks.map((c) => c.id)).toEqual([]);
    });

  });

  describe('getByServiceId()', () => {

    it('returns all tasks for Service', async () => {
      var serviceTasks = await tasks.getByServiceId('/test/app');

      expect(serviceTasks.map((t) => t.mesos.id)).toEqual([
        'foo',
        'broker',
        'bar'
      ]);
    });

    it('respects empty tasks', async () => {
      var serviceTasks = await tasks.getByServiceId('/test');

      expect(serviceTasks.map((c) => c.id)).toEqual([]);
    });

  });

});
