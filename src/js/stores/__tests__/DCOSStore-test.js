jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../DCOSStore');
jest.dontMock('../../structs/ServiceTree');

var DCOSStore = require('../DCOSStore');
var ServiceTree = require('../../structs/ServiceTree');

describe('DCOSStore', function () {

  beforeEach(function () {
    DCOSStore.processMesosData({frameworks: []});
    DCOSStore.processMarathonData(new ServiceTree({apps: []}));
  });

  describe('#processMarathonData', function () {

    beforeEach(function () {
      DCOSStore.processMesosData({
        frameworks: [{id: 'alpha-id', name: 'alpha', bar: 'baz'}]
      });
    });

    it('should update the service tree', function () {
      expect(DCOSStore.serviceTree.getItems().length).toEqual(0);

      DCOSStore.processMarathonData(new ServiceTree({
        apps: [{
          id: '/alpha',
          labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'alpha'}
        }]
      }));

      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual('/alpha');
    });

    it('should replace old Marathon data', function () {
      DCOSStore.processMarathonData(new ServiceTree({
        apps: [{
          id: '/alpha',
          labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'alpha'}
        }]
      }));
      DCOSStore.processMarathonData(new ServiceTree({
        apps: [{
          id: '/beta',
          labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'}
        }]
      }));

      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual('/beta');
    });

    it('should merge (matching by id) summary data', function () {
      DCOSStore.processMarathonData(new ServiceTree({
        apps: [{
          id: '/alpha', labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'alpha'}
        }]
      }));

      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual('/alpha');
      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toEqual('baz');
    });

    it('should not merge summary data if it doesn\'t find a matching id',
      function () {
        DCOSStore.processMarathonData(new ServiceTree({
          apps: [{
            id: '/beta', labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'}
          }]
        }));

        expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toBeUndefined();
      }
    );

  });

  describe('#processMesosData', function () {

    beforeEach(function () {
      DCOSStore.processMarathonData(new ServiceTree({
        apps: [{
          id: '/alpha',
          labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'alpha'}
        }]
      }));
    });

    it('should update the service tree', function () {
      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toBeUndefined();

      DCOSStore.processMesosData({
        frameworks: [{id: 'alpha-id', name: 'alpha', bar: 'baz'}]
      });

      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toEqual('baz');
    });

    it('should replace old summary data', function () {
      DCOSStore.processMesosData({
        frameworks: [{id: 'alpha-id', name: 'alpha', bar: 'baz'}]
      });

      DCOSStore.processMesosData({
        frameworks: [{id: 'alpha-id', name: 'alpha', bar: 'qux'}]
      });

      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toEqual('qux');
    });

    it('should merge (matching by id) Marathon data', function () {
      DCOSStore.processMesosData({
        frameworks: [{id: 'alpha-id', name: 'alpha', bar: 'baz'}]
      });

      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual('/alpha');
      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toEqual('baz');
    });

    it('should not merge Marathon data if it doesn\'t find a matching id',
      function () {
        DCOSStore.processMesosData({
          frameworks: [{id: 'beta-id', name: 'beta', foo: 'bar'}]
        });

        expect(DCOSStore.serviceTree.getItems()[0].get('foo')).toBeUndefined();
      }
    );

  });

});
