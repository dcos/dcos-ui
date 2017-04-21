const ServicePlanPhases = require("../ServicePlanPhases");
const ServicePlanStatusTypes = require("../../constants/ServicePlanStatusTypes");

describe("ServicePlanPhases", function() {
  describe("#getActive", function() {
    it("should return null when no active phase", function() {
      const Phases = new ServicePlanPhases({
        items: [
          {
            status: ServicePlanStatusTypes.COMPLETE
          }
        ]
      });

      expect(Phases.getActive()).toEqual(null);
    });

    it("should return first phase not complete", function() {
      const Phases = new ServicePlanPhases({
        items: [
          {
            status: ServicePlanStatusTypes.COMPLETE
          },
          {
            name: "waiting",
            status: ServicePlanStatusTypes.WAITING
          }
        ]
      });

      expect(Phases.getActive().getName()).toEqual("waiting");
    });
  });

  describe("#getActiveIndex", function() {
    it("should return -1 when no active phase", function() {
      const Phases = new ServicePlanPhases({
        items: [
          {
            status: ServicePlanStatusTypes.COMPLETE
          }
        ]
      });

      expect(Phases.getActiveIndex()).toEqual(-1);
    });

    it("should return index of 1", function() {
      const Phases = new ServicePlanPhases({
        items: [
          {
            status: ServicePlanStatusTypes.COMPLETE
          },
          {
            name: "waiting",
            status: ServicePlanStatusTypes.WAITING
          }
        ]
      });

      expect(Phases.getActiveIndex()).toEqual(1);
    });
  });
});
