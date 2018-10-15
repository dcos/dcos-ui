import { mount } from "enzyme";

jest.mock("#SRC/js/stores/DCOSStore");

const CheckboxTable = require("#SRC/js/components/CheckboxTable");
const DCOSStore = require("#SRC/js/stores/DCOSStore");
const JestUtil = require("#SRC/js/utils/JestUtil");
const MesosStateStore = require("#SRC/js/stores/MesosStateStore");

const { TaskTable } = require("../TaskTable");

let thisTaskTable, thisGetNodeFromID;

describe("TaskTable", function() {
  beforeEach(function() {
    DCOSStore.serviceTree = {
      getTaskFromTaskID: jest.fn()
    };
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
    const table = mount(component).find(CheckboxTable);

    expect(table.prop("uniqueProperty")).toEqual("id");
  });

  afterEach(function() {
    MesosStateStore.getNodeFromID = thisGetNodeFromID;
  });
});
