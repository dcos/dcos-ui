jest.mock("#SRC/js/stores/DCOSStore");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");
const JestUtil = require("../../utils/JestUtil");

const DCOSStore = require("#SRC/js/stores/DCOSStore");
const AlertPanel = require("../../components/AlertPanel");
const MetronomeUtil = require("../../utils/MetronomeUtil");
const JobsTab = require("../jobs/JobsTab");
const JobTree = require("../../structs/JobTree");
const JobsTable = require("../../pages/jobs/JobsTable");

let thisContainer;

describe("JobsTab", function() {
  beforeEach(function() {
    DCOSStore.jobTree = new JobTree(
      MetronomeUtil.parseJobs([
        {
          id: "/test"
        }
      ])
    );
    DCOSStore.jobDataReceived = true;
    thisContainer = global.document.createElement("div");
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#render", function() {
    it("renders the job table", function() {
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(JobsTab, { params: { id: "/" } }),
        thisContainer
      );

      expect(
        TestUtils.scryRenderedComponentsWithType(instance, JobsTable)
      ).toBeDefined();
    });

    it("renders loading screen", function() {
      DCOSStore.jobDataReceived = false;
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(JobsTab, { params: { id: "/" } }),
        thisContainer
      );

      var node = ReactDOM.findDOMNode(instance);
      expect(node.querySelector(".ball-scale")).toBeDefined();
    });

    it("renders correct empty panel", function() {
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(JobsTab, { params: { id: "/" } }),
        thisContainer
      );

      expect(
        TestUtils.scryRenderedComponentsWithType(instance, AlertPanel)
      ).toBeDefined();
    });
  });
});
