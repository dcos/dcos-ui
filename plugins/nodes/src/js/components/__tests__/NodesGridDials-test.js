import deepEqual from "deep-equal";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { shallow } from "enzyme";

const NodesGridDials = require("../NodesGridDials");
const ResourcesUtil = require("#SRC/js/utils/ResourcesUtil");
const Node = require("#SRC/js/structs/Node");

var mockHost = {
  id: "foo",
  active: true,
  resources: {
    cpus: 4
  },
  used_resources: {
    cpus: 2
  }
};

let thisHosts,
  thisInstance,
  thisResourceColor,
  thisResourceLabel,
  thisActiveSlices;

describe("NodesGridDials", function() {
  beforeEach(function() {
    thisHosts = [new Node(Object.assign({}, mockHost))];
    thisInstance = shallow(
      <NodesGridDials
        hosts={thisHosts}
        selectedResource="cpus"
        serviceColors={{}}
        showServices={false}
        resourcesByFramework={{}}
      />
    );
  });

  describe("#getServiceSlicesConfig", function() {
    beforeEach(function() {
      thisInstance = shallow(
        <NodesGridDials
          hosts={thisHosts}
          selectedResource="disk"
          serviceColors={{}}
          showServices={false}
          resourcesByFramework={{
            foo: {
              cpus: 1,
              mem: 256
            }
          }}
        />
      );
    });

    it("returns 0 when no resource is in use", function() {
      const slice = thisInstance
        .instance()
        .getServiceSlicesConfig(thisHosts[0])[0];
      expect(slice.percentage).toEqual(0);
    });
  });

  describe("#getActiveSliceData", function() {
    beforeEach(function() {
      thisResourceColor = ResourcesUtil.getResourceColor("cpus");
      thisResourceLabel = ResourcesUtil.getResourceLabel("cpus");
      thisActiveSlices = thisInstance
        .instance()
        .getActiveSliceData(thisHosts[0]);
    });

    it("returns an object", function() {
      expect(typeof thisActiveSlices).toEqual("object");
    });

    it("contains a data property which is an array", function() {
      expect(Array.isArray(thisActiveSlices.data)).toEqual(true);
    });

    it("contains a usedPercentage property which is a number", function() {
      expect(typeof thisActiveSlices.usedPercentage).toEqual("number");
    });

    it("contains a slice for the used resource", function() {
      var slice = thisActiveSlices.data.find(datum => {
        return datum.name === thisResourceLabel;
      });
      expect(typeof slice).toEqual("object");
    });

    it("uses the correct color", function() {
      var slice = thisActiveSlices.data.find(datum => {
        return datum.name === thisResourceLabel;
      });
      expect(slice.colorIndex).toEqual(thisResourceColor);
    });

    it("calculate the active percentage", function() {
      var slice = thisActiveSlices.data.find(datum => {
        return datum.name === thisResourceLabel;
      });
      expect(slice.percentage).toEqual(50);
    });

    it("contains an unused resources slice", function() {
      var slice = thisActiveSlices.data.find(function(datum) {
        return datum.name === "Unused";
      });
      expect(typeof slice).toEqual("object");
    });

    it("uses gray for the unused slice", function() {
      var slice = thisActiveSlices.data.find(function(datum) {
        return datum.name === "Unused";
      });
      expect(slice.colorIndex).toEqual("unused");
    });

    it("calculates the used percentage", function() {
      var slice = thisActiveSlices.data.find(function(datum) {
        return datum.name === "Unused";
      });
      expect(slice.percentage).toEqual(50);
    });
  });

  describe("#getInactiveSliceData", function() {
    it("uses the correct color", function() {
      var inactiveSlice = thisInstance.instance().getInactiveSliceData();
      expect(inactiveSlice[0].colorIndex).toEqual(2);
    });

    it("uses 100% of the dial", function() {
      var inactiveSlice = thisInstance.instance().getInactiveSliceData();
      expect(inactiveSlice[0].percentage).toEqual(100);
    });
  });

  describe("#getDialConfig", function() {
    it("returns different configurations depending on the active parameter", function() {
      let host = Object.assign({}, thisHosts[0]);
      host.active = true;
      var config1 = thisInstance.instance().getDialConfig(new Node(host));

      host = Object.assign({}, thisHosts[0]);
      host.active = false;
      var config2 = thisInstance.instance().getDialConfig(new Node(host));

      expect(deepEqual(config1, config2)).toEqual(false);
    });
  });

  describe("#render", function() {
    it("renders one chart", function() {
      expect(thisInstance.find(".chart").length).toBe(1);
    });

    it("renders the correct number of charts", function() {
      const host = Object.assign({}, thisHosts[0]);
      host.id = "bar";
      thisHosts.push(new Node(host));
      thisInstance = shallow(
        <NodesGridDials
          hosts={thisHosts}
          selectedResource="cpus"
          serviceColors={{}}
          showServices={false}
          resourcesByFramework={{}}
        />
      );

      expect(thisInstance.find(".chart").length).toBe(2);
    });
  });
});
