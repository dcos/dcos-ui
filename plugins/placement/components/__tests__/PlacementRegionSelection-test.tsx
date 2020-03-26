import CompositeState from "#SRC/js/structs/CompositeState";
import Node from "#SRC/js/structs/Node";
import Task from "#PLUGINS/services/src/js/structs/Task";
import JestUtil from "#SRC/js/utils/JestUtil";
import PlacementRegionSelection from "../PlacementRegionSelection";

jest.mock("#SRC/js/structs/CompositeState");

const React = require("react");

const renderer = require("react-test-renderer");
const MesosStateStore = require("#SRC/js/stores/MesosStateStore").default;

const MasterNodeLocal = require("./fixtures/MasterNodeLocal.json");

let thisInstance;

describe("PlacementRegionSelection", () => {
  beforeEach(() => {
    CompositeState.getMasterNode = () => new Node(MasterNodeLocal);

    MesosStateStore.addChangeListener = () => {};
    MesosStateStore.getTaskFromTaskID = () =>
      new Task({
        id: "bar",
        state: "TASK_RUNNING",
      });
    // Create mock functions
    MesosStateStore.get = (key) => {
      if (key === "lastMesosState") {
        return {
          slaves: [
            {
              domain: {
                fault_domain: {
                  region: { name: "us-west-2" },
                  zone: { name: "us-west-2b" },
                },
              },
            },
          ],
        };
      }
    };
  });

  describe("#localRegionOptions", () => {
    it("attaches local to option text when region is equal to master", () => {
      const regionData = {
        index: 1,
        constraint: {
          fieldName: "@region",
          operator: "IS",
          value: "us-west-2",
          type: "region",
        },
      };
      const WrappedComponent = JestUtil.withI18nProvider(
        PlacementRegionSelection
      );
      thisInstance = renderer.create(<WrappedComponent data={regionData} />);

      const tree = thisInstance.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
