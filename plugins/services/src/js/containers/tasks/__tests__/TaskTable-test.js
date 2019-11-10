import React from "react";
import { mount } from "enzyme";

jest.mock("#SRC/js/stores/DCOSStore");

const CheckboxTable = require("#SRC/js/components/CheckboxTable");
const DCOSStore = require("#SRC/js/stores/DCOSStore");
const JestUtil = require("#SRC/js/utils/JestUtil");
const MesosStateStore = require("#SRC/js/stores/MesosStateStore");

const TaskTable = require("../TaskTable");

let thisTaskTable, thisGetNodeFromID;

describe("TaskTable", () => {
  beforeEach(() => {
    DCOSStore.serviceTree = {
      getTaskFromTaskID: jest.fn()
    };
  });

  describe("#getDisabledItemsMap", () => {
    beforeEach(() => {
      thisTaskTable = new TaskTable();
    });

    it("treats tasks started not by Marathon as disabled", () => {
      var tasks = [
        { id: "1", state: "TASK_STARTING", isStartedByMarathon: true },
        { id: "2", state: "TASK_STARTING" }
      ];
      expect(thisTaskTable.getDisabledItemsMap(tasks)).toEqual({ "2": true });
    });

    it("it treats completed tasks as disabled", () => {
      var tasks = [
        { id: "1", state: "TASK_STARTING", isStartedByMarathon: true },
        { id: "2", state: "TASK_FINISHED", isStartedByMarathon: true }
      ];
      expect(thisTaskTable.getDisabledItemsMap(tasks)).toEqual({ "2": true });
    });
  });

  it("it pass a uniqueProperty to CheckboxTable", () => {
    const WrappedComponent = JestUtil.stubRouterContext(TaskTable);
    const table = mount(<WrappedComponent params={{}} />).find(CheckboxTable);

    expect(table.prop("uniqueProperty")).toEqual("id");
  });

  afterEach(() => {
    MesosStateStore.getNodeFromID = thisGetNodeFromID;
  });
});
