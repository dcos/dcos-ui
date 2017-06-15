jest.dontMock("../../../../../../../src/js/components/ConfigurationMap");
jest.dontMock("../../../../../../../src/js/components/ConfigurationMapLabel");
jest.dontMock("../../../../../../../src/js/components/ConfigurationMapValue");
jest.dontMock("../../../../../../../src/js/components/ConfigurationMapHeading");
jest.dontMock("../../../../../../../src/js/components/ConfigurationMapRow");
jest.dontMock("../../../../../../../src/js/components/ConfigurationMapSection");
jest.dontMock("../../../../../../../src/js/components/CollapsingString");
jest.dontMock(
  "../../../../../../../src/js/components/DetailViewSectionHeading"
);
jest.dontMock("../../../../../../../src/js/components/DetailViewHeader");
jest.dontMock("../../../../../../../src/js/stores/MesosStateStore");
jest.dontMock("../../../../../../../src/js/components/Page");
jest.dontMock("../../../../../../../src/js/mixins/InternalStorageMixin");
jest.dontMock("../ServiceDetail");
jest.dontMock("../../service-debug/ServiceDebugContainer");
jest.dontMock("../../service-configuration/ServiceConfigurationContainer");
jest.dontMock("../../tasks/ServiceTasksContainer");
jest.dontMock("../ServiceInfo");
jest.dontMock("../../../structs/Application");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");
const JestUtil = require("../../../../../../../src/js/utils/JestUtil");

const Application = require("../../../structs/Application");
const ServiceDetail = require("../ServiceDetail");
const ServiceDebugContainer = require("../../service-debug/ServiceDebugContainer");
const ServiceConfigurationContainer = require("../../service-configuration/ServiceConfigurationContainer");
const ServiceTasksContainer = require("../../tasks/ServiceTasksContainer");

describe("ServiceDetail", function() {
  const service = new Application({
    id: "/group/test",
    healthChecks: [{ path: "", protocol: "HTTP" }],
    deployments: [],
    cpus: 1,
    mem: 2048,
    disk: 0,
    instances: 1,
    tasksStaged: 0,
    tasksRunning: 2,
    tasksHealthy: 2,
    tasksUnhealthy: 0,
    version: "2001-01-01T01:01:01.001Z",
    versionInfo: {
      lastConfigChangeAt: "2001-01-01T01:01:01.001Z",
      lastScalingAt: "2001-01-01T01:01:01.001Z"
    }
  });

  const contextTypes = {
    modalHandlers: React.PropTypes.object
  };

  const context = {
    modalHandlers: {
      editService() {},
      scaleService() {},
      restartService() {},
      suspendService() {},
      deleteService() {}
    }
  };

  beforeEach(function() {
    this.container = global.document.createElement("div");
    this.wrapper = ReactDOM.render(
      JestUtil.stubRouterContext(
        ServiceDetail,
        {
          actions: { editService() {} },
          errors: {},
          params: {},
          service
        },
        {},
        contextTypes,
        context
      ),
      this.container
    );
    this.instance = TestUtils.findRenderedComponentWithType(
      this.wrapper,
      ServiceDetail
    );
    this.node = ReactDOM.findDOMNode(this.instance);
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#renderConfigurationTabView", function() {
    it("renders the configuration tab", function() {
      var configurationTabView = ReactDOM.render(
        this.instance.renderConfigurationTabView(),
        this.container
      );
      var ServiceTasksContainer = TestUtils.findRenderedComponentWithType(
        configurationTabView,
        ServiceConfigurationContainer
      );

      expect(ServiceTasksContainer).toBeDefined();
    });
  });

  describe("#renderDebugTabView", function() {
    it("renders debug tab", function() {
      var debugTabView = ReactDOM.render(
        this.instance.renderDebugTabView(),
        this.container
      );
      var serviceDebugContainer = TestUtils.findRenderedComponentWithType(
        debugTabView,
        ServiceDebugContainer
      );

      expect(serviceDebugContainer).toBeDefined();
    });
  });

  describe("#renderInstancesTabView", function() {
    it("renders task tab", function() {
      var instancesTabView = ReactDOM.render(
        this.instance.renderInstancesTabView(),
        this.container
      );
      var serviceDetailInstancesTab = TestUtils.findRenderedComponentWithType(
        instancesTabView,
        ServiceTasksContainer
      );

      expect(serviceDetailInstancesTab).toBeDefined();
    });
  });
});
