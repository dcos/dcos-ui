const Framework = require('../Framework');

describe('Framework', function () {

  describe('#getNodeIDs', function () {

    it('returns ids of nodes the service is running on', function () {
      let framework = new Framework({slave_ids: [1, 2, 3]});
      expect(framework.getNodeIDs()).toEqual([1, 2, 3]);
    });

  });

  describe('#getResourceID', function () {

    it('returns the correct resource id when there is no name', function () {
      let framework = new Framework();
      expect(framework.getResourceID()).toEqual('dcos:adminrouter:service:');
    });

    it('returns the correct resource id when there is a name', function () {
      let framework = new Framework({name: 'foo'});
      expect(framework.getResourceID()).toEqual('dcos:adminrouter:service:foo');
    });

    it('returns the correct resource id when name is complex', function () {
      let framework = new Framework({name: 'foo-adsf-2'});
      expect(framework.getResourceID())
        .toEqual('dcos:adminrouter:service:foo-adsf-2');
    });

  });

  describe('#getUsageStats', function () {

    it('returns an object containing the value for the resource', function () {
      let framework = new Framework({used_resources: {cpus: 1, mem: 512}});
      expect(framework.getUsageStats('cpus').value).toEqual(1);
      expect(framework.getUsageStats('mem').value).toEqual(512);
    });

  });

  describe('#getName', function () {

    it('returns correct name', function () {
      let service = new Framework({
        id: '/test/framework',
        labels: {
          DCOS_PACKAGE_FRAMEWORK_NAME: 'Framework'
        }
      });

      expect(service.getName()).toEqual('Framework');
    });

    it('returns basename if framework name is undefined', function () {
      let service = new Framework({
        id: '/test/framework'
      });

      expect(service.getName()).toEqual('framework');
    });

  });

  describe('#getTasksSummary', function () {

    it('returns correct task summary', function () {
      let service = new Framework({
        instances: 2,
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0
      });

      expect(service.getTasksSummary()).toEqual({
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0,
        tasksUnknown: 0,
        tasksOverCapacity: 0
      });
    });

    it('returns correct task summary for overcapcity', function () {
      let service = new Framework({
        instances: 2,
        tasksStaged: 0,
        tasksRunning: 4,
        tasksHealthy: 2,
        tasksUnhealthy: 0
      });

      expect(service.getTasksSummary()).toEqual({
        tasksStaged: 0,
        tasksRunning: 4,
        tasksHealthy: 2,
        tasksUnhealthy: 0,
        tasksUnknown: 2,
        tasksOverCapacity: 2
      });
    });

    it('returns correct task summary with framework data', function () {
      let service = new Framework({
        instances: 2,
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0,
        TASK_RUNNING: 1
      });

      expect(service.getTasksSummary()).toEqual({
        tasksStaged: 0,
        tasksRunning: 2,
        tasksHealthy: 1,
        tasksUnhealthy: 0,
        tasksUnknown: 1,
        tasksOverCapacity: 0
      });
    });

  });

  describe('#getInstancesCount', function () {

    it('returns correct instances', function () {
      let service = new Framework({
        instances: 1
      });

      expect(service.getInstancesCount()).toEqual(1);
    });

    it('returns correct instances with Framework data', function () {
      let service = new Framework({
        instances: 1,
        TASK_RUNNING: 1
      });

      expect(service.getInstancesCount()).toEqual(2);
    });

  });

});
