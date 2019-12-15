import List from "#SRC/js/structs/List";
import TasksRegionFilter from "../TasksRegionFilter";
import TaskUtil from "../../utils/TaskUtil";

jest.mock("../../utils/TaskUtil");
const SearchDSL = require("#SRC/resources/grammar/SearchDSL");

let thisMockItems;

describe("TaskRegionFilter", () => {
  beforeEach(() => {
    TaskUtil.getNode = item => item;
    thisMockItems = [
      {
        getRegionName() {
          return "region-1";
        }
      },
      {
        getRegionName() {
          return "region-2";
        }
      }
    ];
  });

  it("keeps tasks with specific region mentioned", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("region:region-1");

    const filters = [new TasksRegionFilter(["region-1"])];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });
});
