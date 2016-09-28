jest.dontMock('foundation-ui');
jest.dontMock('../DashboardPage');
jest.dontMock('../../../../foundation-ui/src/js/stores/DCOSStore');
jest.dontMock('../../stores/UnitHealthStore');
jest.dontMock('./fixtures/MockMarathonResponse.json');
jest.dontMock('../../mixins/InternalStorageMixin');
jest.dontMock('../../utils/Util');

const JestUtil = require('../../utils/JestUtil');

JestUtil.unMockStores(['MesosSummaryStore']);
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');

const DashboardPage = require('../DashboardPage');
const DCOSStore = require('foundation-ui').DCOSStore;
const DeploymentsList = require('../../../../plugins/services/src/js/structs/DeploymentsList');
const MarathonStore = require('../../../../plugins/services/src/js/stores/MarathonStore');
const MesosSummaryStore = require('../../stores/MesosSummaryStore');
const MockMarathonResponse = require('./fixtures/MockMarathonResponse.json');
const ServiceTree = require('../../../../plugins/services/src/js/structs/ServiceTree');
const SummaryList = require('../../structs/SummaryList');

MesosSummaryStore.get = function (key) {
  if (key === 'states') {
    let list = new SummaryList();
    list.addSnapshot({frameworks: []}, Date.now());
    return list;
  }
};

describe('DashboardPage', function () {

  describe('#getServicesList', function () {

    beforeEach(function () {
      this.MarathonGet = MarathonStore.get;
      this.MarathonAddChangeListener = MarathonStore.addChangeListener;
      MarathonStore.addChangeListener = function () {};
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(
        <DashboardPage servicesListLength={5} params={{serviceName: ''}} />,
        this.container
      );
    });

    afterEach(function () {
      MarathonStore.get = this.MarathonGet;
      MarathonStore.addChangeListener = this.MarathonAddChangeListener;
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it('gets list of services', function () {
      MarathonStore.get = function (key) {
        if (key === 'deployments') {
          return new DeploymentsList({items: []});
        }

        return new ServiceTree({items: [
          {id: 'foo', health: {key: 'bar'}}
        ]});
      };
      DCOSStore.onMarathonGroupsChange();
      let list = this.instance.getServicesList();
      expect(list.length).toEqual(1);
      expect(list[0].getId()).toEqual('foo');
    });

    it('handles services with missing health', function () {
      MarathonStore.get = function (key) {
        if (key === 'deployments') {
          return new DeploymentsList({items: []});
        }

        return new ServiceTree({items: [{id: 'foo'}]});
      };
      DCOSStore.onMarathonGroupsChange();

      let list = this.instance.getServicesList();
      expect(list[0].getId()).toEqual('foo');
    });

    it('should not return more services than servicesListLength', function () {
      MarathonStore.get = function (key) {
        if (key === 'deployments') {
          return new DeploymentsList({items: []});
        }

        return new ServiceTree({items: [
          {id: 'foo', health: {key: 'bar'}},
          {id: 'foo', health: {key: 'bar'}},
          {id: 'foo', health: {key: 'bar'}},
          {id: 'foo', health: {key: 'bar'}},
          {id: 'foo', health: {key: 'bar'}},
          {id: 'foo', health: {key: 'bar'}}
        ]});
      };
      DCOSStore.onMarathonGroupsChange();
      let list = this.instance.getServicesList();
      expect(list.length).toEqual(5);
    });

    it('should sort by health', function () {
      MarathonStore.processMarathonGroups(MockMarathonResponse);
      DCOSStore.onMarathonGroupsChange();
      let list = this.instance.getServicesList();

      expect(list[0].getId()).toEqual('UnhealthyFramework');
      expect(list[1].getId()).toEqual('HealthyFramework');
      expect(list[2].getId()).toEqual('IdleFramework');
      expect(list[3].getId()).toEqual('NAFramework');
    });

  });

});
