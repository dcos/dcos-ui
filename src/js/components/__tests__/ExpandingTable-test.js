/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const ExpandingTable = require("../ExpandingTable");

let thisColumns, thisRows, thisContainer;

describe("ExpandingTable", function() {
  beforeEach(function() {
    thisColumns = [{ heading() {}, prop: "id" }];
    thisRows = [{ id: "foo" }, { id: "bar" }];
    thisContainer = global.document.createElement("div");
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#render", function() {
    describe("#expandRow", function() {
      it("adds a row to state.expandedRows", function() {
        const instance = ReactDOM.render(
          <ExpandingTable columns={thisColumns} data={thisRows} />,
          thisContainer
        );

        instance.expandRow(thisRows[0]);

        expect(instance.state.expandedRows["foo"]).toBeTruthy();
      });

      it("removes a row from state.expandedRows if expanded", function() {
        const instance = ReactDOM.render(
          <ExpandingTable columns={thisColumns} data={thisRows} />,
          thisContainer
        );

        instance.expandRow(thisRows[0]);
        instance.expandRow(thisRows[0]);

        expect(instance.state.expandedRows["foo"]).toBeFalsy();
      });

      it("allows multiple rows in state.expandedRows", function() {
        const instance = ReactDOM.render(
          <ExpandingTable columns={thisColumns} data={thisRows} />,
          thisContainer
        );

        instance.expandRow(thisRows[0]);
        instance.expandRow(thisRows[1]);

        expect(instance.state.expandedRows["foo"]).toBeTruthy();
        expect(instance.state.expandedRows["bar"]).toBeTruthy();
      });

      it("expands all rows on mount when expandRowsByDefault is true", function() {
        const instance = ReactDOM.render(
          <ExpandingTable
            columns={thisColumns}
            data={thisRows}
            expandRowsByDefault={true}
          />,
          thisContainer
        );

        expect(instance.state.expandedRows["foo"]).toBeTruthy();
        expect(instance.state.expandedRows["bar"]).toBeTruthy();

        instance.expandRow(thisRows[0]);
        instance.expandRow(thisRows[1]);

        expect(instance.state.expandedRows["foo"]).toBeFalsy();
        expect(instance.state.expandedRows["bar"]).toBeFalsy();
      });
    });

    describe("#getRenderer", function() {
      it("proxies the render method on each column", function() {
        const renderSpy = jasmine.createSpy("renderSpy");
        thisColumns[0].render = renderSpy;

        ReactDOM.render(
          <ExpandingTable columns={thisColumns} data={thisRows} />,
          thisContainer
        );

        expect(renderSpy).toHaveBeenCalled();
      });
    });
  });
});
