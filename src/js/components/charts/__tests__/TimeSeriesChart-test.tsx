import TimeSeriesChart from "../TimeSeriesChart";

import * as React from "react";
import ReactDOM from "react-dom";

let thisContainer, thisInstance;

describe("TimeSeriesChart", () => {
  describe("#shouldComponentUpdate", () => {
    beforeEach(() => {
      const data = [
        {
          values: [
            { date: 0, y: 0 },
            { date: 1, y: 0 },
          ],
        },
      ];

      thisContainer = window.document.createElement("div");
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
      const props = {
        foo: "bar",
        ...thisInstance.props,
      };
      thisInstance.shouldComponentUpdate(props);

      expect(thisInstance.renderAxis).toHaveBeenCalled();
    });

    it("does not call #renderAxis", () => {
      thisInstance.shouldComponentUpdate(thisInstance.props);

      expect(thisInstance.renderAxis).not.toHaveBeenCalled();
    });

    it("returns truthy", () => {
      const props = {
        foo: "bar",
        ...thisInstance.props,
      };
      const _return = thisInstance.shouldComponentUpdate(props);

      expect(_return).toEqual(true);
    });

    it("returns truthy", () => {
      const data = [
        {
          values: [
            { date: 0, y: 0 },
            { date: 1, y: 0 },
            { date: 2, y: 0 },
          ],
        },
      ];

      const props = { data };

      Object.keys(thisInstance.props).forEach((key) => {
        if (props[key] == null) {
          props[key] = thisInstance.props[key];
        }
      });

      const _return = thisInstance.shouldComponentUpdate(props);

      expect(_return).toEqual(true);
    });

    it("returns falsy", () => {
      const _return = thisInstance.shouldComponentUpdate(thisInstance.props);

      expect(_return).toEqual(false);
    });
  });
});
