jest.dontMock("../../structs/ServiceTree");
jest.dontMock("../ServiceList");
jest.dontMock("../../stores/MarathonStore");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const ServiceList = require("../ServiceList");
const ServiceTree = require("../../structs/ServiceTree");

describe("ServiceList", function() {
  describe("#shouldComponentUpdate", function() {
    beforeEach(function() {
      var services = new ServiceTree({ items: [{ name: "foo" }] });
      this.container = global.document.createElement("div");
      this.instance = ReactDOM.render(
        <ServiceList
          services={services.getServices().getItems()}
          healthProcessed={false}
        />,
        this.container
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("should allow update", function() {
      var shouldUpdate = this.instance.shouldComponentUpdate({ a: 1 });
      expect(shouldUpdate).toEqual(true);
    });

    it("should not allow update", function() {
      var shouldUpdate = this.instance.shouldComponentUpdate(
        this.instance.props
      );
      expect(shouldUpdate).toEqual(false);
    });
  });

  describe("#getServices", function() {
    beforeEach(function() {
      var services = new ServiceTree({ items: [{ name: "foo" }] });
      this.container = global.document.createElement("div");
      this.instance = ReactDOM.render(
        <ServiceList
          services={services.getServices().getItems()}
          healthProcessed={false}
        />,
        this.container
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("returns services that have a value of two elements", function() {
      var services = new ServiceTree({ items: [{ name: "foo" }] })
        .getServices()
        .getItems();
      var result = this.instance.getServices(services, false);

      expect(result[0].content[0].content.key).toEqual("title");
      expect(result[0].content[1].content.key).toEqual("health");
    });
  });
});
