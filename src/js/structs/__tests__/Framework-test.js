let HealthStatus = require('../../constants/HealthStatus');
let Framework = require('../Framework');

describe('Framework', function () {

  describe('#getHealth', function () {

    it('returns NA health status', function () {
      let framework = new Framework();
      expect(framework.getHealth()).toEqual(HealthStatus.NA);
    });

    it('returns correct health status', function () {
      let service = new Framework({
        _meta: {marathon: {health: HealthStatus.HEALTHY}}
      });
      expect(service.getHealth()).toEqual(HealthStatus.HEALTHY);
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

  describe('#getNodeIDs', function () {

    it('returns ids of nodes the service is running on', function () {
      let framework = new Framework({slave_ids: [1, 2, 3]});
      expect(framework.getNodeIDs()).toEqual([1, 2, 3]);
    });

  });

  describe('#getUsageStats', function () {

    it('returns an object containing the value for the resource', function () {
      let framework = new Framework({used_resources: {cpus: 1, mem: 512}});
      expect(framework.getUsageStats('cpus').value).toEqual(1);
      expect(framework.getUsageStats('mem').value).toEqual(512);
    });

  });

});
