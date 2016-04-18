jest.dontMock('../ServiceOverlay');
jest.dontMock('../ServicesTable');
jest.dontMock('../../constants/HealthStatus');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../stores/MesosSummaryStore');
jest.dontMock('../../utils/MesosSummaryUtil');
jest.dontMock('../../utils/RequestUtil');
jest.dontMock('../../utils/ResourceTableUtil');
jest.dontMock('../../utils/StringUtil');
jest.dontMock('../../stores/__tests__/fixtures/state.json');
jest.dontMock('../../utils/Util');

var React = require('react');
var ReactDOM = require('react-dom');

var CompositeState = require('../../structs/CompositeState');
var HealthLabels = require('../../constants/HealthLabels');
var MesosSummaryStore = require('../../stores/MesosSummaryStore');
var ServicesTable = require('../ServicesTable');

// That is a single snapshot from
// http://dcos.mesosphere.com/dcos-history-service/history/last
var stateJSON = require('../../stores/__tests__/fixtures/state.json');

CompositeState.addSummary(stateJSON);

function getTable(isAppsProcessed, container) {
  return ReactDOM.render(
    <ServicesTable services={[]}
      healthProcessed={isAppsProcessed} />,
    container
  );
}

describe('ServicesTable', function () {

  describe('#renderHealth', function () {

    beforeEach(function () {
      this.services = CompositeState.getServiceList().getItems();
      this.container = document.createElement('div');
    });

    afterEach(function () {
      MesosSummaryStore.removeAllListeners();
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it('should have loaders on all services', function () {
      var table = getTable(false, this.container);

      this.services.slice(0).forEach(function (row) {
        var healthlabel = ReactDOM.render(
          table.renderHealth(null, row),
          this.container
        );

        var node = ReactDOM.findDOMNode(healthlabel);
        expect(node.classList.contains('loader-small')).toBeTruthy();
      }, this);
    });

    it('should have N/A health status on all services', function () {
      var table = getTable(true, this.container);

      this.services.slice(0).forEach(function (row) {
        var healthlabel = ReactDOM.render(
          table.renderHealth(null, row),
          this.container
        );
        // because we get health from MarathonStore and MarathonStore hasn't
        // been added to CompositeState, health will return as NA
        expect(ReactDOM.findDOMNode(healthlabel).children[0].textContent).toEqual(HealthLabels.NA);
      }, this);
    });

  });

});
