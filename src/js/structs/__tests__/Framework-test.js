let Framework = require('../Framework');

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

  describe('#getWebURL', function () {

    it('returns the url if the webui_url key is present', function () {
      let service = new Framework({webui_url: 'foo', id: 'bar'});
      expect(service.getWebURL()).toEqual('foo');
    });

    it('returns the url if ID is present but webui_url is not', function () {
      let service = new Framework({id: 'foo'});
      expect(service.getWebURL()).toEqual('/service/foo');
    });

    it('returns null if the id and webui_url keys are not present', function () {
      let service = new Framework({foo: 'bar'});
      expect(service.getWebURL()).toEqual(null);
    });

    it('returns null if the id is an empty string', function () {
      let service = new Framework({id: ''});
      expect(service.getWebURL()).toEqual(null);
    });

  });

});
