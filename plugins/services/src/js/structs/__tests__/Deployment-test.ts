import Deployment from "../Deployment";

describe("Deployment", () => {
  describe("#get...", () => {
    it("calls through to `Item.get`", () => {
      const deployment = new Deployment({
        id: "deployment-id",
        version: "2001-01-01T01:01:01.001Z",
        affectedApps: ["app1", "app2"],
        currentStep: 2,
        totalSteps: 3
      });
      expect(deployment.getId()).toEqual("deployment-id");
      expect(deployment.getAffectedServiceIds()).toEqual(["app1", "app2"]);
      expect(deployment.getCurrentStep()).toEqual(2);
      expect(deployment.getTotalSteps()).toEqual(3);
    });
  });

  describe("#getStartTime", () => {
    it("returns a Date object derived from the version property", () => {
      const version = "2001-01-01T01:01:01.001Z";
      const deployment = new Deployment({ version });
      expect(deployment.getStartTime()).toEqual(jasmine.any(Date));
      expect(deployment.getStartTime().toISOString()).toEqual(version);
    });
  });

  describe("#getAffectedServices", () => {
    it("returns an empty array by default", () => {
      const deployment = new Deployment();
      const affectedServices = deployment.getAffectedServices();
      expect(affectedServices).toEqual([]);
    });

    it("throws an error if service IDs are set but services are not", () => {
      const deployment = new Deployment({ affectedApps: ["app1", "app2"] });
      expect(deployment.getAffectedServices.bind(deployment)).toThrow();
    });

    it("returns the populated list of services if it is up-to-date", () => {
      const deployment = new Deployment({
        affectedApps: ["app1", "app2"],
        affectedPods: ["pod1", "pod2"],
        affectedServices: [
          { id: "app1" },
          { id: "app2" },
          { id: "pod1" },
          { id: "pod2" }
        ]
      });
      const affectedServices = deployment.getAffectedServices();
      expect(affectedServices.length).toEqual(4);
    });
  });

  describe("#isStarting", () => {
    it("flags deployments of newly-created services", () => {
      const deployment = new Deployment({
        id: "deployment-id",
        affectedApps: ["app1"],
        steps: [
          {
            actions: [
              { app: "app1", type: "StartApplication" },
              { app: "app1", type: "ScaleApplication" }
            ]
          }
        ]
      });

      expect(deployment.isStarting()).toEqual(true);
    });

    it("flags deployments which update services", () => {
      const deployment = new Deployment({
        id: "deployment-id",
        affectedApps: ["app1"],
        steps: [
          {
            actions: [{ app: "app1", type: "ScaleApplication" }]
          }
        ]
      });

      expect(deployment.isStarting()).toEqual(false);
    });

    it("gracefully handles deployments without steps", () => {
      const deployment = new Deployment({ id: "deployment-id" });
      expect(deployment.isStarting.bind(deployment)).not.toThrow();
    });
  });
});
