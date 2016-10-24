jest.dontMock('../DetailViewHeader');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');

const DetailViewHeader = require('../DetailViewHeader');

describe('DetailViewHeader', function () {
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
        <DetailViewHeader className={className} />,
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
        <DetailViewHeader className={className} />,
        this.container
      );
      let node = ReactDOM.findDOMNode(instance);
      expect(node.classList).not.toContain('container');
    });

  });

});
