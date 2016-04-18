jest.dontMock('../ServerErrorModal');
jest.dontMock('../../mixins/GetSetMixin');

import PluginTestUtils from 'PluginTestUtils';

PluginTestUtils.dontMock([
  'MarathonStore',
  'MesosStateStore',
  'MesosSummaryStore'
]);

var React = require('react');
var ReactDOM = require('react-dom');

var ServerErrorModal = require('../ServerErrorModal');

describe('ServerErrorModal', function () {
  beforeEach(function () {
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <ServerErrorModal />,
      this.container
    );
  });
  afterEach(function () {

    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#handleModalClose', function () {
    beforeEach(function () {
      this.instance.handleModalClose();
    });

    it('closes the modal', function () {
      expect(this.instance.state.isOpen).toEqual(false);
    });

    it('resets the error array', function () {
      expect(this.instance.state.errors).toEqual([]);
    });

  });

  describe('#handleServerError', function () {

    it('doesn\'t throw when an id and errorMessage are passed', function () {
      let fn = this.instance.handleServerError.bind(
        this.instance, 'foo', 'bar'
      );
      expect(fn).not.toThrow();
    });

    it('doesn\'t throw when an id is passed', function () {
      let fn = this.instance.handleServerError.bind(this.instance, 'foo');
      expect(fn).not.toThrow();
    });

    it('throws an error when no id or errorMessage is passed', function () {
      let fn = this.instance.handleServerError.bind(this.instance);
      expect(fn).toThrow();
    });

  });

  describe('#getContent', function () {
    it('should return the same number of children as errors', function () {
      this.instance.state.errors = [1, 2, 3];
      var contents = this.instance.getContent();
      var result = contents.props.children;

      expect(result.length).toEqual(3);
    });
  });
});
