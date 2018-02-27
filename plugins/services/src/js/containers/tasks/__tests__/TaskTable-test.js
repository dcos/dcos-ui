jest.mock("#SRC/js/stores/DCOSStore");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");
const CheckboxTable = require("#SRC/js/components/CheckboxTable");
const DCOSStore = require("#SRC/js/stores/DCOSStore");
const JestUtil = require("#SRC/js/utils/JestUtil");
const MesosStateStore = require("#SRC/js/stores/MesosStateStore");

const TaskTable = require("../TaskTable");
const Tasks = require("./fixtures/MockTasks.json").tasks;

// eslint-disable-next-line no-unused-vars
let thisContainer, thisInstance, thisTaskTable, thisGetNodeFromID;

describe("TaskTable", function() {
  beforeEach(function() {
    DCOSStore.serviceTree = {
      getTaskFromTaskID: jest.fn()
    };

    thisContainer = global.document.createElement("div");

    thisInstance = ReactDOM.render(
      JestUtil.stubRouterContext(TaskTable, {
        tasks: Tasks,
        params: { nodeID: "thing" }
      }),
      thisContainer
    );
  });

  describe("#getDisabledItemsMap", function() {
    beforeEach(function() {
      thisTaskTable = new TaskTable();
    });

    it("treats tasks started not by Marathon as disabled", function() {
      var tasks = [
        { id: "1", state: "TASK_STARTING", isStartedByMarathon: true },
        { id: "2", state: "TASK_STARTING" }
      ];
      expect(thisTaskTable.getDisabledItemsMap(tasks)).toEqual({ "2": true });
    });

    it("it treats completed tasks as disabled", function() {
      var tasks = [
        { id: "1", state: "TASK_STARTING", isStartedByMarathon: true },
        { id: "2", state: "TASK_FINISHED", isStartedByMarathon: true }
      ];
      expect(thisTaskTable.getDisabledItemsMap(tasks)).toEqual({ "2": true });
    });
  });

  it("it pass a uniqueProperty to CheckboxTable", function() {
    const component = JestUtil.stubRouterContext(TaskTable, { params: {} });
    const result = TestUtils.renderIntoDocument(component);
    const table = TestUtils.findRenderedComponentWithType(
      result,
      CheckboxTable
    );

    expect(table.props.uniqueProperty).toEqual("id");
  });

  afterEach(function() {
    MesosStateStore.getNodeFromID = thisGetNodeFromID;

    ReactDOM.unmountComponentAtNode(thisContainer);
  });
});
