import Pod from "#PLUGINS/services/src/js/structs/Pod";
import Framework from "#PLUGINS/services/src/js/structs/Framework";
import ServiceTree from "#PLUGINS/services/src/js/structs/ServiceTree";
import MesosStateUtil from "../MesosStateUtil";

import MESOS_STATE_WITH_HISTORY from "./fixtures/MesosStateWithHistory";

let thisInstance, thisMesosState;

describe("MesosStateUtil", () => {
  describe("#getFrameworkToServicesMap", () => {
    it("maps frameworks to services", () => {
      const frameworks = [{ name: "foo", id: "foo_1" }];
      const fooFramework = new Framework({
        name: "foo",
        labels: { DCOS_PACKAGE_FRAMEWORK_NAME: "foo" }
      });
      const serviceTree = new ServiceTree({ items: [fooFramework] });

      expect(
        MesosStateUtil.getFrameworkToServicesMap(frameworks, serviceTree)
      ).toEqual({
        foo_1: fooFramework
      });
    });
  });

  describe("#getFramework", () => {
    const state = {
      frameworks: [
        {
          id: "framework-123",
          name: "test-1"
        },
        {
          id: "framework-abc",
          name: "test-2"
        }
      ]
    };

    it("returns the matching framework", () => {
      expect(MesosStateUtil.getFramework(state, "framework-123").name).toEqual(
        "test-1"
      );
    });

    it('returns the matching "completed" framework', () => {
      expect(MesosStateUtil.getFramework(state, "framework-abc").name).toEqual(
        "test-2"
      );
    });

    it("returns nothing if no matching framework was found", () => {
      expect(MesosStateUtil.getFramework(state, "unknown")).not.toBeDefined();
    });
  });

  describe("#getRunningTasksFromVirtualNetworkName", () => {
    beforeEach(() => {
      thisInstance = MesosStateUtil.getRunningTasksFromVirtualNetworkName(
        {
          frameworks: [
            { id: "foo" },
            { id: "bar" },
            { id: "baz" },
            { id: "qux" }
          ],
          tasks: [
            {
              state: "TASK_RUNNING",
              container: { network_infos: [{ name: "alpha" }] }
            },
            {
              state: "TASK_KILLED",
              container: { network_infos: [{ name: "alpha" }] }
            },
            {
              state: "TASK_RUNNING",
              container: { network_infos: [{ name: "beta" }] }
            }
          ]
        },
        "alpha"
      );
    });

    it("handles empty object well", () => {
      expect(
        MesosStateUtil.getRunningTasksFromVirtualNetworkName({}, "foo")
      ).toEqual([]);
    });

    it("throws when a null state is provided", () => {
      expect(() => {
        MesosStateUtil.getRunningTasksFromVirtualNetworkName(null, "foo");
      }).toThrow();
    });

    it("handles empty undefined well", () => {
      expect(
        MesosStateUtil.getRunningTasksFromVirtualNetworkName(undefined, "foo")
      ).toEqual([]);
    });

    it("filters running tasks that doesn't have the overlay name", () => {
      expect(thisInstance.length).toEqual(1);
    });

    it("finds running tasks from different frameworks", () => {
      expect(thisInstance).toEqual([
        {
          state: "TASK_RUNNING",
          container: { network_infos: [{ name: "alpha" }] }
        }
      ]);
    });
  });

  describe("#getPodHistoricalInstances", () => {
    const state = MESOS_STATE_WITH_HISTORY;

    it("returns only pod-related tasks", () => {
      const pod = new Pod({ id: "/pod-p0" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances.length).toEqual(2);
      expect(instances[0].id).toEqual("pod-p0.instance-inst-a1");
      expect(instances[1].id).toEqual("pod-p0.instance-inst-a2");
    });

    it("adds `containerID` property on containers", () => {
      const pod = new Pod({ id: "/pod-p1" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances[0].containers[0].containerId).toEqual(
        "pod-p1.instance-inst-a1.container-c1"
      );
    });

    it("adds `status` property on containers", () => {
      const pod = new Pod({ id: "/pod-p1" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances[0].containers[0].status).toEqual("TASK_FINISHED");
    });

    it("adds `lastChanged` property on containers", () => {
      const pod = new Pod({ id: "/pod-p1" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances[0].containers[0].lastChanged).toEqual(1008 * 1000);
    });

    it("adds `lastUpdated` property on containers", () => {
      const pod = new Pod({ id: "/pod-p1" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances[0].containers[0].lastUpdated).toEqual(1008 * 1000);
    });

    it("summarizes resources", () => {
      const pod = new Pod({ id: "/pod-p0" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances.length).toEqual(2);
      expect(instances[0].resources).toEqual({
        cpus: 0.4,
        mem: 48,
        disk: 16,
        gpus: 0
      });
      expect(instances[1].resources).toEqual({
        cpus: 0.1,
        mem: 16,
        disk: 0,
        gpus: 1
      });
    });

    it("picks the latest timestamp for lastChanged", () => {
      const pod = new Pod({ id: "/pod-p0" });
      const instances = MesosStateUtil.getPodHistoricalInstances(state, pod);

      expect(instances.length).toEqual(2);
      expect(instances[0].lastChanged).toEqual(1006 * 1000);
      expect(instances[0].lastUpdated).toEqual(1006 * 1000);
      expect(instances[1].lastChanged).toEqual(1007 * 1000);
      expect(instances[1].lastUpdated).toEqual(1007 * 1000);
    });
  });

  describe("#isPodTaskId", () => {
    it("matches pod (PodDefinition) task ID", () => {
      expect(
        MesosStateUtil.isPodTaskId("podname.instance-instancename.taskname")
      ).toBeTruthy();
    });

    it("does not match marathon (AppDefinition) task ID", () => {
      expect(
        MesosStateUtil.isPodTaskId("podname.marathon-instancename.taskname")
      ).toBeFalsy();
    });

    it("does not match anything else that looks close", () => {
      expect(
        MesosStateUtil.isPodTaskId("podname.marathon-instancename")
      ).toBeFalsy();
      expect(
        MesosStateUtil.isPodTaskId("marathon-instancename.taskname")
      ).toBeFalsy();
      expect(
        MesosStateUtil.isPodTaskId(
          "podname.marathon-instancename.taskname.junk"
        )
      ).toBeFalsy();
      expect(
        MesosStateUtil.isPodTaskId(
          "junk.podname.marathon-instancename.taskname"
        )
      ).toBeFalsy();
    });
  });

  describe("#decomposePodTaskId", () => {
    it("decomposes task id into parts", () => {
      expect(
        MesosStateUtil.decomposePodTaskId(
          "failing-pod.instance-c4a70195-5aaa-11e9-bc3e-5abede31217b.container-1.8"
        )
      ).toEqual({
        podID: "failing-pod",
        instanceID: "c4a70195-5aaa-11e9-bc3e-5abede31217b",
        taskName: "container-1"
      });
    });
  });

  describe("#getHostResourcesByFramework", () => {
    beforeEach(() => {
      thisMesosState = {
        executors: [
          {
            agent_id: {
              value: "slave-uid"
            },
            name: "spark",
            framework_id: "marathon_1",
            id: "spark__1",
            resources: [
              {
                name: "cpus",
                type: "SCALAR",
                scalar: {
                  value: 0.5
                }
              },
              {
                name: "mem",
                type: "SCALAR",
                scalar: {
                  value: 256
                }
              },
              {
                name: "disk",
                type: "SCALAR",
                scalar: {
                  value: 100
                }
              }
            ]
          }
        ],
        tasks: [
          {
            name: "spark",
            framework_id: "marathon_1",
            id: "spark.1",
            slave_id: "slave-uid",
            resources: { cpus: 1, mem: 128, disk: 100 }
          },
          {
            name: "spark",
            framework_id: "marathon_1",
            id: "spark.2",
            slave_id: "slave-uid",
            resources: { cpus: 1, mem: 128, disk: 100 }
          },
          {
            name: "alpha",
            framework_id: "marathon_2",
            id: "alpha.2",
            slave_id: "slave-uid",
            resources: { cpus: 0.5, mem: 256, disk: 150 }
          },
          {
            name: "nginx",
            framework_id: "marathon_3",
            id: "nginx.1",
            slave_id: "slave-uid",
            resources: { cpus: 1, mem: 128, disk: 100 }
          }
        ]
      };
    });

    it("aggregates resources by framework", () => {
      expect(
        MesosStateUtil.getHostResourcesByFramework(thisMesosState)
      ).toEqual({
        "slave-uid": {
          marathon_1: {
            cpus: 2.5,
            mem: 512,
            disk: 300
          },
          marathon_2: {
            cpus: 0.5,
            mem: 256,
            disk: 150
          },
          marathon_3: {
            cpus: 1,
            mem: 128,
            disk: 100
          }
        }
      });
    });

    it("groups filtered frameworks into other", () => {
      const filteredFrameworks = ["marathon_2", "marathon_3"];
      expect(
        MesosStateUtil.getHostResourcesByFramework(
          thisMesosState,
          filteredFrameworks
        )
      ).toEqual({
        "slave-uid": {
          marathon_1: {
            cpus: 2.5,
            mem: 512,
            disk: 300
          },
          other: {
            cpus: 1.5,
            mem: 384,
            disk: 250
          }
        }
      });
    });

    it("ignores tasks on termination states", () => {
      thisMesosState.tasks.push({
        name: "spark",
        framework_id: "marathon_1",
        id: "spark.4",
        slave_id: "slave-uid",
        state: "TASK_FAILED",
        resources: { cpus: 1, mem: 128, disk: 100 }
      });
      expect(
        MesosStateUtil.getHostResourcesByFramework(thisMesosState)
      ).toEqual({
        "slave-uid": {
          marathon_1: {
            cpus: 2.5,
            mem: 512,
            disk: 300
          },
          marathon_2: {
            cpus: 0.5,
            mem: 256,
            disk: 150
          },
          marathon_3: {
            cpus: 1,
            mem: 128,
            disk: 100
          }
        }
      });
    });

    it("does not overwrite the resources of the original object", () => {
      const previousMesosState = JSON.parse(JSON.stringify(thisMesosState));
      MesosStateUtil.getHostResourcesByFramework(thisMesosState);

      expect(thisMesosState).toEqual(previousMesosState);
    });
  });
});
