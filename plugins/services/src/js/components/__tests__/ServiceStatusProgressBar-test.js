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

describe("#ServiceStatusProgressBar", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <ServiceStatusProgressBar service={service} />,
      this.container
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("ProgressBar", function() {
    it("display ProgressBar", function() {
      this.instance = ReactDOM.render(
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
        this.container
      );
      const progressBar = ReactTestUtils.findRenderedComponentWithType(
        this.instance,
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

      this.instance = ReactDOM.render(
        <ServiceStatusProgressBar service={app} />,
        this.container
      );

      expect(
        ReactTestUtils.findRenderedComponentWithType(this.instance, Tooltip)
      ).toBeTruthy();
    });

    it("get #getTooltipContent", function() {
      const childrenContent = this.instance.getTooltipContent().props.children
        .props.children;
      expect(childrenContent).toEqual("0 instances running out of 1");
    });
  });
});
