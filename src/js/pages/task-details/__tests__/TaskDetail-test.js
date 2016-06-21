jest.dontMock('../TaskFilesTab');
jest.dontMock('../TaskDetail');
jest.dontMock('../../../stores/MarathonStore');
jest.dontMock('../../../stores/MesosStateStore');
jest.dontMock('../../../mixins/GetSetMixin');

let JestUtil = require('../../../utils/JestUtil');

JestUtil.unMockStores(['MarathonStore', 'MesosStateStore', 'TaskDirectoryStore', 'MesosSummaryStore']);
require('../../../utils/StoreMixinConfig');
/* eslint-disable no-unused-vars */
let React = require('react');
/* eslint-enable no-unused-vars */
let ReactDOM = require('react-dom');
let TestUtils = require('react-addons-test-utils');

let MesosStateStore = require('../../../stores/MesosStateStore');
import Task from '../../../structs/Task';
let TaskDirectory = require('../../../structs/TaskDirectory');
let TaskDirectoryStore = require('../../../stores/TaskDirectoryStore');
let TaskDetail = require('../TaskDetail');

describe('TaskDetail', function () {
  beforeEach(function () {
    this.container = document.createElement('div');
    this.params = {

    };
    this.instance = JestUtil.renderWithStubbedRouter(
      TaskDetail,
      {params: this.params},
      this.container,
      {
        getCurrentRoutes: function () {
          return [{name: 'services-task-details-tab'}];
        }
      }
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
      let directory = new TaskDirectory({items: [{nlink: 1, path: '/stdout'}]});
      // Let directory return something
      TaskDirectoryStore.get = jasmine.createSpy('TaskDirectoryStore#get')
        .and.returnValue(directory);

      this.instance.onTaskDirectoryStoreSuccess();
      expect(this.instance.setState)
        .toHaveBeenCalledWith({directory, taskDirectoryErrorCount: 0});
    });

  });

  describe('#getSubView', function () {
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
      this.instance.getSubView();

      expect(this.instance.getErrorScreen).toHaveBeenCalled();
    });

    it('ignores getErrorScreen when error has not occured', function () {
      this.instance.state = {
        directory: new TaskDirectory({items: [{nlink: 1, path: '/stdout'}]})
      };
      this.instance.getSubView();

      expect(this.instance.getErrorScreen).not.toHaveBeenCalled();
    });

    it('should return null if there are no nodes', function () {
      let node = ReactDOM.findDOMNode(this.instance);
      expect(node).toEqual(null);
    });

    it('should return an element if there is a node', function () {
      MesosStateStore.get = function () {
        return new Task({
          slaves: {fakeProp: 'faked'}
        });
      };

      let instance = JestUtil.renderWithStubbedRouter(
        TaskDetail,
        {params: this.params},
        this.container,
        {
          getCurrentRoutes: function () {
            return [{name: 'services-task-details-tab'}];
          }
        }
      );

      let node = ReactDOM.findDOMNode(instance);
      expect(TestUtils.isDOMComponent(node)).toEqual(true);
    });
  });


  describe('#getBasicInfo', function () {

    it('should return null if task is null', function () {
      MesosStateStore.getTaskFromTaskID = function () { return null; };
      let result = this.instance.getBasicInfo();
      expect(result).toEqual(null);
    });

    it('should return an element if task is not null', function () {
      let task = new Task({
        id: 'fade',
        state: 'TASK_RUNNING'
      });

      let result = this.instance.getBasicInfo();

      expect(TestUtils.isElement(result)).toEqual(true);
    });
  });
});
