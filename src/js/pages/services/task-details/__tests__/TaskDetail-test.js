jest.dontMock('../SidePanelContents');
jest.dontMock('../TaskDirectoryView');
jest.dontMock('../TaskDetail');
jest.dontMock('../../stores/MesosStateStore');
jest.dontMock('../../mixins/GetSetMixin');

var JestUtil = require('../../utils/JestUtil');

JestUtil.unMockStores(['MesosStateStore', 'TaskDirectoryStore', 'MesosSummaryStore']);
require('../../utils/StoreMixinConfig');
/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var MesosStateStore = require('../../stores/MesosStateStore');
import Task from '../../structs/Task';
var TaskDirectory = require('../../structs/TaskDirectory');
var TaskDirectoryStore = require('../../stores/TaskDirectoryStore');
var TaskDetail = require('../TaskDetail');

describe('TaskDetail', function () {
  beforeEach(function () {
    this.container = document.createElement('div');
    this.params = {

    };
    this.instance = ReactDOM.render(
      <TaskDetail params={this.params} />,
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
      return new Task({
        id: 'fake id',
        state: 'TASK_RUNNING'
      });
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
        .and.returnValue(directory);

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
        <TaskDetail params={this.params} />,
        this.container
      );
      var node = ReactDOM.findDOMNode(instance);
      expect(node).toEqual(null);
    });

    it('should return an element if there is a node', function () {
      MesosStateStore.get = function () {
        return new Task({
          slaves: {fakeProp: 'faked'}
        });
      };

      var instance = ReactDOM.render(
        <TaskDetail params={this.params} />,
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
      let task = new Task({
        id: 'fade',
        state: 'TASK_RUNNING'
      });

      var result = this.instance.getBasicInfo(task);

      expect(TestUtils.isElement(result)).toEqual(true);
    });
  });
});
