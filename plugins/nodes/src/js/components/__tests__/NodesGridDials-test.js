jest.dontMock("../../../../../../src/js/components/CollapsingString");
jest.dontMock("../../../../../../src/js/utils/Util");
jest.dontMock("../../../../../../src/js/utils/ResourcesUtil");
jest.dontMock("../NodesGridDials");

const deepEqual = require("deep-equal");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const NodesGridDials = require("../NodesGridDials");
const ResourcesUtil = require("../../../../../../src/js/utils/ResourcesUtil");
const Node = require("../../../../../../src/js/structs/Node");

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

describe("NodesGridDials", function() {
  beforeEach(function() {
    this.hosts = [new Node(Object.assign({}, mockHost))];
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <NodesGridDials
        hosts={this.hosts}
        selectedResource="cpus"
        serviceColors={{}}
        showServices={false}
        resourcesByFramework={{}}
      />,
      this.container
    );
  });
  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#getActiveSliceData", function() {
    beforeEach(function() {
      this.resourceColor = ResourcesUtil.getResourceColor("cpus");
      this.resourceLabel = ResourcesUtil.getResourceLabel("cpus");
      this.activeSlices = this.instance.getActiveSliceData(this.hosts[0]);
    });

    it("returns an object", function() {
      expect(typeof this.activeSlices).toEqual("object");
    });

    it("contains a data property which is an array", function() {
      expect(Array.isArray(this.activeSlices.data)).toEqual(true);
    });

    it("contains a usedPercentage property which is a number", function() {
      expect(typeof this.activeSlices.usedPercentage).toEqual("number");
    });

    it("contains a slice for the used resource", function() {
      var slice = this.activeSlices.data.find(datum => {
        return datum.name === this.resourceLabel;
      });
      expect(typeof slice).toEqual("object");
    });

    it("the used slice uses the correct color", function() {
      var slice = this.activeSlices.data.find(datum => {
        return datum.name === this.resourceLabel;
      });
      expect(slice.colorIndex).toEqual(this.resourceColor);
    });

    it("the used slice contains the correct percentage", function() {
      var slice = this.activeSlices.data.find(datum => {
        return datum.name === this.resourceLabel;
      });
      expect(slice.percentage).toEqual(50);
    });

    it("contains an unused resources slice", function() {
      var slice = this.activeSlices.data.find(function(datum) {
        return datum.name === "Unused";
      });
      expect(typeof slice).toEqual("object");
    });

    it("the color for the unused slice should be gray", function() {
      var slice = this.activeSlices.data.find(function(datum) {
        return datum.name === "Unused";
      });
      expect(slice.colorIndex).toEqual("unused");
    });

    it("the percentage of the unused slice should be the remaining of the passed percentage", function() {
      var slice = this.activeSlices.data.find(function(datum) {
        return datum.name === "Unused";
      });
      expect(slice.percentage).toEqual(50);
    });
  });

  describe("#getInactiveSliceData", function() {
    it("should use the correct color", function() {
      var inactiveSlice = this.instance.getInactiveSliceData();
      expect(inactiveSlice[0].colorIndex).toEqual(2);
    });

    it("should use 100% of the dial", function() {
      var inactiveSlice = this.instance.getInactiveSliceData();
      expect(inactiveSlice[0].percentage).toEqual(100);
    });
  });

  describe("#getDialConfig", function() {
    beforeEach(function() {
      this.resourceType = ResourcesUtil.cpus;
    });

    it("returns different configurations depending on the active parameter", function() {
      let host = Object.assign({}, this.hosts[0]);
      host.active = true;
      var config1 = this.instance.getDialConfig(new Node(host));

      host = Object.assign({}, this.hosts[0]);
      host.active = false;
      var config2 = this.instance.getDialConfig(new Node(host));

      expect(deepEqual(config1, config2)).toEqual(false);
    });
  });

  describe("#render", function() {
    it("render one chart", function() {
      var elements = TestUtils.scryRenderedDOMComponentsWithClass(
        this.instance,
        "chart"
      );

      expect(elements.length).toEqual(1);
    });

    it("render the correct number of charts", function() {
      const host = Object.assign({}, this.hosts[0]);
      host.id = "bar";
      this.hosts.push(new Node(host));
      this.instance = ReactDOM.render(
        <NodesGridDials
          hosts={this.hosts}
          selectedResource="cpus"
          serviceColors={{}}
          showServices={false}
          resourcesByFramework={{}}
        />,
        this.container
      );

      var elements = TestUtils.scryRenderedDOMComponentsWithClass(
        this.instance,
        "chart"
      );

      expect(elements.length).toEqual(2);
    });
  });
});
