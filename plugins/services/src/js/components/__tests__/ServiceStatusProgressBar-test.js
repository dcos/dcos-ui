import React from "react";
import { shallow } from "enzyme";

import ServiceStatusProgressBar from "../ServiceStatusProgressBar";

const Tooltip = require("reactjs-components").Tooltip;

const ProgressBar = require("#SRC/js/components/ProgressBar");
const Application = require("../../structs/Application");
const Pod = require("../../structs/Pod");

const service = new Application({
  instances: 1,
  tasksRunning: 1,
  tasksHealthy: 0,
  tasksUnhealthy: 0,
  tasksUnknown: 0,
  tasksStaged: 0
});

let thisInstance;

describe("ServiceStatusProgressBar", function() {
  beforeEach(function() {
    thisInstance = shallow(
      <ServiceStatusProgressBar
        runningInstances={service.getRunningInstancesCount()}
        instancesCount={service.getInstancesCount()}
        statusText={service.getStatus()}
      />
    );
  });

  describe("ProgressBar", function() {
    it("display ProgressBar", function() {
      const pod = new Pod({
        env: {
          SDK_UNINSTALL: true
        },
        spec: {
          scaling: {
            instances: 10,
            kind: "fixed"
          }
        },
        instances: [
          {
            status: "stable"
          },
          {
            status: "stable"
          },
          {
            status: "stable"
          },
          {
            status: "stable"
          }
        ]
      });
      thisInstance = shallow(
        <ServiceStatusProgressBar
          runningInstances={pod.getRunningInstancesCount()}
          instancesCount={pod.getInstancesCount()}
          serviceStatus={pod.getServiceStatus()}
        />
      );

      const progressBar = thisInstance.find(ProgressBar);
      expect(progressBar).toBeTruthy();
      expect(progressBar.prop("total")).toBe(10);
      expect(progressBar.prop("data")[0].value).toBe(4);
    });
  });

  describe("Tooltip", function() {
    it("display Tooltip", function() {
      const service = new Application({
        queue: {
          overdue: true
        }
      });

      thisInstance = shallow(
        <ServiceStatusProgressBar
          runningInstances={service.getRunningInstancesCount()}
          instancesCount={service.getInstancesCount()}
          serviceStatus={service.getStatus()}
        />
      );

      expect(expect(thisInstance.find(Tooltip).exists())).toBeTruthy();
    });

    it("get #getTooltipContent", function() {
      const childrenContent = shallow(
        thisInstance.instance().getTooltipContent()
      )
        .find("WithI18n")
        .props().values;

      expect(childrenContent).toMatchObject({
        instancesCount: 1,
        runningInstances: 0
      });
    });
  }
});
