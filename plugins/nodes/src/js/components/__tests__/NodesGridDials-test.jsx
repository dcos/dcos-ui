import isEqual from "lodash.isequal";
import * as React from "react";
import { shallow } from "enzyme";

import Node from "#SRC/js/structs/Node";
import NodesGridDials from "../NodesGridDials";

const mockHost = {
  id: "foo",
  active: true,
  resources: {
    cpus: 4
  },
  used_resources: {
    cpus: 2
  }
};

let thisHosts, thisInstance, thisActiveSlices;

describe("NodesGridDials", () => {
  beforeEach(() => {
    thisHosts = [
      new Node({
        ...mockHost
      })
    ];
    thisInstance = shallow(
      <NodesGridDials
        hosts={thisHosts}
        selectedResource="cpus"
        serviceColors={{}}
        resourcesByFramework={{}}
      />
    );
  });

  describe("#getServiceSlicesConfig", () => {
    beforeEach(() => {
      thisInstance = shallow(
        <NodesGridDials
          hosts={thisHosts}
          selectedResource="disk"
          serviceColors={{}}
          resourcesByFramework={{
            foo: {
              cpus: 1,
              mem: 256
            }
          }}
        />
      );
    });

    it("returns 0 when no resource is in use", () => {
      const slice = thisInstance
        .instance()
        .getServiceSlicesConfig(thisHosts[0])[0];
      expect(slice.percentage).toEqual(0);
    });
  });

  describe("#getActiveSliceData", () => {
    beforeEach(() => {
      thisActiveSlices = thisInstance
        .instance()
        .getActiveSliceData(thisHosts[0]);
    });

    it("returns an object", () => {
      expect(typeof thisActiveSlices).toEqual("object");
    });

    it("contains a data property which is an array", () => {
      expect(Array.isArray(thisActiveSlices.data)).toEqual(true);
    });

    it("contains a usedPercentage property which is a number", () => {
      expect(typeof thisActiveSlices.usedPercentage).toEqual("number");
    });

    it("contains an unused resources slice", () => {
      const slice = thisActiveSlices.data.find(
        datum => datum.name === "Unused"
      );
      expect(typeof slice).toEqual("object");
    });

    it("uses gray for the unused slice", () => {
      const slice = thisActiveSlices.data.find(
        datum => datum.name === "Unused"
      );
      expect(slice.colorIndex).toEqual("unused");
    });
  });

  describe("#getInactiveSliceData", () => {
    it("uses the correct color", () => {
      const inactiveSlice = thisInstance.instance().getInactiveSliceData();
      expect(inactiveSlice[0].colorIndex).toEqual(2);
    });

    it("uses 100% of the dial", () => {
      const inactiveSlice = thisInstance.instance().getInactiveSliceData();
      expect(inactiveSlice[0].percentage).toEqual(100);
    });
  });

  describe("#getDialConfig", () => {
    it("returns different configurations depending on the active parameter", () => {
      let host = {
        ...thisHosts[0]
      };
      host.active = true;
      const config1 = thisInstance.instance().getDialConfig(new Node(host));

      host = {
        ...thisHosts[0]
      };
      host.active = false;
      const config2 = thisInstance.instance().getDialConfig(new Node(host));

      expect(isEqual(config1, config2)).toEqual(false);
    });
  });

  describe("#render", () => {
    it("renders one chart", () => {
      expect(thisInstance.find(".chart").length).toBe(1);
    });

    it("renders the correct number of charts", () => {
      const host = {
        ...thisHosts[0]
      };
      host.id = "bar";
      thisHosts.push(new Node(host));
      thisInstance = shallow(
        <NodesGridDials
          hosts={thisHosts}
          selectedResource="cpus"
          serviceColors={{}}
          resourcesByFramework={{}}
        />
      );

      expect(thisInstance.find(".chart").length).toBe(2);
    });
  });
});
