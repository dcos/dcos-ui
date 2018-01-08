const ApplicationSpec = require("../../structs/ApplicationSpec");
const FrameworkSpec = require("../../structs/FrameworkSpec");
const PodSpec = require("../../structs/PodSpec");
const ServiceSpecUtil = require("../ServiceSpecUtil");

describe("ServiceSpecUtil", function() {
  describe("Pods", function() {
    describe("#setPodInstances", function() {
      it("creates missing sections", function() {
        var spec = new PodSpec({});
        var newSpec = ServiceSpecUtil.setPodInstances(spec, 10);

        expect(newSpec instanceof PodSpec).toBeTruthy();
        expect(newSpec.get().scaling).toEqual({
          kind: "fixed",
          instances: 10
        });
      });

      it("keeps existing fields intact", function() {
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

      it("resets to fixed on different scale kind", function() {
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

    describe("#setServiceInstances", function() {
      it("operates on PodSpec", function() {
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

  describe("Application", function() {
    describe("#setApplicationInstances", function() {
      it("creates missing sections", function() {
        var spec = new ApplicationSpec({});
        var newSpec = ServiceSpecUtil.setApplicationInstances(spec, 10);

        expect(newSpec instanceof ApplicationSpec).toBeTruthy();
        expect(newSpec.get()).toEqual({
          instances: 10
        });
      });
    });

    describe("#setServiceInstances", function() {
      it("operates on ApplicationSpec", function() {
        var spec = new ApplicationSpec({});
        var newSpec = ServiceSpecUtil.setServiceInstances(spec, 10);

        expect(newSpec instanceof ApplicationSpec).toBeTruthy();
        expect(newSpec.get()).toEqual({
          instances: 10
        });
      });
    });
  });

  describe("Framework", function() {
    describe("#setFrameworkInstances", function() {
      it("creates missing sections", function() {
        var spec = new FrameworkSpec({});
        var newSpec = ServiceSpecUtil.setFrameworkInstances(spec, 10);

        expect(newSpec instanceof FrameworkSpec).toBeTruthy();
        expect(newSpec.get()).toEqual({
          instances: 10
        });
      });
    });

    describe("#setServiceInstances", function() {
      it("operates on FrameworkSpec", function() {
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
