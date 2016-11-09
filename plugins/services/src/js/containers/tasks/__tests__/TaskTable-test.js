jest.dontMock('../../../../../../../src/js/components/CollapsingString');
jest.dontMock('./fixtures/MockTasks.json');
jest.dontMock('../../../constants/TaskStates');
jest.dontMock('../../../../../../../src/js/stores/MesosStateStore');
jest.dontMock('../TaskTable');
jest.dontMock('moment');

/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');
const JestUtil = require('../../../../../../../src/js/utils/JestUtil');

const DCOSStore = require('foundation-ui').DCOSStore;
const MesosStateStore = require('../../../../../../../src/js/stores/MesosStateStore');
const TaskTable = require('../TaskTable');
const Tasks = require('./fixtures/MockTasks.json').tasks;

describe('TaskTable', function () {
  beforeEach(function () {
    DCOSStore.serviceTree = {
      getTaskFromTaskID: jest.fn()
    };

    this.container = document.createElement('div');

    this.instance = ReactDOM.render(
      JestUtil.stubRouterContext(
        TaskTable, {
          tasks: Tasks,
          params: {nodeID: 'thing'}
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

  afterEach(function () {
    MesosStateStore.getNodeFromID = this.getNodeFromID;

    ReactDOM.unmountComponentAtNode(this.container);
  });

});
