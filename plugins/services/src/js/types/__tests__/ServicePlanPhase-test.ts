import {
  ServicePlanPhase,
  compare
} from "#PLUGINS/services/src/js/types/ServicePlanPhase";

describe("ServicePlanPhase", () => {
  describe("#compare", () => {
    it("return true if phases match", () => {
      const phaseA: ServicePlanPhase = {
        id: "phase-01",
        name: "phase 01",
        status: "COMPLETE",
        strategy: "serial",
        steps: []
      };
      const phaseB: ServicePlanPhase = {
        id: "phase-01",
        name: "phase 01",
        status: "COMPLETE",
        strategy: "serial",
        steps: []
      };

      expect(compare(phaseA, phaseB)).toEqual(true);
    });

    it("return false if id doesn't match", () => {
      const phaseA: ServicePlanPhase = {
        id: "phase-01",
        name: "phase 01",
        status: "COMPLETE",
        strategy: "serial",
        steps: []
      };
      const phaseB: ServicePlanPhase = {
        id: "phase-02",
        name: "phase 01",
        status: "COMPLETE",
        strategy: "serial",
        steps: []
      };

      expect(compare(phaseA, phaseB)).toEqual(false);
    });

    it("return false if name doesn't match", () => {
      const phaseA: ServicePlanPhase = {
        id: "phase-01",
        name: "phase 01",
        status: "COMPLETE",
        strategy: "serial",
        steps: []
      };
      const phaseB: ServicePlanPhase = {
        id: "phase-01",
        name: "phase 02",
        status: "COMPLETE",
        strategy: "serial",
        steps: []
      };

      expect(compare(phaseA, phaseB)).toEqual(false);
    });

    it("return false if status doesn't match", () => {
      const phaseA: ServicePlanPhase = {
        id: "phase-01",
        name: "phase 01",
        status: "IN_PROGRESS",
        strategy: "serial",
        steps: []
      };
      const phaseB: ServicePlanPhase = {
        id: "phase-01",
        name: "phase 01",
        status: "COMPLETE",
        strategy: "serial",
        steps: []
      };

      expect(compare(phaseA, phaseB)).toEqual(false);
    });

    it("return false if strategy doesn't match", () => {
      const phaseA: ServicePlanPhase = {
        id: "phase-01",
        name: "phase 01",
        status: "COMPLETE",
        strategy: "parallel",
        steps: []
      };
      const phaseB: ServicePlanPhase = {
        id: "phase-01",
        name: "phase 01",
        status: "COMPLETE",
        strategy: "serial",
        steps: []
      };

      expect(compare(phaseA, phaseB)).toEqual(false);
    });

    it("return false if steps length don't match", () => {
      const phaseA: ServicePlanPhase = {
        id: "phase-01",
        name: "phase 01",
        status: "COMPLETE",
        strategy: "serial",
        steps: []
      };
      const phaseB: ServicePlanPhase = {
        id: "phase-01",
        name: "phase 01",
        status: "COMPLETE",
        strategy: "serial",
        steps: [
          {
            id: "",
            name: "",
            status: "ERROR",
            message: ""
          }
        ]
      };

      expect(compare(phaseA, phaseB)).toEqual(false);
    });

    it("return false if steps don't match", () => {
      const phaseA: ServicePlanPhase = {
        id: "phase-01",
        name: "phase 01",
        status: "COMPLETE",
        strategy: "serial",
        steps: [
          {
            id: "step",
            name: "",
            status: "ERROR",
            message: ""
          }
        ]
      };
      const phaseB: ServicePlanPhase = {
        id: "phase-01",
        name: "phase 01",
        status: "COMPLETE",
        strategy: "serial",
        steps: [
          {
            id: "step-01",
            name: "",
            status: "ERROR",
            message: ""
          }
        ]
      };

      expect(compare(phaseA, phaseB)).toEqual(false);
    });
  });
});
