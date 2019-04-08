import { regionRenderer } from "../../../columns/ServicesTableRegionColumn";
import { cpuRenderer } from "../../../columns/ServicesTableCPUColumn";
import { memRenderer } from "../../../columns/ServicesTableMemColumn";
import { diskRenderer } from "../../../columns/ServicesTableDiskColumn";
import { gpuRenderer } from "../../../columns/ServicesTableGPUColumn";

// Explicitly mock for react-intl
jest.mock("../../../components/modals/ServiceActionDisabledModal");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const renderer = require("react-test-renderer");
const Application = require("../../../structs/Application");

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

  describe("#renderStats", function() {
    it("renders resources/stats cpus property", function() {
      var cpusCell = renderer.create(cpuRenderer(healthyService)).toJSON();

      expect(cpusCell).toMatchSnapshot();
    });

    it("renders resources/stats gpus property", function() {
      var gpusCell = renderer.create(gpuRenderer(healthyService)).toJSON();

      expect(gpusCell).toMatchSnapshot();
    });

    it("renders resources/stats mem property", function() {
      var memCell = renderer.create(memRenderer(healthyService)).toJSON();

      expect(memCell).toMatchSnapshot();
    });

    it("renders resources/stats disk property", function() {
      var disksCell = renderer.create(diskRenderer(healthyService)).toJSON();

      expect(disksCell).toMatchSnapshot();
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
        tasksUnhealthy: 0,
        getResources: jest.fn()
      });

      application.getResources.mockReturnValue({ cpus: application.cpus });
      var cpusCell = renderer.create(cpuRenderer(application)).toJSON();

      expect(cpusCell).toMatchSnapshot();
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
        tasksUnhealthy: 0,
        getResources: jest.fn()
      });

      application.getResources.mockReturnValue({ gpus: application.gpus });
      var gpusCell = renderer.create(gpuRenderer(application)).toJSON();

      expect(gpusCell).toMatchSnapshot();
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
        tasksUnhealthy: 0,
        getResources: jest.fn()
      });

      application.getResources.mockReturnValue({ mem: application.mem });
      var memCell = renderer.create(memRenderer(application)).toJSON();

      expect(memCell).toMatchSnapshot();
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
        tasksUnhealthy: 0,
        getResources: jest.fn()
      });

      application.getResources.mockReturnValue({ disk: application.disk });
      var diskCell = renderer.create(diskRenderer(application)).toJSON();

      expect(diskCell).toMatchSnapshot();
    });
  });

  describe("#renderRegions", function() {
    const renderRegions = regionRenderer;
    let mockService;
    beforeEach(function() {
      mockService = {
        getRegions: jest.fn()
      };
    });

    it("renders with no regions", function() {
      mockService.getRegions.mockReturnValue([]);

      expect(
        renderer.create(renderRegions(mockService)).toJSON()
      ).toMatchSnapshot();
    });

    it("renders with one region", function() {
      mockService.getRegions.mockReturnValue(["aws/eu-central-1"]);

      expect(
        renderer.create(renderRegions(mockService)).toJSON()
      ).toMatchSnapshot();
    });

    it("renders with multiple regions", function() {
      mockService.getRegions.mockReturnValue(["aws/eu-central-1", "dc-east"]);

      expect(
        renderer.create(renderRegions(mockService)).toJSON()
      ).toMatchSnapshot();
    });
  });
});
