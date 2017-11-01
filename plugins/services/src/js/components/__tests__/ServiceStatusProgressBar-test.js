/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const ReactTestUtils = require("react-addons-test-utils");
const Tooltip = require("reactjs-components").Tooltip;

const ProgressBar = require("#SRC/js/components/ProgressBar");
const ServiceStatusProgressBar = require("../ServiceStatusProgressBar");
const Application = require("../../structs/Application");

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
            new Application({
              env: {
                SDK_UNINSTALL: true
              }
            })
          }
        />,
        this.container
      );

      expect(
        ReactTestUtils.findRenderedComponentWithType(this.instance, ProgressBar)
      ).toBeTruthy();
    });
  });

  describe("Tooltip", function() {
    it("display Tooltip", function() {
      this.instance = ReactDOM.render(
        <ServiceStatusProgressBar service={new Application({})} />,
        this.container
      );

      expect(
        ReactTestUtils.findRenderedComponentWithType(this.instance, Tooltip)
      ).toBeTruthy();
    });

    it("get #getTooltipContent", function() {
      const childrenContent = this.instance.getTooltipContent().props.children
        .props.children;
      expect(childrenContent).toEqual("1 instance running out of 1");
    });
  });
});
