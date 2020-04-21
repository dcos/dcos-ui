import PodSpec from "../PodSpec";

import PodFixture from "../../../../../../tests/_fixtures/pods/PodFixture";

describe("PodSpec", () => {
  describe("#constructor", () => {
    it("creates instances", () => {
      const instance = new PodSpec({
        ...PodFixture.spec,
      });

      expect(instance.get()).toEqual(PodFixture.spec);
    });
  });

  describe("#getContainers", () => {
    it("returns the correct value", () => {
      const podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getContainers()).toEqual(PodFixture.spec.containers);
    });

    it("returns the correct default value", () => {
      const podSpec = new PodSpec();
      expect(podSpec.getContainers()).toEqual([]);
    });
  });

  describe("#getContainerSpec", () => {
    it("returns the correct value", () => {
      const podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getContainerSpec("container-1")).toEqual(
        PodFixture.spec.containers[0]
      );
    });
  });

  describe("#getLabels", () => {
    it("returns the correct value", () => {
      const podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getLabels()).toEqual({ POD_LABEL: "foo" });
    });

    it("returns the correct default value", () => {
      const podSpec = new PodSpec();
      expect(podSpec.getLabels()).toEqual({});
    });
  });

  describe("#getResources", () => {
    it("returns the correct value", () => {
      const podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getResources()).toEqual({
        cpus: 1,
        mem: 128,
        gpus: 0,
        disk: 0,
      });
    });

    it("returns the correct default value", () => {
      const podSpec = new PodSpec();
      expect(podSpec.getResources()).toEqual({
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0,
      });
    });
  });

  describe("#getScalingInstances", () => {
    it("returns the correct value", () => {
      const podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getScalingInstances()).toEqual(10);
    });

    it("returns the correct default value", () => {
      const podSpec = new PodSpec();
      expect(podSpec.getScalingInstances()).toEqual(1);
    });
  });

  describe("#getVersion", () => {
    it("returns the correct value", () => {
      const podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getVersion()).toEqual("2016-08-29T01:01:01.001");
    });

    it("returns the correct default value", () => {
      const podSpec = new PodSpec();
      expect(podSpec.getVersion()).toBeFalsy();
    });
  });

  describe("#getVolumes", () => {
    it("returns the correct value", () => {
      const podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getVolumes()).toEqual(PodFixture.spec.volumes);
    });

    it("returns the correct default value", () => {
      const podSpec = new PodSpec();
      expect(podSpec.getVolumes()).toEqual([]);
    });
  });
});
