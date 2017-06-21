jest.dontMock("../../../../../../../src/js/components/CollapsingString");
jest.dontMock("../../../../../../../src/js/components/DetailViewHeader");
jest.dontMock("../ServiceInfo");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const Application = require("../../../structs/Application");
const ServiceInfo = require("../ServiceInfo");

describe("ServiceInfo", function() {
  const service = new Application({
    id: "/group/test",
    healthChecks: [{ path: "", protocol: "HTTP" }],
    cpus: 1,
    deployments: [],
    mem: 2048,
    disk: 0,
    tasksStaged: 0,
    tasksRunning: 2,
    tasksHealthy: 2,
    tasksUnhealthy: 0,
    instances: 2,
    labels: {
      DCOS_PACKAGE_METADATA: "eyJpbWFnZXMiOiB7ICJpY29uLXNtYWxsIjogImZvby1zbWFsbC5wbmciLCAiaWNvbi1tZWRpdW0iOiAiZm9vLW1lZGl1bS5wbmciLCAiaWNvbi1sYXJnZSI6ICJmb28tbGFyZ2UucG5nIn19"
    }
  });

  describe("#render", function() {
    beforeEach(function() {
      this.container = global.document.createElement("div");
      this.instance = ReactDOM.render(
        <ServiceInfo service={service} />,
        this.container
      );
      this.node = ReactDOM.findDOMNode(this.instance);
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("renders name", function() {
      expect(
        this.node.querySelector(".h1 .collapsing-string-full-string")
          .textContent
      ).toEqual("test");
    });

    it("renders image", function() {
      expect(this.node.querySelector(".icon img").src).toEqual("foo-large.png");
    });

    it("renders app status, not health state", function() {
      expect(
        this.node.querySelector(
          ".detail-view-header-sub-heading .media-object-item:first-child"
        ).textContent
      ).toEqual("Running");
    });

    it("renders number of running tasks", function() {
      expect(
        this.node.querySelector(
          ".detail-view-header-sub-heading .media-object-item:nth-child(2)"
        ).textContent
      ).toEqual("2 Instances");
    });
  });
});
