import ApplicationSpec from "../../structs/ApplicationSpec";
import FrameworkSpec from "../../structs/FrameworkSpec";
import PodSpec from "../../structs/PodSpec";
import ServiceSpecUtil from "../ServiceSpecUtil";

describe("ServiceSpecUtil", () => {
  describe("Pods", () => {
    describe("#setPodInstances", () => {
      it("creates missing sections", () => {
        const spec = new PodSpec({});
        const newSpec = ServiceSpecUtil.setPodInstances(spec, 10);

        expect(newSpec instanceof PodSpec).toBeTruthy();
        expect(newSpec.get().scaling).toEqual({
          kind: "fixed",
          instances: 10,
        });
      });

      it("keeps existing fields intact", () => {
        const spec = new PodSpec({
          scaling: {
            kind: "fixed",
            instances: 1,
            maxInstances: 50,
          },
        });
        const newSpec = ServiceSpecUtil.setPodInstances(spec, 10);

        expect(newSpec instanceof PodSpec).toBeTruthy();
        expect(newSpec.get().scaling).toEqual({
          kind: "fixed",
          instances: 10,
          maxInstances: 50,
        });
      });

      it("resets to fixed on different scale kind", () => {
        const spec = new PodSpec({
          scaling: {
            kind: "different",
            instances: 50,
            miscFieldThatWillBeDropped: ":(",
          },
        });
        const newSpec = ServiceSpecUtil.setPodInstances(spec, 10);

        expect(newSpec instanceof PodSpec).toBeTruthy();
        expect(newSpec.get().scaling).toEqual({
          kind: "fixed",
          instances: 10,
        });
      });
    });

    describe("#setServiceInstances", () => {
      it("operates on PodSpec", () => {
        const spec = new PodSpec({});
        const newSpec = ServiceSpecUtil.setServiceInstances(spec, 10);

        expect(newSpec instanceof PodSpec).toBeTruthy();
        expect(newSpec.get().scaling).toEqual({
          kind: "fixed",
          instances: 10,
        });
      });
    });
  });

  describe("Application", () => {
    describe("#setApplicationInstances", () => {
      it("creates missing sections", () => {
        const spec = new ApplicationSpec({});
        const newSpec = ServiceSpecUtil.setApplicationInstances(spec, 10);

        expect(newSpec instanceof ApplicationSpec).toBeTruthy();
        expect(newSpec.get()).toEqual({
          instances: 10,
        });
      });
    });

    describe("#setServiceInstances", () => {
      it("operates on ApplicationSpec", () => {
        const spec = new ApplicationSpec({});
        const newSpec = ServiceSpecUtil.setServiceInstances(spec, 10);

        expect(newSpec instanceof ApplicationSpec).toBeTruthy();
        expect(newSpec.get()).toEqual({
          instances: 10,
        });
      });
    });
  });

  describe("Framework", () => {
    describe("#setFrameworkInstances", () => {
      it("creates missing sections", () => {
        const spec = new FrameworkSpec({});
        const newSpec = ServiceSpecUtil.setFrameworkInstances(spec, 10);

        expect(newSpec instanceof FrameworkSpec).toBeTruthy();
        expect(newSpec.get()).toEqual({
          instances: 10,
        });
      });
    });

    describe("#setServiceInstances", () => {
      it("operates on FrameworkSpec", () => {
        const spec = new FrameworkSpec({});
        const newSpec = ServiceSpecUtil.setServiceInstances(spec, 10);

        expect(newSpec instanceof FrameworkSpec).toBeTruthy();
        expect(newSpec.get()).toEqual({
          instances: 10,
        });
      });
    });
  });
});
