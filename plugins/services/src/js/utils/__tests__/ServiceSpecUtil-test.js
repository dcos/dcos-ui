const ApplicationSpec = require("../../structs/ApplicationSpec");
const FrameworkSpec = require("../../structs/FrameworkSpec");
const PodSpec = require("../../structs/PodSpec");
const ServiceSpecUtil = require("../ServiceSpecUtil");

describe("ServiceSpecUtil", () => {
  describe("Pods", () => {
    describe("#setPodInstances", () => {
      it("creates missing sections", () => {
        var spec = new PodSpec({});
        var newSpec = ServiceSpecUtil.setPodInstances(spec, 10);

        expect(newSpec instanceof PodSpec).toBeTruthy();
        expect(newSpec.get().scaling).toEqual({
          kind: "fixed",
          instances: 10
        });
      });

      it("keeps existing fields intact", () => {
        var spec = new PodSpec({
          scaling: {
            kind: "fixed",
            instances: 1,
            maxInstances: 50
          }
        });
        var newSpec = ServiceSpecUtil.setPodInstances(spec, 10);

        expect(newSpec instanceof PodSpec).toBeTruthy();
        expect(newSpec.get().scaling).toEqual({
          kind: "fixed",
          instances: 10,
          maxInstances: 50
        });
      });

      it("resets to fixed on different scale kind", () => {
        var spec = new PodSpec({
          scaling: {
            kind: "different",
            instances: 50,
            miscFieldThatWillBeDropped: ":("
          }
        });
        var newSpec = ServiceSpecUtil.setPodInstances(spec, 10);

        expect(newSpec instanceof PodSpec).toBeTruthy();
        expect(newSpec.get().scaling).toEqual({
          kind: "fixed",
          instances: 10
        });
      });
    });

    describe("#setServiceInstances", () => {
      it("operates on PodSpec", () => {
        var spec = new PodSpec({});
        var newSpec = ServiceSpecUtil.setServiceInstances(spec, 10);

        expect(newSpec instanceof PodSpec).toBeTruthy();
        expect(newSpec.get().scaling).toEqual({
          kind: "fixed",
          instances: 10
        });
      });
    });
  });

  describe("Application", () => {
    describe("#setApplicationInstances", () => {
      it("creates missing sections", () => {
        var spec = new ApplicationSpec({});
        var newSpec = ServiceSpecUtil.setApplicationInstances(spec, 10);

        expect(newSpec instanceof ApplicationSpec).toBeTruthy();
        expect(newSpec.get()).toEqual({
          instances: 10
        });
      });
    });

    describe("#setServiceInstances", () => {
      it("operates on ApplicationSpec", () => {
        var spec = new ApplicationSpec({});
        var newSpec = ServiceSpecUtil.setServiceInstances(spec, 10);

        expect(newSpec instanceof ApplicationSpec).toBeTruthy();
        expect(newSpec.get()).toEqual({
          instances: 10
        });
      });
    });
  });

  describe("Framework", () => {
    describe("#setFrameworkInstances", () => {
      it("creates missing sections", () => {
        var spec = new FrameworkSpec({});
        var newSpec = ServiceSpecUtil.setFrameworkInstances(spec, 10);

        expect(newSpec instanceof FrameworkSpec).toBeTruthy();
        expect(newSpec.get()).toEqual({
          instances: 10
        });
      });
    });

    describe("#setServiceInstances", () => {
      it("operates on FrameworkSpec", () => {
        var spec = new FrameworkSpec({});
        var newSpec = ServiceSpecUtil.setServiceInstances(spec, 10);

        expect(newSpec instanceof FrameworkSpec).toBeTruthy();
        expect(newSpec.get()).toEqual({
          instances: 10
        });
      });
    });
  });
});
