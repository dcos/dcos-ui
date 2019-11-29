const React = require("react");

const ReactDOM = require("react-dom");

const TimeSeriesChart = require("../TimeSeriesChart");

let thisContainer, thisInstance;

describe("TimeSeriesChart", () => {
  describe("#shouldComponentUpdate", () => {
    beforeEach(() => {
      var data = [
        {
          values: [
            { date: 0, y: 0 },
            { date: 1, y: 0 }
          ]
        }
      ];

      thisContainer = global.document.createElement("div");
      thisInstance = ReactDOM.render(
        <TimeSeriesChart data={data} width={0} height={0} />,
        thisContainer
      );
      thisInstance.renderAxis = jasmine.createSpy();
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("calls #renderAxis", () => {
      var props = Object.assign({ foo: "bar" }, thisInstance.props);
      thisInstance.shouldComponentUpdate(props);

      expect(thisInstance.renderAxis).toHaveBeenCalled();
    });

    it("does not call #renderAxis", () => {
      thisInstance.shouldComponentUpdate(thisInstance.props);

      expect(thisInstance.renderAxis).not.toHaveBeenCalled();
    });

    it("returns truthy", () => {
      var props = Object.assign({ foo: "bar" }, thisInstance.props);
      var _return = thisInstance.shouldComponentUpdate(props);

      expect(_return).toEqual(true);
    });

    it("returns truthy", () => {
      var data = [
        {
          values: [
            { date: 0, y: 0 },
            { date: 1, y: 0 },
            { date: 2, y: 0 }
          ]
        }
      ];

      var props = { data };

      Object.keys(thisInstance.props).forEach(key => {
        if (props[key] == null) {
          props[key] = thisInstance.props[key];
        }
      });

      var _return = thisInstance.shouldComponentUpdate(props);

      expect(_return).toEqual(true);
    });

    it("returns falsy", () => {
      var _return = thisInstance.shouldComponentUpdate(thisInstance.props);

      expect(_return).toEqual(false);
    });
  });
});
