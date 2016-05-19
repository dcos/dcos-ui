jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../DCOSStore');
jest.dontMock('../../structs/ServiceTree');

var DCOSStore = require('../DCOSStore');
var ServiceTree = require('../../structs/ServiceTree');

describe('DCOSStore', function () {

  beforeEach(function () {
    DCOSStore.processMesosStateSummary({frameworks: []});
    DCOSStore.processMarathonGroups(new ServiceTree({apps: []}));
  });

  describe('#processMarathonGroups', function () {

    beforeEach(function () {
      DCOSStore.processMesosStateSummary({
        frameworks: [{id: 'alpha-id', name: 'alpha', bar: 'baz'}]
      });
    });

    it('should update the service tree', function () {
      expect(DCOSStore.serviceTree.getItems().length).toEqual(0);

      DCOSStore.processMarathonGroups(new ServiceTree({
        apps: [{
          id: '/alpha',
          labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'alpha'}
        }]
      }));

      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual('/alpha');
    });

    it('should replace old Marathon data', function () {
      DCOSStore.processMarathonGroups(new ServiceTree({
        apps: [{
          id: '/alpha',
          labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'alpha'}
        }]
      }));
      DCOSStore.processMarathonGroups(new ServiceTree({
        apps: [{
          id: '/beta',
          labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'}
        }]
      }));

      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual('/beta');
    });

    it('should merge (matching by id) summary data', function () {
      DCOSStore.processMarathonGroups(new ServiceTree({
        apps: [{
          id: '/alpha', labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'alpha'}
        }]
      }));

      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual('/alpha');
      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toEqual('baz');
    });

    it('should not merge summary data if it doesn\'t find a matching id',
      function () {
        DCOSStore.processMarathonGroups(new ServiceTree({
          apps: [{
            id: '/beta', labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'}
          }]
        }));

        expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toBeUndefined();
      }
    );

  });

  describe('#processMarathonServiceVersion', function () {
    const versionID = '2016-03-22T10:46:07.354Z';

    beforeEach(function () {
      DCOSStore.processMarathonGroups(new ServiceTree({
        apps: [{
          id: '/alpha'
        }]
      }));
      DCOSStore.processMarathonServiceVersions({
        serviceID: '/alpha',
        versions: new Map([[versionID]])
      });
    });

    it('should update the service tree', function () {
      expect(DCOSStore.serviceTree.getItems()[0].getVersions())
        .toEqual(new Map([[versionID]]));

      DCOSStore.processMarathonServiceVersion({
        serviceID: '/alpha',
        versionID,
        version: {foo: 'bar'}
      });

      expect(DCOSStore.serviceTree.getItems()[0].getVersions())
        .toEqual(new Map([[versionID, {foo: 'bar'}]]));
    });

  });

  describe('#processMarathonServiceVersions', function () {
    const firstVersionID = '2016-03-22T10:46:07.354Z';
    const secondVersionID = '2016-04-22T10:46:07.354Z';

    beforeEach(function () {
      DCOSStore.processMarathonGroups(new ServiceTree({
        apps: [{
          id: '/beta'
        }]
      }));
    });

    it('should update the service tree', function () {
      expect(DCOSStore.serviceTree.getItems()[0].getVersions())
        .toEqual(new Map());

      DCOSStore.processMarathonServiceVersions({
        serviceID: '/beta',
        versions: new Map([[firstVersionID]])
      });

      expect(DCOSStore.serviceTree.getItems()[0].getVersions())
        .toEqual(new Map([[firstVersionID]]));
    });

    it('should merge existing version data', function () {
      DCOSStore.processMarathonServiceVersion({
        serviceID: '/beta',
        versionID: firstVersionID,
        version: {foo: 'bar'}
      });

      DCOSStore.processMarathonServiceVersions({
        serviceID: '/beta',
        versions: new Map([[firstVersionID], [secondVersionID]])
      });

      expect(DCOSStore.serviceTree.getItems()[0].getVersions())
        .toEqual(new Map([[firstVersionID, {foo: 'bar'}], [secondVersionID]]));
    });

  });

  describe('#processMesosStateSummary', function () {

    beforeEach(function () {
      DCOSStore.processMarathonGroups(new ServiceTree({
        apps: [{
          id: '/alpha',
          labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'alpha'}
        }]
      }));
    });

    it('should update the service tree', function () {
      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toBeUndefined();

      DCOSStore.processMesosStateSummary({
        frameworks: [{id: 'alpha-id', name: 'alpha', bar: 'baz'}]
      });

      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toEqual('baz');
    });

    it('should replace old summary data', function () {
      DCOSStore.processMesosStateSummary({
        frameworks: [{id: 'alpha-id', name: 'alpha', bar: 'baz'}]
      });

      DCOSStore.processMesosStateSummary({
        frameworks: [{id: 'alpha-id', name: 'alpha', bar: 'qux'}]
      });

      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toEqual('qux');
    });

    it('should merge (matching by id) Marathon data', function () {
      DCOSStore.processMesosStateSummary({
        frameworks: [{id: 'alpha-id', name: 'alpha', bar: 'baz'}]
      });

      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual('/alpha');
      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toEqual('baz');
    });

    it('should not merge Marathon data if it doesn\'t find a matching id',
      function () {
        DCOSStore.processMesosStateSummary({
          frameworks: [{id: 'beta-id', name: 'beta', foo: 'bar'}]
        });

        expect(DCOSStore.serviceTree.getItems()[0].get('foo')).toBeUndefined();
      }
    );

  });

});
