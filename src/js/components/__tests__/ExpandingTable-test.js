jest.dontMock('../ExpandingTable');
/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');

var ExpandingTable = require('../ExpandingTable');

describe('ExpandingTable', function () {
  beforeEach(function () {
    this.columns = [{heading: function () {}, prop: 'id'}];
    this.rows = [{id: 'foo'}, {id: 'bar'}];
    this.container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#render', function () {

    describe('#expandRow', function () {

      it('should add a row to state.expandedRows', function () {
        let instance = ReactDOM.render(
          <ExpandingTable columns={this.columns} data={this.rows} />,
          this.container
        );

        instance.expandRow(this.rows[0]);

        expect(instance.state.expandedRows['foo']).toBeTruthy();
      });

      it('should remove a row from state.expandedRows if already expanded',
        function () {
        let instance = ReactDOM.render(
          <ExpandingTable columns={this.columns} data={this.rows} />,
          this.container
        );

        instance.expandRow(this.rows[0]);
        instance.expandRow(this.rows[0]);

        expect(instance.state.expandedRows['foo']).toBeFalsy();
      });

      it('should allow multiple rows in state.expandedRows',
        function () {
        let instance = ReactDOM.render(
          <ExpandingTable columns={this.columns} data={this.rows} />,
          this.container
        );

        instance.expandRow(this.rows[0]);
        instance.expandRow(this.rows[1]);

        expect(instance.state.expandedRows['foo']).toBeTruthy();
        expect(instance.state.expandedRows['bar']).toBeTruthy();
      });

    });

    describe('#getRenderer', function () {

      it('should proxy the render method on each column', function () {
        let renderSpy = jasmine.createSpy('renderSpy');
        this.columns[0].render = renderSpy;

        let instance = ReactDOM.render(
          <ExpandingTable columns={this.columns} data={this.rows} />,
          this.container
        );

        expect(renderSpy).toHaveBeenCalled();
      });

    });

  });

});
