import TaskUtil from "#PLUGINS/services/src/js/utils/TaskUtil";
import TasksContainer from "../TasksContainer";

describe("TasksContainer", () => {
  describe("propsToState", () => {
    describe("filterExpression", () => {
      const testCases = [
        {
          name: "no new regions and zones",
          regions: [],
          zones: [],
          expectedQuery: "is:active"
        },
        {
          name: "new region and zone",
          regions: ["eu-central-1"],
          zones: ["eu-central-1b"],
          expectedQuery: "is:active"
        },
        {
          name: "no new region with custom query",
          regions: [],
          zones: [],
          query: "is:completed",
          expectedQuery: "is:completed"
        },
        {
          name: "new region with custom query",
          regions: ["eu-central-1"],
          zones: ["eu-central-1b"],
          query: "is:completed",
          expectedQuery: "is:completed"
        }
      ];

      testCases.forEach(function({
        name,
        regions,
        zones,
        query,
        expectedQuery
      }) {
        it(name, () => {
          TaskUtil.getNode = jest.fn(({ region, zone }) => ({
            getZoneName: jest.fn(() => zone),
            getRegionName: jest.fn(() => region)
          }));

          const setState = jest.fn();
          TasksContainer.prototype.propsToState.call(
            {
              state: { defaultFilterData: { zones: [], regions: [] } },
              setState
            },
            {
              location: { query: { q: query } },
              tasks: zones.map((zone, i) => ({ zone, region: regions[i] }))
            }
          );

          expect(setState).toHaveBeenCalled();
          const filterExpression = setState.mock.calls[0][0].filterExpression;

          expect(filterExpression.value).toBe(expectedQuery);
        });
      });
    });
  });
});
