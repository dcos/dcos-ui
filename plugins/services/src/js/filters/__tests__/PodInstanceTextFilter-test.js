import List from "#SRC/js/structs/List";
import PodInstancesZoneFilter from "../PodInstancesZoneFilter";
import InstanceUtil from "../../utils/InstanceUtil";

jest.mock("../../utils/TaskUtil");

const SearchDSL = require("#SRC/resources/grammar/SearchDSL");

let thisMockItems;

describe("PodInstancesZoneFilter", () => {
  beforeEach(() => {
    InstanceUtil.getNode = item => item;
    thisMockItems = [
      {
        getZoneName() {
          return "zone-1";
        }
      },
      {
        getZoneName() {
          return "zone-2";
        }
      }
    ];
  });

  it("keeps tasks with specific zone mentioned", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("zone:zone-1");

    const filters = [new PodInstancesZoneFilter(["zone-1"])];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });
});
