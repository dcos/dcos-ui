jest.dontMock('../SidePanels');
jest.dontMock('../../mixins/InternalStorageMixin');
jest.dontMock('../../mixins/TabsMixin');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../stores/MesosSummaryStore');
jest.dontMock('../../stores/MarathonStore');
jest.dontMock('../../utils/MesosSummaryUtil');
jest.dontMock('../../events/MesosSummaryActions');
jest.dontMock('../../events/MarathonActions');
jest.dontMock('../NodeSidePanelContents');
jest.dontMock('../ServiceSidePanelContents');
jest.dontMock('../SidePanelContents');
jest.dontMock('../TaskSidePanelContents');
jest.dontMock('../UnitHealthSidePanelContents');
jest.dontMock('../UnitNodeSidePanelContents');
jest.dontMock('../../utils/Util');
jest.dontMock('../../utils/RequestUtil');
jest.dontMock('../../structs/SummaryList');

var React = require('react');
var ReactDOM = require('react-dom');

var MesosSummaryActions = require('../../events/MesosSummaryActions');
var MesosSummaryStore = require('../../stores/MesosSummaryStore');
var NodeSidePanelContents = require('../NodeSidePanelContents');
var ServiceSidePanelContents = require('../ServiceSidePanelContents');
var SidePanels = require('../SidePanels');
var TaskSidePanelContents = require('../TaskSidePanelContents');
var UnitHealthSidePanelContents = require('../UnitHealthSidePanelContents');
var UnitNodeSidePanelContents = require('../UnitNodeSidePanelContents');

describe('SidePanels', function () {
  beforeEach(function () {
    this.fetchSummary = MesosSummaryActions.fetchSummary;
    this.container = document.createElement('div');

    MesosSummaryActions.fetchSummary = function () {
      return null;
    };

    MesosSummaryStore.get = function () {
      return true;
    };

    MesosSummaryStore.init();
  });

  afterEach(function () {
    MesosSummaryActions.fetchSummary = this.fetchSummary;

    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#isOpen', function () {
    beforeEach(function () {
      this.params = {
        nodeID: null,
        serviceName: null,
        taskID: null,
        unitID: null,
        unitNodeID: null
      };
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(
        <SidePanels
          statesProcessed={true}
          params={this.params} />,
        this.container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it('should return false if all IDs are null', function () {
      expect(this.instance.isOpen({})).toEqual(false);
    });

    it('should return true if one value is set', function () {
      var prevServiceName = this.params.serviceName;
      this.params.serviceName = 'serviceName';
      expect(this.instance.isOpen(this.params)).toEqual(true);
      this.params.serviceName = prevServiceName;
    });
  });

  describe('#getContents', function () {
    beforeEach(function () {
      this.params = {
        nodeID: null,
        serviceName: null,
        taskID: null,
        unitID: null,
        unitNodeID: null
      };
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(
        <SidePanels
          statesProcessed={true}
          params={this.params} />,
        this.container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it('should return null if all IDs are null', function () {
      expect(this.instance.getContents(this.params)).toEqual(null);
    });

    it('should return NodeSidePanelContents if nodeID is set', function () {
      this.params.nodeID = 'set';
      var contents = this.instance.getContents(this.params);

      expect(contents.type === NodeSidePanelContents).toEqual(true);
      this.params.nodeID = null;
    });

    it('should return TaskSidePanelContents if taskID is set', function () {
      this.params.taskID = 'set';
      var contents = this.instance.getContents(this.params);

      expect(contents.type === TaskSidePanelContents).toEqual(true);
      this.params.taskID = null;
    });

    it('should return ServiceSidePanelContents if serviceName is set',
      function () {
      this.params.serviceName = 'set';
      var contents = this.instance.getContents(this.params);

      expect(contents.type === ServiceSidePanelContents).toEqual(true);
      this.params.serviceName = null;
    });

    it('should return UnitHealthSidePanelContents if unitID is set',
      function () {
      this.params.unitID = 'set';
      var contents = this.instance.getContents(this.params);

      expect(contents.type === UnitHealthSidePanelContents).toEqual(true);
      this.params.serviceName = null;
    });

    it('should return UnitNodeSidePanelContents if unitID and unitNodeID are set',
      function () {
      this.params.unitID = 'set';
      this.params.unitNodeID = 'set';
      var contents = this.instance.getContents(this.params);

      expect(contents.type === UnitNodeSidePanelContents).toEqual(true);
      this.params.serviceName = null;
    });

  });
});
