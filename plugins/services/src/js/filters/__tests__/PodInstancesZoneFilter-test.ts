import List from "#SRC/js/structs/List";
import PodInstancesZoneFilter from "../PodInstancesZoneFilter";
import InstanceUtil from "../../utils/InstanceUtil";

jest.mock("../../utils/TaskUtil");
import SearchDSL from "#SRC/resources/grammar/SearchDSL";

let thisMockItems;

describe("PodInstancesZoneFilter", () => {
  beforeEach(() => {
    InstanceUtil.getNode = (item) => item;
    thisMockItems = [
      { getZoneName: () => "zone-1" },
      { getZoneName: () => "zone-2" },
    ];
  });

  it("keeps tasks with specific zone mentioned", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("zone:zone-1");
    const filters = [PodInstancesZoneFilter];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0],
    ]);
  });
});
