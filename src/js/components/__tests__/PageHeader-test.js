jest.dontMock('../PageHeader');
/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');

var PageHeader = require('../PageHeader');

describe('PageHeader', function () {
  beforeEach(function () {
    this.container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#render', function () {

    it('allows classes to be added', function () {
      let className = 'foo';
      let instance = ReactDOM.render(
        <PageHeader className={className} />,
        this.container
      );
      let node = ReactDOM.findDOMNode(instance);
      expect(node.classList).toContain('foo');
    });

    it('allows classes to be removed', function () {
      var className = {
        'container': false
      };
      let instance = ReactDOM.render(
        <PageHeader className={className} />,
        this.container
      );
      let node = ReactDOM.findDOMNode(instance);
      expect(node.classList).not.toContain('container');
    });

  });

});
