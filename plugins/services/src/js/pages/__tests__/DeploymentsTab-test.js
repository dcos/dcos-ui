jest.unmock("moment");
jest.unmock("../../../../../../src/js/components/CollapsingString");
jest.unmock("../../../../../../src/js/components/FluidGeminiScrollbar");
jest.unmock("../../../../../../src/js/components/Page");
jest.unmock("../../../../../../src/js/components/TimeAgo");
jest.unmock("../../../../../../src/js/mixins/InternalStorageMixin");
jest.unmock("../services/DeploymentsTab");
jest.unmock("../../structs/DeploymentsList");
jest.unmock("../../structs/Deployment");

const JestUtil = require("../../../../../../src/js/utils/JestUtil");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const DCOSStore = require("foundation-ui").DCOSStore;
const Deployment = require("../../structs/Deployment");
const DeploymentsTab = require("../services/DeploymentsTab");
const DeploymentsList = require("../../structs/DeploymentsList");
const Application = require("../../structs/Application");

describe("DeploymentsTab", function() {
  beforeEach(function() {
    // Clean up application timers.
    jasmine.clock().uninstall();
    // Install our custom jasmine timers.
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2016, 3, 19));
    const deployments = new DeploymentsList({
      items: [
        {
          id: "deployment-id",
          version: "2001-01-01T01:01:01.001Z",
          currentStep: 2,
          totalSteps: 3,
          affectedApps: ["service-1", "service-2"],
          affectedServices: [
            new Application({ id: "1", name: "service-1", deployments: [] }),
            new Application({ id: "2", name: "service-2", deployments: [] })
          ]
        }
      ]
    });
    DCOSStore.serviceDataReceived = true;
    DCOSStore.deploymentsList = deployments;
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      JestUtil.stubRouterContext(DeploymentsTab, {}),
      this.container
    );
    this.node = ReactDOM.findDOMNode(this.instance);
    this.tbody = this.node.querySelector("tbody");
    this.trs = this.tbody.querySelectorAll("tr");
    this.tds = this.tbody.querySelectorAll("td");
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#getRollbackModalText", function() {
    it("should return a removal message when passed a starting deployment", function() {
      const text = DeploymentsTab.prototype.getRollbackModalText(
        new Deployment({
          id: "deployment-id",
          affectedApps: ["app1"],
          affectedServices: [new Application({ name: "app1" })],
          steps: [{ actions: [{ type: "StartApplication" }] }]
        })
      );
      expect(text).toContain("remove the affected service");
    });

    it("should return a revert message when passed a non-starting deployment", function() {
      const text = DeploymentsTab.prototype.getRollbackModalText(
        new Deployment({
          id: "deployment-id",
          affectedApps: ["app1"],
          affectedServices: [new Application({ name: "app1" })],
          steps: [{ actions: [{ type: "ScaleApplication" }] }]
        })
      );
      expect(text).toContain("revert the affected service");
    });
  });

  describe("#render", function() {
    it("should render the deployments count", function() {
      const h4 = this.container.querySelector("h4");
      expect(h4.textContent).toEqual("1 Active Deployment");
    });

    it("should render one row per deployment", function() {
      expect(this.trs.length).toEqual(1);
    });

    describe("affected services column", function() {
      it("should render the deployment ID", function() {
        const dt = this.tds[0].querySelector(
          "dt .collapsing-string-full-string"
        );
        expect(dt.textContent).toEqual("deployment-id");
      });
      it("should render each affected application", function() {
        const dds = this.tds[0].querySelectorAll("dd");
        expect(dds.length).toEqual(2);
      });
    });

    describe("location column", function() {
      it("should render a location for each service", function() {
        const lis = this.tds[1].querySelectorAll("li");
        expect(lis.length).toEqual(2);
      });
    });

    describe("timing column", function() {
      it("should render the deployment start time", function() {
        expect(this.tds[2].textContent).toEqual("15 years ago");
      });
      it("should render a `time` element", function() {
        const time = this.tds[2].querySelector("time");
        expect(time.getAttribute("dateTime")).toEqual(
          "2001-01-01T01:01:01.001Z"
        );
      });
    });

    describe("status column", function() {
      it("should render the deployment progress", function() {
        const deploymentStep = this.tds[3].querySelector(".deployment-step");
        expect(deploymentStep.textContent).toEqual("Step 2 of 3");
      });
      it("should render the status of each application", function() {
        const lis = this.tds[3].querySelectorAll("li");
        expect(lis.length).toEqual(2);
      });
    });

    describe("action column", function() {
      it("should render a rollback button", function() {
        const rollbackButton = this.tds[4].querySelector(
          ".deployment-rollback"
        );
        expect(rollbackButton).not.toBeNull();
      });
    });
  });
});
