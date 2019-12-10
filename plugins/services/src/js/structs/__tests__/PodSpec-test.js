import PodSpec from "../PodSpec";

import PodFixture from "../../../../../../tests/_fixtures/pods/PodFixture";

describe("PodSpec", () => {
  describe("#constructor", () => {
    it("creates instances", () => {
      const instance = new PodSpec(Object.assign({}, PodFixture.spec));

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

  describe("#getContainerCount", () => {
    it("returns the correct value", () => {
      const podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getContainerCount()).toEqual(2);
    });

    it("returns the correct default value", () => {
      const podSpec = new PodSpec();
      expect(podSpec.getContainerCount()).toEqual(0);
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
        disk: 0
      });
    });

    it("returns the correct default value", () => {
      const podSpec = new PodSpec();
      expect(podSpec.getResources()).toEqual({
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0
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

  describe("#getEnvironment", () => {
    it("returns the correct value", () => {
      const podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getEnvironment()).toEqual(PodFixture.spec.environment);
    });

    it("returns the correct default value", () => {
      const podSpec = new PodSpec();
      expect(podSpec.getEnvironment()).toEqual({});
    });
  });

  describe("#getUser", () => {
    it("returns the correct value", () => {
      const podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getUser()).toEqual("root");
    });

    it("returns the correct default value", () => {
      const podSpec = new PodSpec();
      expect(podSpec.getUser()).toBeFalsy();
    });
  });

  describe("#getScaling", () => {
    it("returns the correct value", () => {
      const podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getScaling()).toEqual(PodFixture.spec.scaling);
    });

    it("returns the correct default value", () => {
      const podSpec = new PodSpec();
      expect(podSpec.getScaling()).toEqual({});
    });
  });

  describe("#getSecrets", () => {
    it("returns the correct value", () => {
      const podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getSecrets()).toEqual(PodFixture.spec.secrets);
    });

    it("returns the correct default value", () => {
      const podSpec = new PodSpec();
      expect(podSpec.getSecrets()).toEqual({});
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

  describe("#getNetworks", () => {
    it("returns the correct value", () => {
      const podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getNetworks()).toEqual(PodFixture.spec.networks);
    });

    it("returns the correct default value", () => {
      const podSpec = new PodSpec();
      expect(podSpec.getNetworks()).toEqual([]);
    });
  });
});
