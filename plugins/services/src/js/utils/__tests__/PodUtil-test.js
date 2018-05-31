const PodUtil = require("../PodUtil");
const Pod = require("../../structs/Pod");

let thisPod;

describe("PodUtil", function() {
  beforeEach(function() {
    thisPod = new Pod({
      instances: [
        {
          id: "pod-a1",
          containers: [
            {
              name: "container-c1",
              containerId: "container-c1-id"
            },
            {
              name: "container-c2",
              containerId: "container-c2-id"
            }
          ]
        }
      ]
    });
  });

  describe("#isContainerMatchingText", function() {
    it("matches text on container name", function() {
      const instance = thisPod.getInstanceList().getItems()[0];
      const container = instance.getContainers()[0];

      expect(PodUtil.isContainerMatchingText(container, "c1")).toBeTruthy();
    });

    it("does not match wrong text on container name", function() {
      const instance = thisPod.getInstanceList().getItems()[0];
      const container = instance.getContainers()[0];

      expect(PodUtil.isContainerMatchingText(container, "c3")).toBeFalsy();
    });
  });

  describe("#isInstanceOrChildrenMatchingText", function() {
    it("matches text on instance id", function() {
      const instance = thisPod.getInstanceList().getItems()[0];

      expect(
        PodUtil.isInstanceOrChildrenMatchingText(instance, "a1")
      ).toBeTruthy();
    });

    it("matches text on container names", function() {
      const instance = thisPod.getInstanceList().getItems()[0];

      expect(
        PodUtil.isInstanceOrChildrenMatchingText(instance, "c1")
      ).toBeTruthy();
    });

    it("does not match if text is not present anywhere", function() {
      const instance = thisPod.getInstanceList().getItems()[0];

      expect(
        PodUtil.isInstanceOrChildrenMatchingText(instance, "c4")
      ).toBeFalsy();
    });
  });

  describe("#mergeHistoricalInstanceList", function() {
    it("appends new instances", function() {
      let instances = thisPod.getInstanceList();
      const historicalInstances = [
        {
          id: "pod-a2",
          containers: [
            {
              name: "container-c1",
              containerId: "container-c1"
            }
          ]
        }
      ];

      instances = PodUtil.mergeHistoricalInstanceList(
        instances,
        historicalInstances
      );

      expect(instances.getItems().length).toEqual(2);
      expect(instances.getItems()[1].get()).toEqual(historicalInstances[0]);
    });

    it("appends new containers on existing items", function() {
      let instances = thisPod.getInstanceList();
      const historicalInstances = [
        {
          id: "pod-a1",
          containers: [
            {
              name: "container-c3",
              containerId: "container-c3-id"
            }
          ]
        }
      ];

      instances = PodUtil.mergeHistoricalInstanceList(
        instances,
        historicalInstances
      );

      expect(instances.getItems().length).toEqual(1);
      expect(instances.getItems()[0].getContainers().length).toEqual(3);
      expect(
        instances
          .getItems()[0]
          .getContainers()[2]
          .get()
      ).toEqual(historicalInstances[0].containers[0]);
    });

    it("does not duplicate containers", function() {
      let instances = thisPod.getInstanceList();
      const historicalInstances = [
        {
          id: "pod-a1",
          containers: [
            {
              name: "container-c2",
              containerId: "container-c2-id"
            }
          ]
        }
      ];

      instances = PodUtil.mergeHistoricalInstanceList(
        instances,
        historicalInstances
      );

      expect(instances.getItems().length).toEqual(1);
      expect(instances.getItems()[0].getContainers().length).toEqual(2);
      expect(
        instances
          .getItems()[0]
          .getContainers()[1]
          .get()
      ).toEqual(historicalInstances[0].containers[0]);
    });
  });

  describe("#getInstanceIdFromTaskId", function() {
    it("returns instance id", function() {
      expect(
        PodUtil.getInstanceIdFromTaskId(
          "foo_bar.53678488-2775-11e8-88a0-7abb83ecf42a.container-1"
        )
      ).toEqual("foo_bar.53678488-2775-11e8-88a0-7abb83ecf42a");
    });

    it("returns an empty string", function() {
      expect(PodUtil.getInstanceIdFromTaskId("")).toEqual("");
    });
  });
});
