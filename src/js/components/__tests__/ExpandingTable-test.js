jest.dontMock("../ExpandingTable");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const ExpandingTable = require("../ExpandingTable");

describe("ExpandingTable", function() {
  beforeEach(function() {
    this.columns = [{ heading() {}, prop: "id" }];
    this.rows = [{ id: "foo" }, { id: "bar" }];
    this.container = global.document.createElement("div");
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#render", function() {
    describe("#expandRow", function() {
      it("should add a row to state.expandedRows", function() {
        const instance = ReactDOM.render(
          <ExpandingTable columns={this.columns} data={this.rows} />,
          this.container
        );

        instance.expandRow(this.rows[0]);

        expect(instance.state.expandedRows["foo"]).toBeTruthy();
      });

      it("removes a row from state.expandedRows if expanded", function() {
        const instance = ReactDOM.render(
          <ExpandingTable columns={this.columns} data={this.rows} />,
          this.container
        );

        instance.expandRow(this.rows[0]);
        instance.expandRow(this.rows[0]);

        expect(instance.state.expandedRows["foo"]).toBeFalsy();
      });

      it("should allow multiple rows in state.expandedRows", function() {
        const instance = ReactDOM.render(
          <ExpandingTable columns={this.columns} data={this.rows} />,
          this.container
        );

        instance.expandRow(this.rows[0]);
        instance.expandRow(this.rows[1]);

        expect(instance.state.expandedRows["foo"]).toBeTruthy();
        expect(instance.state.expandedRows["bar"]).toBeTruthy();
      });
    });

    describe("#getRenderer", function() {
      it("should proxy the render method on each column", function() {
        const renderSpy = jasmine.createSpy("renderSpy");
        this.columns[0].render = renderSpy;

        ReactDOM.render(
          <ExpandingTable columns={this.columns} data={this.rows} />,
          this.container
        );

        expect(renderSpy).toHaveBeenCalled();
      });
    });
  });
});
