import Framework from "../Framework";

import MesosStateStore from "#SRC/js/stores/MesosStateStore";

describe("Framework", () => {
  describe("#getNodeIDs", () => {
    it("returns ids of nodes the service is running on", () => {
      const framework = new Framework({ slave_ids: [1, 2, 3] });
      expect(framework.getNodeIDs()).toEqual([1, 2, 3]);
    });
  });

  describe("#getResourceID", () => {
    it("returns the correct resource id when there is no name", () => {
      const framework = new Framework();
      expect(framework.getResourceID()).toEqual("dcos:adminrouter:service:");
    });

    it("returns the correct resource id when there is a name", () => {
      const framework = new Framework({ name: "foo" });
      expect(framework.getResourceID()).toEqual("dcos:adminrouter:service:foo");
    });

    it("returns the correct resource id when name is complex", () => {
      const framework = new Framework({ name: "foo-adsf-2" });
      expect(framework.getResourceID()).toEqual(
        "dcos:adminrouter:service:foo-adsf-2"
      );
    });
  });

  describe("#getUsageStats", () => {
    it("returns an object containing the value for the resource", () => {
      const framework = new Framework({
        used_resources: { cpus: 1, mem: 512 },
      });
      expect(framework.getUsageStats("cpus").value).toEqual(1);
      expect(framework.getUsageStats("mem").value).toEqual(512);
    });
  });

  describe("#getPackageName", () => {
    it("returns correct name", () => {
      const service = new Framework({
        id: "/test/framework",
        labels: {
          DCOS_PACKAGE_NAME: "Framework",
        },
      });

      expect(service.getPackageName()).toEqual("Framework");
    });

    it("returns undefined if package name is undefined", () => {
      const service = new Framework({
        id: "/test/framework",
      });

      expect(service.getPackageName()).toEqual(undefined);
    });
  });

  describe("#getVersion", () => {
    it("returns correct version", () => {
      const service = new Framework({
        id: "/test/framework",
        labels: {
          DCOS_PACKAGE_VERSION: "1",
        },
      });

      expect(service.getVersion()).toEqual("1");
    });

    it("returns undefined if package version is undefined", () => {
      const service = new Framework({
        id: "/test/framework",
      });

      expect(service.getVersion()).toEqual(undefined);
    });
  });

  describe("#getFrameworkName", () => {
    it("returns correct name", () => {
      const service = new Framework({
        id: "/test/framework",
        labels: {
          DCOS_PACKAGE_FRAMEWORK_NAME: "group/Framework",
        },
      });

      expect(service.getFrameworkName()).toEqual("group/Framework");
    });

    it("returns undefined if package name is undefined", () => {
      const service = new Framework({
        id: "/test/framework",
      });

      expect(service.getFrameworkName()).toEqual(undefined);
    });
  });

  describe("#getTasksSummary", () => {
    it("returns correct task summary", () => {
      const service = new Framework({
        instances: 2,
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0,
      });

      expect(service.getTasksSummary()).toEqual({
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0,
        tasksUnknown: 0,
        tasksOverCapacity: 0,
      });
    });

    it("returns correct task summary for overcapacity", () => {
      const service = new Framework({
        instances: 2,
        tasksStaged: 0,
        tasksRunning: 4,
        tasksHealthy: 2,
        tasksUnhealthy: 0,
      });

      expect(service.getTasksSummary()).toEqual({
        tasksStaged: 0,
        tasksRunning: 4,
        tasksHealthy: 2,
        tasksUnhealthy: 0,
        tasksUnknown: 2,
        tasksOverCapacity: 2,
      });
    });

    it("returns correct task summary with framework data", () => {
      const service = new Framework({
        instances: 2,
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0,
        TASK_RUNNING: 1,
      });

      expect(service.getTasksSummary()).toEqual({
        tasksStaged: 0,
        tasksRunning: 2,
        tasksHealthy: 1,
        tasksUnhealthy: 0,
        tasksUnknown: 1,
        tasksOverCapacity: 0,
      });
    });

    it("aggregates the right number of tasks", () => {
      const getTasksByService = MesosStateStore.getTasksByService;
      MesosStateStore.getTasksByService = () => [
        {
          id: "/fake_1",
          isStartedByMarathon: true,
          state: "TASK_RUNNING",
          resources: { cpus: 0.2, mem: 300, gpus: 0, disk: 0 },
        },
        {
          id: "/fake_2",
          state: "TASK_RUNNING",
          statuses: [
            {
              healthy: true,
            },
          ],
          resources: { cpus: 0.8, mem: 700, gpus: 0, disk: 0 },
        },
        {
          id: "/fake_2",
          state: "TASK_RUNNING",
          statuses: [
            {
              healthy: false,
            },
          ],
          resources: { cpus: 0.8, mem: 700, gpus: 0, disk: 0 },
        },
        {
          id: "/fake_3",
          state: "TASK_FINISHED",
          statuses: [
            {
              healthy: false,
            },
          ],
          resources: { cpus: 0.8, mem: 700, gpus: 0, disk: 0 },
        },
      ];

      const service = new Framework({
        instances: 1,
        TASK_RUNNING: 2,
        tasksHealthy: 1,
        tasksRunning: 1,
        tasksStaged: 0,
        tasksUnhealthy: 0,
        cpus: 1,
        mem: 1000,
      });

      expect(service.getTasksSummary()).toEqual({
        tasksHealthy: 2,
        tasksRunning: 3,
        tasksStaged: 0,
        tasksUnhealthy: 1,
        tasksOverCapacity: 0,
        tasksUnknown: 0,
      });

      MesosStateStore.getTasksByService = getTasksByService;
    });
  });

  describe("#getInstancesCount", () => {
    it("returns correct instances", () => {
      const service = new Framework({
        instances: 1,
      });

      expect(service.getInstancesCount()).toEqual(1);
    });

    it("returns correct instances with Framework data", () => {
      const service = new Framework({
        instances: 1,
        TASK_RUNNING: 1,
      });

      expect(service.getInstancesCount()).toEqual(1);
    });
  });

  describe("#getResources", () => {
    it("returns only scheduler resources when used_resources are empty", () => {
      const service = new Framework({
        used_resources: null,
        cpus: 0.2,
        mem: 300,
        gpus: 1,
        disk: 10,
      });

      expect(service.getResources()).toEqual({
        cpus: 0.2,
        mem: 300,
        gpus: 1,
        disk: 10,
      });
    });

    it("returns allocated resources + scheduler resources", () => {
      const service = new Framework({
        id: "/blip",
        used_resources: { cpus: 1, mem: 1024, gpus: 0, disk: 10 },
        cpus: 0.2,
        mem: 300,
        gpus: 1,
        disk: 10,
      });

      expect(service.getResources()).toEqual({
        cpus: 1.2,
        mem: 1324,
        gpus: 1,
        disk: 20,
      });
    });
  });
});
