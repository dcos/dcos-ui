var UniversePackage = require('../UniversePackage');
var UniverseInstalledPackagesList = require('../UniverseInstalledPackagesList');

describe('UniverseInstalledPackagesList', function () {

  describe('#constructor', function () {

    it('creates instances of UniversePackage', function () {
      var items = [{appId: 'baz', packageInformation: {foo: 'bar'}}];
      var list = new UniverseInstalledPackagesList({items});
      items = list.getItems();
      expect(items[0] instanceof UniversePackage).toBeTruthy();
    });

    it('should store appId in UniversePackage', function () {
      var items = [{appId: 'baz', packageInformation: {foo: 'bar'}}];
      var list = new UniverseInstalledPackagesList({items});
      items = list.getItems();
      expect(items[0].get('appId')).toEqual('baz');
    });

    it('should store packageInformation in UniversePackage', function () {
      var items = [{appId: 'baz', packageInformation: {foo: 'bar'}}];
      var list = new UniverseInstalledPackagesList({items});
      items = list.getItems();
      expect(items[0].get('foo')).toEqual('bar');
    });

  });

  describe('#filterItems', function () {

    it('should filter by name', function () {
      var items = [
        {packageInformation: {appId: 'baz', packageDefinition: {name: 'foo'}}},
        {packageInformation: {appId: 'baz', packageDefinition: {name: 'bar'}}}
      ];
      var list = new UniverseInstalledPackagesList({items});
      items = list.filterItems('bar').getItems();
      expect(items.length).toEqual(1);
      expect(items[0].get('packageDefinition').name).toEqual('bar');
    });

    it('should filter by description', function () {
      var items = [
        {
          packageInformation: {
            appId: 'baz',
            packageDefinition: {description: 'foo'}
          }
        },
        {
          packageInformation: {
            appId: 'baz',
            packageDefinition: {description: 'bar'}
          }
        }
      ];
      var list = new UniverseInstalledPackagesList({items});
      items = list.filterItems('foo').getItems();
      expect(items.length).toEqual(1);
      expect(items[0].get('packageDefinition').description).toEqual('foo');
    });

    it('should filter by tags', function () {
      var items = [
        {
          packageInformation: {
            appId: 'baz',
            packageDefinition: {tags: ['foo', 'bar']}
          }
        },
        {
          packageInformation: {
            appId: 'baz',
            packageDefinition: {tags: ['foo']}
          }
        },
        {packageInformation: {appId: 'baz', packageDefinition: {tags: []}}}
      ];
      var list = new UniverseInstalledPackagesList({items});
      items = list.filterItems('foo').getItems();
      expect(items.length).toEqual(2);
      expect(items[0].get('packageDefinition').tags).toEqual(['foo', 'bar']);
      expect(items[1].get('packageDefinition').tags).toEqual(['foo']);
    });

    it('should handle filter by tags with null elements', function () {
      var items = [
        {
          packageInformation: {
            appId: 'baz',
            packageDefinition: {tags: ['foo', 'bar']}
          }
        },
        {
          packageInformation: {
            appId: 'baz',
            packageDefinition: {tags: ['foo']}
          }
        },
        {packageInformation: {appId: 'baz', packageDefinition: {tags: null}}}
      ];
      var list = new UniverseInstalledPackagesList({items});
      expect(list.filterItems.bind(list, 'foo')).not.toThrow();
    });

  });

});
