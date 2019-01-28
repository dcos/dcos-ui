import {
  ServicePlan,
  compare,
  flattenServicePlanPhases
} from "#PLUGINS/services/src/js/types/ServicePlan";

describe("ServicePlan", () => {
  describe("#compare", () => {
    it("returns true if plans match", () => {
      const planA: ServicePlan = {
        name: "plan",
        phases: [],
        status: "COMPLETE",
        errors: [],
        strategy: "parallel"
      };
      const planB: ServicePlan = {
        name: "plan",
        phases: [],
        status: "COMPLETE",
        errors: [],
        strategy: "parallel"
      };

      expect(compare(planA, planB)).toEqual(true);
    });

    it("compares phases", () => {
      const planA: ServicePlan = {
        name: "plan",
        phases: [
          {
            id: "phase-01",
            name: "test-phase",
            steps: [],
            strategy: "serial",
            status: "COMPLETE"
          }
        ],
        status: "COMPLETE",
        errors: [],
        strategy: "parallel"
      };
      const planB: ServicePlan = {
        name: "plan",
        phases: [
          {
            id: "phase-01",
            name: "test-phase",
            steps: [],
            strategy: "serial",
            status: "COMPLETE"
          }
        ],
        status: "COMPLETE",
        errors: [],
        strategy: "parallel"
      };

      expect(compare(planA, planB)).toEqual(true);
    });

    it("return false if names don't match", () => {
      const planA: ServicePlan = {
        name: "plan",
        phases: [],
        status: "COMPLETE",
        errors: [],
        strategy: "parallel"
      };
      const planB: ServicePlan = {
        name: "plan-two",
        phases: [],
        status: "COMPLETE",
        errors: [],
        strategy: "parallel"
      };

      expect(compare(planA, planB)).toEqual(false);
    });

    it("returns false if statuses don't match", () => {
      const planA: ServicePlan = {
        name: "plan",
        phases: [],
        status: "COMPLETE",
        errors: [],
        strategy: "parallel"
      };
      const planB: ServicePlan = {
        name: "plan",
        phases: [],
        status: "WAITING",
        errors: [],
        strategy: "parallel"
      };

      expect(compare(planA, planB)).toEqual(false);
    });

    it("returns false if strategies don't match", () => {
      const planA: ServicePlan = {
        name: "plan",
        phases: [],
        status: "COMPLETE",
        errors: [],
        strategy: "parallel"
      };
      const planB: ServicePlan = {
        name: "plan",
        phases: [],
        status: "COMPLETE",
        errors: [],
        strategy: "serial"
      };

      expect(compare(planA, planB)).toEqual(false);
    });

    it("returns false if errors length don't match", () => {
      const planA: ServicePlan = {
        name: "plan",
        phases: [],
        status: "COMPLETE",
        errors: [],
        strategy: "parallel"
      };
      const planB: ServicePlan = {
        name: "plan",
        phases: [],
        status: "COMPLETE",
        errors: ["I'm a new error"],
        strategy: "parallel"
      };

      expect(compare(planA, planB)).toEqual(false);
    });

    it("returns false if errors don't match", () => {
      const planA: ServicePlan = {
        name: "plan",
        phases: [],
        status: "COMPLETE",
        errors: ["I'm a different error"],
        strategy: "parallel"
      };
      const planB: ServicePlan = {
        name: "plan",
        phases: [],
        status: "COMPLETE",
        errors: ["I'm a new error"],
        strategy: "parallel"
      };

      expect(compare(planA, planB)).toEqual(false);
    });

    it("returns false if phases length don't match", () => {
      const planA: ServicePlan = {
        name: "plan",
        phases: [],
        status: "COMPLETE",
        errors: [],
        strategy: "parallel"
      };
      const planB: ServicePlan = {
        name: "plan",
        phases: [
          {
            id: "phase-01",
            name: "test-phase",
            steps: [],
            strategy: "serial",
            status: "COMPLETE"
          }
        ],
        status: "COMPLETE",
        errors: [],
        strategy: "parallel"
      };

      expect(compare(planA, planB)).toEqual(false);
    });

    it("returns false if phases don't match", () => {
      const planA: ServicePlan = {
        name: "plan",
        phases: [
          {
            id: "phase-01",
            name: "test-phase",
            steps: [],
            strategy: "serial",
            status: "COMPLETE"
          }
        ],
        status: "COMPLETE",
        errors: [],
        strategy: "parallel"
      };
      const planB: ServicePlan = {
        name: "plan",
        phases: [
          {
            id: "phase-02",
            name: "test-phase",
            steps: [],
            strategy: "serial",
            status: "COMPLETE"
          }
        ],
        status: "COMPLETE",
        errors: [],
        strategy: "parallel"
      };

      expect(compare(planA, planB)).toEqual(false);
    });
  });

  describe("#flattenServicePlanPhases", () => {
    it("return list of phases and steps", () => {
      const plan: ServicePlan = {
        name: "deploy-test",
        status: "IN_PROGRESS",
        errors: [],
        strategy: "serial",
        phases: [
          {
            id: "my-phase-01",
            name: "test-phase-01",
            strategy: "serial",
            status: "IN_PROGRESS",
            steps: [
              {
                id: "step-id-01",
                name: "step-01",
                status: "COMPLETE",
                message: "this is a message"
              },
              {
                id: "step-id-02",
                name: "step-02",
                status: "PREPARED",
                message: "this is another message"
              }
            ]
          }
        ]
      };

      expect(flattenServicePlanPhases(plan)).toEqual([
        {
          type: "phase",
          id: "my-phase-01",
          name: "test-phase-01",
          status: "IN_PROGRESS",
          strategy: "serial",
          steps: [
            {
              type: "step",
              phaseId: "my-phase-01",
              id: "step-id-01",
              name: "step-01",
              status: "COMPLETE",
              message: "this is a message"
            },
            {
              type: "step",
              phaseId: "my-phase-01",
              id: "step-id-02",
              name: "step-02",
              status: "PREPARED",
              message: "this is another message"
            }
          ]
        },
        {
          type: "step",
          phaseId: "my-phase-01",
          id: "step-id-01",
          name: "step-01",
          status: "COMPLETE",
          message: "this is a message"
        },
        {
          type: "step",
          phaseId: "my-phase-01",
          id: "step-id-02",
          name: "step-02",
          status: "PREPARED",
          message: "this is another message"
        }
      ]);
    });
  });
});
