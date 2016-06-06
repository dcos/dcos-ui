jest.mock('../MarathonStore');
jest.mock('../MesosSummaryStore');
jest.dontMock('../DCOSStore');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../structs/ServiceTree');
jest.dontMock('../../structs/SummaryList');
jest.dontMock('../../structs/StateSummary');

var DCOSStore = require('../DCOSStore');
var MarathonStore = require('../MarathonStore');
var MesosSummaryStore = require('../MesosSummaryStore');
var ServiceTree = require('../../structs/ServiceTree');
var SummaryList = require('../../structs/SummaryList');
var StateSummary = require('../../structs/StateSummary');

describe('DCOSStore', function () {

  beforeEach(function () {
    // Mock Marathon and  Mesos  data and handle data change
    MarathonStore.__setKeyResponse('groups', new ServiceTree({apps: []}));
    MesosSummaryStore.__setKeyResponse('states', new SummaryList({
      items: [new StateSummary({
        successful: true
      })]
    }));

    DCOSStore.onMarathonGroupsChange();
    DCOSStore.onMesosSummaryChange();
  });

  describe('#onMarathonGroupsChange', function () {

    beforeEach(function () {
      MesosSummaryStore.__setKeyResponse('states', new SummaryList({
        items: [new StateSummary({
          snapshot: {
            frameworks: [{
              id: 'alpha-id',
              name: 'alpha',
              bar: 'baz'
            }]
          },
          successful: true
        })]
      }));
      DCOSStore.onMesosSummaryChange();
    });

    it('should update the service tree', function () {
      expect(DCOSStore.serviceTree.getItems().length).toEqual(0);

      MarathonStore.__setKeyResponse('groups', new ServiceTree({
        items: [{
          id: '/alpha',
          labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'alpha'}
        }]
      }));
      DCOSStore.onMarathonGroupsChange();

      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual('/alpha');
    });

    it('should replace old Marathon data', function () {
      MarathonStore.__setKeyResponse('groups', new ServiceTree({
        items: [{
          id: '/alpha',
          labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'alpha'}
        }]
      }));
      DCOSStore.onMarathonGroupsChange();
      MarathonStore.__setKeyResponse('groups', new ServiceTree({
        items: [{
          id: '/beta',
          labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'}
        }]
      }));
      DCOSStore.onMarathonGroupsChange();
      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual('/beta');
    });

    it('should merge (matching by id) summary data', function () {
      MarathonStore.__setKeyResponse('groups', new ServiceTree({
        items: [{
          id: '/alpha', labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'alpha'}
        }]
      }));
      DCOSStore.onMarathonGroupsChange();

      expect(DCOSStore.serviceTree.getItems()[0].getId()).toEqual('/alpha');
      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toEqual('baz');
    });

    it('should not merge summary data if it doesn\'t find a matching id',
      function () {
        MarathonStore.__setKeyResponse('groups', new ServiceTree({
          items: [{
            id: '/beta', labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'beta'}
          }]
        }));
        DCOSStore.onMarathonGroupsChange();

        expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toBeUndefined();
      }
    );

  });

  describe('#processMarathonServiceVersion', function () {
    const versionID = '2016-03-22T10:46:07.354Z';

    beforeEach(function () {
      MarathonStore.__setKeyResponse('groups', new ServiceTree({
        items: [{
          id: '/alpha'
        }]
      }));
      DCOSStore.onMarathonGroupsChange();
      DCOSStore.onMarathonServiceVersionsChange({
        serviceID: '/alpha',
        versions: new Map([[versionID]])
      });
    });

    it('should update the service tree', function () {
      expect(DCOSStore.serviceTree.getItems()[0].getVersions())
        .toEqual(new Map([[versionID]]));

      DCOSStore.onMarathonServiceVersionChange({
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
      MarathonStore.__setKeyResponse('groups', new ServiceTree({
        items: [{
          id: '/beta'
        }]
      }));
      DCOSStore.onMarathonGroupsChange();
    });

    it('should update the service tree', function () {
      expect(DCOSStore.serviceTree.getItems()[0].getVersions())
        .toEqual(new Map());

      DCOSStore.onMarathonServiceVersionsChange({
        serviceID: '/beta',
        versions: new Map([[firstVersionID]])
      });

      expect(DCOSStore.serviceTree.getItems()[0].getVersions())
        .toEqual(new Map([[firstVersionID]]));
    });

    it('should merge existing version data', function () {
      DCOSStore.onMarathonServiceVersionChange({
        serviceID: '/beta',
        versionID: firstVersionID,
        version: {foo: 'bar'}
      });

      DCOSStore.onMarathonServiceVersionsChange({
        serviceID: '/beta',
        versions: new Map([[firstVersionID], [secondVersionID]])
      });

      expect(DCOSStore.serviceTree.getItems()[0].getVersions())
        .toEqual(new Map([[firstVersionID, {foo: 'bar'}], [secondVersionID]]));
    });

  });

  describe('#onMesosSummaryChange', function () {

    beforeEach(function () {
      MarathonStore.__setKeyResponse('groups', new ServiceTree({
        items: [{
          id: '/alpha',
          labels: {DCOS_PACKAGE_FRAMEWORK_NAME: 'alpha'}
        }]
      }));
      DCOSStore.onMarathonGroupsChange();
    });

    it('should update the service tree', function () {
      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toBeUndefined();

      MesosSummaryStore.__setKeyResponse('states', new SummaryList({
        items: [new StateSummary({
          snapshot: {
            frameworks: [{id: 'alpha-id', name: 'alpha', bar: 'baz'}]
          },
          successful: true
        })]
      }));
      DCOSStore.onMesosSummaryChange();

      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toEqual('baz');
    });

    it('should replace old summary data', function () {
      MesosSummaryStore.__setKeyResponse('states', new SummaryList({
        items: [new StateSummary({
          snapshot: {
            frameworks: [{id: 'alpha-id', name: 'alpha', bar: 'baz'}]
          },
          successful: true
        })]
      }));
      DCOSStore.onMesosSummaryChange();

      MesosSummaryStore.__setKeyResponse('states', new SummaryList({
        items: [new StateSummary({
          snapshot: {
            frameworks: [{id: 'alpha-id', name: 'alpha', bar: 'qux'}]
          },
          successful: true
        })]
      }));
      DCOSStore.onMesosSummaryChange();

      expect(DCOSStore.serviceTree.getItems()[0].get('bar')).toEqual('qux');
    });

    it('should not merge Marathon data if it doesn\'t find a matching id',
      function () {
        MesosSummaryStore.__setKeyResponse('states', new SummaryList({
          items: [new StateSummary({
            snapshot: {
              frameworks: [{id: 'beta-id', name: 'beta', foo: 'bar'}]
            },
            successful: true
          })]
        }));
        DCOSStore.onMesosSummaryChange();

        expect(DCOSStore.serviceTree.getItems()[0].get('foo')).toBeUndefined();
      }
    );

  });

  describe('#get storeID', function () {
    it('should return \'dcos\'', function () {
      expect(DCOSStore.storeID).toEqual('dcos');
    });
  });

});
