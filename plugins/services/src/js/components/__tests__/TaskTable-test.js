jest.dontMock('../../../../../../src/js/components/CollapsingString');
jest.dontMock('./fixtures/MockTasks.json');
jest.dontMock('../../constants/TaskStates');
jest.dontMock('../../../../../../src/js/stores/MesosStateStore');
jest.dontMock('../TaskTable');
jest.dontMock('moment');

/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');
const JestUtil = require('../../../../../../src/js/utils/JestUtil');

const DCOSStore = require('foundation-ui').DCOSStore;
const MesosStateStore = require('../../../../../../src/js/stores/MesosStateStore');
const TaskTable = require('../TaskTable');
const Tasks = require('./fixtures/MockTasks.json').tasks;

describe('TaskTable', function () {
  beforeEach(function () {
    DCOSStore.serviceTree = {
      getTaskFromTaskID: jest.fn()
    };
    this.parentRouter = {
      getCurrentRoutes() {
        return [{name: 'home'}, {name: 'dashboard'}, {name: 'service-detail'}];
      },
      getCurrentParams() {
        return [{nodeID: 'thing'}];
      }
    };

    this.container = document.createElement('div');

    this.instance = ReactDOM.render(
      JestUtil.stubRouterContext(
        TaskTable, {
          tasks: Tasks,
          parentRouter: this.parentRouter
        }
      ),
      this.container
    );

  });

  describe('#getDisabledItemsMap', function () {
    beforeEach(function () {
      this.taskTable = new TaskTable();
    });

    it('treats tasks started not by Marathon as disabled', function () {
      var tasks = [
        {id: '1', state: 'TASK_STARTING', isStartedByMarathon: true},
        {id: '2', state: 'TASK_STARTING'}
      ];
      expect(this.taskTable.getDisabledItemsMap(tasks)).toEqual({'2': true});
    });

    it('it treats completed tasks as disabled', function () {
      var tasks = [
        {id: '1', state: 'TASK_STARTING', isStartedByMarathon: true},
        {id: '2', state: 'TASK_FINISHED', isStartedByMarathon: true}
      ];
      expect(this.taskTable.getDisabledItemsMap(tasks)).toEqual({'2': true});
    });

  });

  describe('#getTaskHealth', function () {

    beforeEach(function () {
      this.taskTable = new TaskTable();
    });

    it('interrogates the task status', function () {
      spyOn(DCOSStore.serviceTree, 'getTaskFromTaskID');
      var health = this.taskTable.getTaskHealth({
        statuses: [{healthy: true}]
      });
      expect(health).toEqual(true);
      expect(DCOSStore.serviceTree.getTaskFromTaskID).not.toHaveBeenCalled();
    });

    it('falls back on the DCOSStore.serviceTree task\'s health checks', function () {
      DCOSStore.serviceTree.getTaskFromTaskID.mockReturnValueOnce({
        healthCheckResults: [{alive: true}]
      });
      var health = this.taskTable.getTaskHealth({statuses: []});
      expect(health).toEqual(true);
    });

    it('returns null if neither status nor Marathon have task health data', function () {
      DCOSStore.serviceTree.getTaskFromTaskID.mockReturnValueOnce({
        healthCheckResults: []
      });
      var health = this.taskTable.getTaskHealth({statuses: []});
      expect(health).toBeNull();
    });
  });

  describe('#getTaskHealthFromMesos', function () {

    beforeEach(function () {
      this.taskTable = new TaskTable();
    });

    it('returns true if at least one status is healthy', function () {
      var health = this.taskTable.getTaskHealthFromMesos({
        statuses: [{healthy: true}, {healthy: false}]
      });
      expect(health).toEqual(true);
    });

    it('returns null if no statuses have health data', function () {
      var health = this.taskTable.getTaskHealthFromMesos({
        statuses: [{}, {}, {}]
      });
      expect(health).toBeNull();
    });

    it('returns null if no statuses are present', function () {
      var health = this.taskTable.getTaskHealthFromMesos({
        statuses: []
      });
      expect(health).toBeNull();
    });

    it('returns false if all statuses are unhealthy', function () {
      var health = this.taskTable.getTaskHealthFromMesos({
        statuses: [{healthy: false}, {healthy: false}]
      });
      expect(health).toEqual(false);
    });

  });

  describe('#getTaskHealthFromMarathon', function () {

    beforeEach(function () {
      this.taskTable = new TaskTable();
    });

    it('returns true if all health checks pass', function () {
      DCOSStore.serviceTree.getTaskFromTaskID.mockReturnValueOnce({
        healthCheckResults: [{alive: true}, {alive: true}]
      });
      var health = this.taskTable.getTaskHealthFromMarathon({id:'foo'});
      expect(health).toEqual(true);
    });

    it('returns false if one health check fails', function () {
      DCOSStore.serviceTree.getTaskFromTaskID.mockReturnValueOnce({
        healthCheckResults: [{alive: true}, {alive: false}, {alive: true}]
      });
      var health = this.taskTable.getTaskHealthFromMarathon({id:'foo'});
      expect(health).toEqual(false);
    });

    it('returns null if no health checks are present', function () {
      var health = this.taskTable.getTaskHealthFromMarathon({id:'foo'});
      expect(health).toBeNull();
    });

  });

  describe('#getStatusValue', function () {

    beforeEach(function () {
      this.taskTable = new TaskTable();
    });

    it('returns \'Healthy\' if task is healthy', function () {
      var value = this.taskTable.getStatusValue({statuses: [{healthy:true}]});
      expect(value).toEqual('Healthy');
    });

    it('returns \'Unhealthy\' if task is unhealthy', function () {
      var value = this.taskTable.getStatusValue({statuses: [{healthy:false}]});
      expect(value).toEqual('Unhealthy');
    });

    it('falls back to TaskStates if task has no health data', function () {
      var value = this.taskTable.getStatusValue({state: 'TASK_KILLING'});
      expect(value).toEqual('Killing');
    });

  });

  afterEach(function () {
    MesosStateStore.getNodeFromID = this.getNodeFromID;

    ReactDOM.unmountComponentAtNode(this.container);
  });

});
