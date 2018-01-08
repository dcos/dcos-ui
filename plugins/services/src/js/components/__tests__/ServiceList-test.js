/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const renderer = require("react-test-renderer");

const ServiceList = require("../ServiceList");
const ServiceTree = require("../../structs/ServiceTree");

describe("ServiceList", function() {
  describe("#shouldComponentUpdate", function() {
    beforeEach(function() {
      var services = new ServiceTree({ items: [{ name: "foo" }] });
      this.container = global.document.createElement("div");
      this.instance = ReactDOM.render(
        <ServiceList services={services.getServices().getItems()} />,
        this.container
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("allows update", function() {
      var shouldUpdate = this.instance.shouldComponentUpdate({ a: 1 });
      expect(shouldUpdate).toEqual(true);
    });

    it("does not allow update", function() {
      var shouldUpdate = this.instance.shouldComponentUpdate(
        this.instance.props
      );
      expect(shouldUpdate).toEqual(false);
    });
  });

  describe("#getServices", function() {
    const services = new ServiceTree({
      items: [
        {
          name: "foo",
          tasksStaged: 0,
          tasksRunning: 0,
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          instances: 0,
          deployments: []
        }
      ]
    });

    beforeEach(function() {
      this.container = global.document.createElement("div");
      this.instance = ReactDOM.render(
        <ServiceList services={services.getServices().getItems()} />,
        this.container
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("returns services that have a value of two elements", function() {
      const component = renderer.create(
        <ServiceList services={services.getServices().getItems()} />
      );
      const tree = component.toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
