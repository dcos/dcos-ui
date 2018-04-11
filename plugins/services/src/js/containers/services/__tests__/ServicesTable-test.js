// Explicitly mock for react-intl
jest.mock("../../../components/modals/ServiceActionDisabledModal");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const renderer = require("react-test-renderer");
const ServicesTable = require("../ServicesTable");
const Application = require("../../../structs/Application");
const ServiceStatus = require("../../../constants/ServiceStatus");

let thisContainer, thisInstance;

describe("ServicesTable", function() {
  const healthyService = new Application({
    healthChecks: [{ path: "", protocol: "HTTP" }],
    cpus: 1,
    gpus: 1,
    instances: 1,
    mem: 2048,
    disk: 0,
    tasksStaged: 0,
    tasksRunning: 2,
    tasksHealthy: 2,
    tasksUnhealthy: 0
  });

  beforeEach(function() {
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <ServicesTable.WrappedComponent />,
      thisContainer
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#renderStatus", function() {
    const renderStatus = ServicesTable.WrappedComponent.prototype.renderStatus;
    let mockService;
    beforeEach(function() {
      mockService = {
        getStatus: jest.fn(),
        getServiceStatus: jest.fn(),
        getQueue: jest.fn(),
        getInstancesCount: jest.fn().mockReturnValue(10),
        getRunningInstancesCount: jest.fn().mockReturnValue(3)
      };
    });

    it("renders with running status", function() {
      mockService.getStatus.mockReturnValue(ServiceStatus.RUNNING.displayName);

      expect(
        renderer.create(renderStatus(null, mockService)).toJSON()
      ).toMatchSnapshot();
    });

    it("renders with stopped status", function() {
      mockService.getStatus.mockReturnValue(ServiceStatus.STOPPED.displayName);

      expect(
        renderer.create(renderStatus(null, mockService)).toJSON()
      ).toMatchSnapshot();
    });

    it("renders with deploying status", function() {
      mockService.getStatus.mockReturnValue(
        ServiceStatus.DEPLOYING.displayName
      );

      expect(
        renderer.create(renderStatus(null, mockService)).toJSON()
      ).toMatchSnapshot();
    });

    it("renders with not available status", function() {
      mockService.getStatus.mockReturnValue(ServiceStatus.NA.displayName);

      expect(
        renderer.create(renderStatus(null, mockService)).toJSON()
      ).toMatchSnapshot();
    });
  });

  describe("#renderStats", function() {
    it("renders resources/stats cpus property", function() {
      var cpusCell = ReactDOM.render(
        thisInstance.renderStats("cpus", healthyService),
        thisContainer
      );

      expect(ReactDOM.findDOMNode(cpusCell).textContent).toEqual("1");
    });

    it("renders resources/stats gpus property", function() {
      var gpusCell = ReactDOM.render(
        thisInstance.renderStats("gpus", healthyService),
        thisContainer
      );

      expect(ReactDOM.findDOMNode(gpusCell).textContent).toEqual("1");
    });

    it("renders resources/stats mem property", function() {
      var memCell = ReactDOM.render(
        thisInstance.renderStats("mem", healthyService),
        thisContainer
      );

      expect(ReactDOM.findDOMNode(memCell).textContent).toEqual("2 GiB");
    });

    it("renders resources/stats disk property", function() {
      var disksCell = ReactDOM.render(
        thisInstance.renderStats("disk", healthyService),
        thisContainer
      );

      expect(ReactDOM.findDOMNode(disksCell).textContent).toEqual("0 B");
    });

    it("renders sum of resources/stats cpus property", function() {
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
        thisInstance.renderStats("cpus", application),
        thisContainer
      );

      expect(ReactDOM.findDOMNode(cpusCell).textContent).toEqual("2");
    });

    it("renders sum of resources/stats gpus property", function() {
      const application = new Application({
        healthChecks: [{ path: "", protocol: "HTTP" }],
        cpus: 1,
        gpus: 1,
        instances: 2,
        mem: 2048,
        disk: 0,
        tasksStaged: 0,
        tasksRunning: 2,
        tasksHealthy: 2,
        tasksUnhealthy: 0
      });

      var gpusCell = ReactDOM.render(
        thisInstance.renderStats("gpus", application),
        thisContainer
      );

      expect(ReactDOM.findDOMNode(gpusCell).textContent).toEqual("2");
    });

    it("renders sum of resources/stats mem property", function() {
      const application = new Application({
        healthChecks: [{ path: "", protocol: "HTTP" }],
        cpus: 1,
        gpus: 1,
        instances: 2,
        mem: 2048,
        disk: 0,
        tasksStaged: 0,
        tasksRunning: 2,
        tasksHealthy: 2,
        tasksUnhealthy: 0
      });

      var memCell = ReactDOM.render(
        thisInstance.renderStats("mem", application),
        thisContainer
      );

      expect(ReactDOM.findDOMNode(memCell).textContent).toEqual("4 GiB");
    });

    it("renders sum of resources/stats disk property", function() {
      const application = new Application({
        healthChecks: [{ path: "", protocol: "HTTP" }],
        cpus: 1,
        gpus: 1,
        instances: 2,
        mem: 2048,
        disk: 0,
        tasksStaged: 0,
        tasksRunning: 2,
        tasksHealthy: 2,
        tasksUnhealthy: 0
      });

      var disksCell = ReactDOM.render(
        thisInstance.renderStats("disk", application),
        thisContainer
      );

      expect(ReactDOM.findDOMNode(disksCell).textContent).toEqual("0 B");
    });
  });
});
