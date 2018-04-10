const MesosSummaryUtil = require("../MesosSummaryUtil");

describe("MesosSummaryUtil", function() {
  describe("#stateResourcesToResourceStates", function() {
    it("returns empty resource states lists", function() {
      const resourceStates = MesosSummaryUtil.stateResourcesToResourceStates(
        []
      );
      expect(resourceStates).toEqual({ cpus: [], mem: [], disk: [], gpus: [] });
    });

    it("sets fields to null indicating unsuccessful snapshot", function() {
      const stateResources = [
        {
          date: 1,
          resources: null,
          totalResources: null
        },
        {
          date: 2,
          resources: { cpus: 7, mem: 3, disk: 4, gpus: 4 },
          totalResources: { cpus: 10, mem: 3, disk: 4, gpus: 5 }
        }
      ];
      const resources = MesosSummaryUtil.stateResourcesToResourceStates(
        stateResources
      );

      const expectedResult = {
        cpus: [
          { date: 1, percentage: null, value: null },
          { date: 2, percentage: 70, value: 7 }
        ],
        mem: [
          { date: 1, percentage: null, value: null },
          { date: 2, percentage: 100, value: 3 }
        ],
        disk: [
          { date: 1, percentage: null, value: null },
          { date: 2, percentage: 100, value: 4 }
        ],
        gpus: [
          { date: 1, percentage: null, value: null },
          { date: 2, percentage: 80, value: 4 }
        ]
      };

      expect(resources).toEqual(expectedResult);
    });

    it("transposes state resources to resource states", function() {
      const stateResources = [
        {
          date: 1,
          resources: { cpus: 2, mem: 3, disk: 2, gpus: 4 },
          totalResources: { cpus: 4, mem: 3, disk: 4, gpus: 5 }
        }
      ];
      const resourceStates = MesosSummaryUtil.stateResourcesToResourceStates(
        stateResources
      );

      const expectedResult = {
        cpus: [{ date: 1, value: 2, percentage: 50 }],
        mem: [{ date: 1, value: 3, percentage: 100 }],
        disk: [{ date: 1, value: 2, percentage: 50 }],
        gpus: [{ date: 1, value: 4, percentage: 80 }]
      };

      expect(resourceStates).toEqual(expectedResult);
    });

    it("transposes multiple state resources to resource states", function() {
      const stateResources = [
        {
          date: 1,
          resources: { cpus: 2, mem: 3, disk: 2, gpus: 4 },
          totalResources: { cpus: 4, mem: 3, disk: 4, gpus: 5 }
        },
        {
          date: 2,
          resources: { cpus: 7, mem: 3, disk: 4, gpus: 0 },
          totalResources: { cpus: 10, mem: 3, disk: 4, gpus: 1 }
        }
      ];
      const resourceStates = MesosSummaryUtil.stateResourcesToResourceStates(
        stateResources
      );

      const expectedResult = {
        cpus: [
          { date: 1, value: 2, percentage: 50 },
          { date: 2, value: 7, percentage: 70 }
        ],
        mem: [
          { date: 1, value: 3, percentage: 100 },
          { date: 2, value: 3, percentage: 100 }
        ],
        disk: [
          { date: 1, value: 2, percentage: 50 },
          { date: 2, value: 4, percentage: 100 }
        ],
        gpus: [
          { date: 1, value: 4, percentage: 80 },
          { date: 2, value: 0, percentage: 0 }
        ]
      };

      expect(resourceStates).toEqual(expectedResult);
    });
  });
});
