import { shallow } from "enzyme";
// Explicitly mock for react-intl
jest.mock("../../../components/modals/ServiceActionDisabledModal");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const renderer = require("react-test-renderer");
const ServicesTable = require("../ServicesTable");
const Application = require("../../../structs/Application");
const ServiceStatus = require("../../../constants/ServiceStatus");

let thisInstance;

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
    thisInstance = shallow(<ServicesTable.WrappedComponent />);
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
      var cpusCell = shallow(
        thisInstance.instance().renderStats("cpus", healthyService)
      );

      expect(cpusCell.text()).toEqual("1");
    });

    it("renders resources/stats gpus property", function() {
      var gpusCell = shallow(
        thisInstance.instance().renderStats("gpus", healthyService)
      );

      expect(gpusCell.text()).toEqual("1");
    });

    it("renders resources/stats mem property", function() {
      var memCell = shallow(
        thisInstance.instance().renderStats("mem", healthyService)
      );

      expect(memCell.text()).toEqual("2 GiB");
    });

    it("renders resources/stats disk property", function() {
      var disksCell = shallow(
        thisInstance.instance().renderStats("disk", healthyService)
      );

      expect(disksCell.text()).toEqual("0 B");
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

      var cpusCell = shallow(
        thisInstance.instance().renderStats("cpus", application)
      );

      expect(cpusCell.text()).toEqual("2");
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

      var gpusCell = shallow(
        thisInstance.instance().renderStats("gpus", application)
      );

      expect(gpusCell.text()).toEqual("2");
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

      var memCell = shallow(
        thisInstance.instance().renderStats("mem", application)
      );

      expect(memCell.text()).toEqual("4 GiB");
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

      var disksCell = shallow(
        thisInstance.instance().renderStats("disk", application)
      );

      expect(disksCell.text()).toEqual("0 B");
    });
  });

  describe("#renderRegions", function() {
    const renderRegions =
      ServicesTable.WrappedComponent.prototype.renderRegions;
    let mockService;
    beforeEach(function() {
      mockService = {
        getRegions: jest.fn()
      };
    });

    it("renders with no regions", function() {
      mockService.getRegions.mockReturnValue([]);

      expect(
        renderer.create(renderRegions(null, mockService)).toJSON()
      ).toMatchSnapshot();
    });

    it("renders with one region", function() {
      mockService.getRegions.mockReturnValue(["aws/eu-central-1"]);

      expect(
        renderer.create(renderRegions(null, mockService)).toJSON()
      ).toMatchSnapshot();
    });

    it("renders with multiple regions", function() {
      mockService.getRegions.mockReturnValue(["aws/eu-central-1", "dc-east"]);

      expect(
        renderer.create(renderRegions(null, mockService)).toJSON()
      ).toMatchSnapshot();
    });
  });
});
