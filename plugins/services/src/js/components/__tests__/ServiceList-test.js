const React = require("react");

const ReactDOM = require("react-dom");

const renderer = require("react-test-renderer");

const ServiceList = require("../ServiceList");
const ServiceTree = require("../../structs/ServiceTree");

let thisContainer, thisInstance;

describe("ServiceList", () => {
  describe("#shouldComponentUpdate", () => {
    beforeEach(() => {
      var services = new ServiceTree({ items: [{ name: "foo" }] });
      thisContainer = global.document.createElement("div");
      thisInstance = ReactDOM.render(
        <ServiceList services={services.getServices().getItems()} />,
        thisContainer
      );
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("allows update", () => {
      var shouldUpdate = thisInstance.shouldComponentUpdate({ a: 1 });
      expect(shouldUpdate).toEqual(true);
    });

    it("does not allow update", () => {
      var shouldUpdate = thisInstance.shouldComponentUpdate(thisInstance.props);
      expect(shouldUpdate).toEqual(false);
    });
  });

  describe("#getServices", () => {
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

    beforeEach(() => {
      thisContainer = global.document.createElement("div");
      thisInstance = ReactDOM.render(
        <ServiceList services={services.getServices().getItems()} />,
        thisContainer
      );
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("returns services that have a value of two elements", () => {
      const component = renderer.create(
        <ServiceList services={services.getServices().getItems()} />
      );
      const tree = component.toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
