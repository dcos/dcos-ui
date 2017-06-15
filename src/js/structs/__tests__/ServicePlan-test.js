const ServicePlan = require("../ServicePlan");
const ServicePlanPhases = require("../ServicePlanPhases");
const ServicePlanStatusTypes = require("../../constants/ServicePlanStatusTypes");

describe("ServicePlan", function() {
  describe("#getPhases", function() {
    it("should return an instance of ServicePlanPhases", function() {
      const Plan = new ServicePlan({
        phases: []
      });

      expect(Plan.getPhases() instanceof ServicePlanPhases).toEqual(true);
    });

    it("should return 1 phase", function() {
      const Plan = new ServicePlan({
        phases: [
          {
            id: "phase-1"
          }
        ]
      });

      expect(Plan.getPhases().getItems().length).toEqual(1);
    });
  });

  describe("#getErrors", function() {
    it("should return []", function() {
      const Plan = new ServicePlan({});

      expect(Plan.getErrors().length).toEqual(0);
    });

    it("should return Array of errors", function() {
      const Plan = new ServicePlan({
        errors: ["error-1", "error-2"]
      });

      expect(Plan.getErrors().length).toEqual(2);
    });
  });

  describe("#hasError", function() {
    it("should return false", function() {
      const Plan = new ServicePlan({});

      expect(Plan.hasError()).toEqual(false);
    });

    it("should return true", function() {
      const Plan = new ServicePlan({
        status: ServicePlanStatusTypes.ERROR
      });

      expect(Plan.hasError()).toEqual(true);
    });
  });

  describe("#isComplete", function() {
    it("should return false", function() {
      const Plan = new ServicePlan({
        status: ServicePlanStatusTypes.IN_PROGRESS
      });

      expect(Plan.isComplete()).toEqual(false);
    });

    it("should return true", function() {
      const Plan = new ServicePlan({
        status: ServicePlanStatusTypes.COMPLETE
      });

      expect(Plan.isComplete()).toEqual(true);
    });
  });

  describe("#isInProgress", function() {
    it("should return false", function() {
      const Plan = new ServicePlan({
        status: ServicePlanStatusTypes.COMPLETE
      });

      expect(Plan.isInProgress()).toEqual(false);
    });

    it("should return true", function() {
      const Plan = new ServicePlan({
        status: ServicePlanStatusTypes.IN_PROGRESS
      });

      expect(Plan.isInProgress()).toEqual(true);
    });
  });

  describe("#isPending", function() {
    it("should return false", function() {
      const Plan = new ServicePlan({
        status: ServicePlanStatusTypes.COMPLETE
      });

      expect(Plan.isPending()).toEqual(false);
    });

    it("should return true", function() {
      const Plan = new ServicePlan({
        status: ServicePlanStatusTypes.PENDING
      });

      expect(Plan.isPending()).toEqual(true);
    });
  });

  describe("#isWaiting", function() {
    it("should return false", function() {
      const Plan = new ServicePlan({
        status: ServicePlanStatusTypes.COMPLETE
      });

      expect(Plan.isWaiting()).toEqual(false);
    });

    it("should return true", function() {
      const Plan = new ServicePlan({
        status: ServicePlanStatusTypes.WAITING
      });

      expect(Plan.isWaiting()).toEqual(true);
    });
  });
});
