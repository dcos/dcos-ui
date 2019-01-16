import {
  ServicePlanStep,
  compare
} from "#PLUGINS/services/src/js/types/ServicePlanStep";

describe("ServicePlanStep", () => {
  describe("#compare", () => {
    it("return true if steps match", () => {
      const stepA: ServicePlanStep = {
        id: "test-step-01",
        name: "test step",
        status: "STARTED",
        message: "I'm a boring message for a unit test"
      };
      const stepB: ServicePlanStep = {
        id: "test-step-01",
        name: "test step",
        status: "STARTED",
        message: "I'm a boring message for a unit test"
      };

      expect(compare(stepA, stepB)).toEqual(true);
    });

    it("return false if ids don't match", () => {
      const stepA: ServicePlanStep = {
        id: "test-step-01",
        name: "test step",
        status: "STARTED",
        message: "I'm a boring message for a unit test"
      };
      const stepB: ServicePlanStep = {
        id: "test-step-02",
        name: "test step",
        status: "STARTED",
        message: "I'm a boring message for a unit test"
      };

      expect(compare(stepA, stepB)).toEqual(false);
    });

    it("return false if names don't match", () => {
      const stepA: ServicePlanStep = {
        id: "test-step-01",
        name: "test step",
        status: "STARTED",
        message: "I'm a boring message for a unit test"
      };
      const stepB: ServicePlanStep = {
        id: "test-step-01",
        name: "test step one",
        status: "STARTED",
        message: "I'm a boring message for a unit test"
      };

      expect(compare(stepA, stepB)).toEqual(false);
    });

    it("return false if statuses don't match", () => {
      const stepA: ServicePlanStep = {
        id: "test-step-01",
        name: "test step",
        status: "STARTED",
        message: "I'm a boring message for a unit test"
      };
      const stepB: ServicePlanStep = {
        id: "test-step-01",
        name: "test step",
        status: "STARTING",
        message: "I'm a boring message for a unit test"
      };

      expect(compare(stepA, stepB)).toEqual(false);
    });

    it("return false if messages don't match", () => {
      const stepA: ServicePlanStep = {
        id: "test-step-01",
        name: "test step",
        status: "STARTED",
        message: "I'm a boring message for a unit test"
      };
      const stepB: ServicePlanStep = {
        id: "test-step-01",
        name: "test step",
        status: "STARTED",
        message: "I'm a different boring message for a unit test"
      };

      expect(compare(stepA, stepB)).toEqual(false);
    });
  });
});
