/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const ReactTestUtils = require("react-addons-test-utils");
const Tooltip = require("reactjs-components").Tooltip;

const ProgressBar = require("#SRC/js/components/ProgressBar");
const ServiceStatusProgressBar = require("../ServiceStatusProgressBar");
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

let thisContainer, thisInstance;

describe("#ServiceStatusProgressBar", function() {
  beforeEach(function() {
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <ServiceStatusProgressBar service={service} />,
      thisContainer
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("ProgressBar", function() {
    it("display ProgressBar", function() {
      thisInstance = ReactDOM.render(
        <ServiceStatusProgressBar
          service={
            new Pod({
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
            })
          }
        />,
        thisContainer
      );
      const progressBar = ReactTestUtils.findRenderedComponentWithType(
        thisInstance,
        ProgressBar
      );
      expect(progressBar).toBeTruthy();
      expect(progressBar.props.total).toBe(10);
      expect(progressBar.props.data[0].value).toBe(4);
    });
  });

  describe("Tooltip", function() {
    it("display Tooltip", function() {
      const app = new Application({
        queue: {
          overdue: true
        }
      });

      thisInstance = ReactDOM.render(
        <ServiceStatusProgressBar service={app} />,
        thisContainer
      );

      expect(
        ReactTestUtils.findRenderedComponentWithType(thisInstance, Tooltip)
      ).toBeTruthy();
    });

    it("get #getTooltipContent", function() {
      const childrenContent = thisInstance.getTooltipContent().props.children
        .props.children;
      expect(childrenContent).toEqual("0 instances running out of 1");
    });
  });
});
