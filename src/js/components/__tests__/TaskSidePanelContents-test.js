jest.dontMock('../SidePanelContents');
jest.dontMock('../TaskSidePanelContents');
jest.dontMock('../TaskDirectoryView');
jest.dontMock('../../stores/MesosStateStore');
jest.dontMock('../../mixins/GetSetMixin');

var JestUtil = require('../../utils/JestUtil');

JestUtil.unMockStores(['MesosStateStore', 'TaskDirectoryStore', 'MesosSummaryStore']);
require('../../utils/StoreMixinConfig');

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var MesosStateStore = require('../../stores/MesosStateStore');
var TaskDirectory = require('../../structs/TaskDirectory');
var TaskDirectoryStore = require('../../stores/TaskDirectoryStore');
var TaskSidePanelContents = require('../TaskSidePanelContents');

describe('TaskSidePanelContents', function () {
  beforeEach(function () {
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <TaskSidePanelContents open={false} />,
      this.container
    );
    this.instance.setState = jasmine.createSpy('setState');
    this.instance.getErrorScreen = jasmine.createSpy('getErrorScreen');
    // Store original versions
    this.storeGetDirectory = TaskDirectoryStore.getDirectory;
    this.storeGet = MesosStateStore.get;
    this.storeChangeListener = MesosStateStore.addChangeListener;

    // Create mock functions
    MesosStateStore.get = function (key) {
      if (key === 'lastMesosState') {
        return {};
      }
    };

    MesosStateStore.addChangeListener = function () {};
    MesosStateStore.getTaskFromTaskID = function () {
      return {
        id: 'fake id',
        state: 'TASK_RUNNING'
      };
    };

    TaskDirectoryStore.getDirectory = jasmine.createSpy('getDirectory');
  });

  afterEach(function () {
    // Restore original functions
    MesosStateStore.get = this.storeGet;
    MesosStateStore.addChangeListener = this.storeChangeListener;
    TaskDirectoryStore.getDirectory = this.storeGetDirectory;

    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#componentDidMount', function () {

    it('should call getDirectory after onStateStoreSuccess is called', function () {
      this.instance.onStateStoreSuccess();
      expect(TaskDirectoryStore.getDirectory).toHaveBeenCalled();
    });

  });

  describe('#onTaskDirectoryStoreError', function () {

    it('should setState', function () {
      this.instance.onTaskDirectoryStoreError();
      expect(this.instance.setState).toHaveBeenCalled();
    });

    it('should setState increment taskDirectoryErrorCount', function () {
      this.instance.state = {taskDirectoryErrorCount: 1};
      this.instance.onTaskDirectoryStoreError();
      expect(this.instance.setState)
        .toHaveBeenCalledWith({taskDirectoryErrorCount: 2});
    });

  });

  describe('#onTaskDirectoryStoreSuccess', function () {

    it('should setState', function () {
      this.instance.onTaskDirectoryStoreSuccess();
      expect(this.instance.setState).toHaveBeenCalled();
    });

    it('should setState increment onTaskDirectoryStoreSuccess', function () {
      var directory = new TaskDirectory({items: [{nlink: 1, path: '/stdout'}]});
      // Let directory return something
      TaskDirectoryStore.get = jasmine.createSpy('TaskDirectoryStore#get')
        .andReturn(directory);

      this.instance.onTaskDirectoryStoreSuccess();
      expect(this.instance.setState)
        .toHaveBeenCalledWith({directory, taskDirectoryErrorCount: 0});
    });

  });

  describe('#render', function () {
    beforeEach(function () {
      this.getNodeFromID = MesosStateStore.getNodeFromID;
      MesosStateStore.getNodeFromID = function () {
        return {hostname: 'hello'};
      };
      this.container = document.createElement('div');
    });

    afterEach(function () {
      MesosStateStore.getNodeFromID = this.getNodeFromID;

      ReactDOM.unmountComponentAtNode(this.container);
    });

    it('should call getErrorScreen when error occured', function () {
      this.instance.state = {
        directory: new TaskDirectory({items: [{nlink: 1, path: '/stdout'}]}),
        taskDirectoryErrorCount: 3
      };
      this.instance.renderFilesTabView();

      expect(this.instance.getErrorScreen).toHaveBeenCalled();
    });

    it('ignores getErrorScreen when error has not occured', function () {
      this.instance.state = {
        directory: new TaskDirectory({items: [{nlink: 1, path: '/stdout'}]})
      };
      this.instance.renderFilesTabView();

      expect(this.instance.getErrorScreen).not.toHaveBeenCalled();
    });

    it('should return null if there are no nodes', function () {
      var instance = ReactDOM.render(
        <TaskSidePanelContents open={true} />,
        this.container
      );
      var node = ReactDOM.findDOMNode(instance);
      expect(node).toEqual(null);
    });

    it('should return an element if there is a node', function () {
      MesosStateStore.get = function () {
        return {
          slaves: {fakeProp: 'faked'}
        };
      };

      var instance = ReactDOM.render(
        <TaskSidePanelContents open={true} />,
        this.container
      );

      var node = ReactDOM.findDOMNode(instance);
      expect(TestUtils.isDOMComponent(node)).toEqual(true);
    });
  });

  describe('#getBasicInfo', function () {

    it('should return null if task is null', function () {
      var result = this.instance.getBasicInfo(null);
      expect(result).toEqual(null);
    });

    it('should return an element if task is not null', function () {
      var result = this.instance.getBasicInfo({
        id: 'fade',
        state: 'TASK_RUNNING'
      }, {hostname: 'hello'});

      expect(TestUtils.isElement(result)).toEqual(true);
    });
  });
});
