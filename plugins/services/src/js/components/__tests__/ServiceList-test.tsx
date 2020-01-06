import ServiceList from "../ServiceList";
import ServiceTree from "../../structs/ServiceTree";

import * as React from "react";
import ReactDOM from "react-dom";
import renderer from "react-test-renderer";

let thisContainer, thisInstance;

describe("ServiceList", () => {
  describe("#shouldComponentUpdate", () => {
    beforeEach(() => {
      const services = new ServiceTree({ items: [{ name: "foo" }] });
      thisContainer = window.document.createElement("div");
      thisInstance = ReactDOM.render(
        <ServiceList services={services.getServices().getItems()} />,
        thisContainer
      );
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("allows update", () => {
      const shouldUpdate = thisInstance.shouldComponentUpdate({ a: 1 });
      expect(shouldUpdate).toEqual(true);
    });

    it("does not allow update", () => {
      const shouldUpdate = thisInstance.shouldComponentUpdate(
        thisInstance.props
      );
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
      thisContainer = window.document.createElement("div");
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
