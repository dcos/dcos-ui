import React from "react";
import { mount } from "enzyme";

import CheckboxTable from "#SRC/js/components/CheckboxTable";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import JestUtil from "#SRC/js/utils/JestUtil";

import TaskTable from "../TaskTable";

jest.mock("#SRC/js/stores/DCOSStore");

const MesosStateStore = require("#SRC/js/stores/MesosStateStore").default;

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
