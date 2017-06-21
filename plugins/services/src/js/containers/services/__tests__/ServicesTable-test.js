jest.dontMock("../../../../../../../src/js/components/CollapsingString");
jest.dontMock("../../../constants/HealthStatus");
jest.dontMock("../ServicesTable");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const ServicesTable = require("../ServicesTable");
const Application = require("../../../structs/Application");

describe("ServicesTable", function() {
  const healthyService = new Application({
    healthChecks: [{ path: "", protocol: "HTTP" }],
    cpus: 1,
    instances: 1,
    mem: 2048,
    disk: 0,
    tasksStaged: 0,
    tasksRunning: 2,
    tasksHealthy: 2,
    tasksUnhealthy: 0
  });

  beforeEach(function() {
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(<ServicesTable />, this.container);
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#renderStats", function() {
    it("should render resources/stats cpus property", function() {
      var cpusCell = ReactDOM.render(
        this.instance.renderStats("cpus", healthyService),
        this.container
      );

      expect(ReactDOM.findDOMNode(cpusCell).textContent).toEqual("1");
    });

    it("should render resources/stats mem property", function() {
      var memCell = ReactDOM.render(
        this.instance.renderStats("mem", healthyService),
        this.container
      );

      expect(ReactDOM.findDOMNode(memCell).textContent).toEqual("2 GiB");
    });

    it("should render resources/stats disk property", function() {
      var disksCell = ReactDOM.render(
        this.instance.renderStats("disk", healthyService),
        this.container
      );

      expect(ReactDOM.findDOMNode(disksCell).textContent).toEqual("0 B");
    });

    it("should render sum of resources/stats cpus property", function() {
      const application = new Application({
        healthChecks: [{ path: "", protocol: "HTTP" }],
        cpus: 1,
        instances: 2,
        mem: 2048,
        disk: 0,
        tasksStaged: 0,
        tasksRunning: 2,
        tasksHealthy: 2,
        tasksUnhealthy: 0
      });

      var cpusCell = ReactDOM.render(
        this.instance.renderStats("cpus", application),
        this.container
      );

      expect(ReactDOM.findDOMNode(cpusCell).textContent).toEqual("2");
    });

    it("should render sum of resources/stats mem property", function() {
      const application = new Application({
        healthChecks: [{ path: "", protocol: "HTTP" }],
        cpus: 1,
        instances: 2,
        mem: 2048,
        disk: 0,
        tasksStaged: 0,
        tasksRunning: 2,
        tasksHealthy: 2,
        tasksUnhealthy: 0
      });

      var memCell = ReactDOM.render(
        this.instance.renderStats("mem", application),
        this.container
      );

      expect(ReactDOM.findDOMNode(memCell).textContent).toEqual("4 GiB");
    });

    it("should render sum of resources/stats disk property", function() {
      const application = new Application({
        healthChecks: [{ path: "", protocol: "HTTP" }],
        cpus: 1,
        instances: 2,
        mem: 2048,
        disk: 0,
        tasksStaged: 0,
        tasksRunning: 2,
        tasksHealthy: 2,
        tasksUnhealthy: 0
      });

      var disksCell = ReactDOM.render(
        this.instance.renderStats("disk", application),
        this.container
      );

      expect(ReactDOM.findDOMNode(disksCell).textContent).toEqual("0 B");
    });
  });
});
