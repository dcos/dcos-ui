jest.dontMock('../ClickToSelect');

/* eslint-disable no-unused-vars */
let React = require('react');
/* eslint-enable no-unused-vars */
let ReactDOM = require('react-dom');
let TestUtils = require('react-addons-test-utils');

let ClickToSelect = require('../ClickToSelect');

describe('ClickToSelect', function () {

  beforeEach(function () {
    this.spy = {selectAllChildren: jasmine.createSpy()};
    this.getSelection = document.getSelection;

    // Mock this document function, which is unsupported by jest.
    document.getSelection = function () {
      return this.spy;
    }.bind(this);

    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <ClickToSelect>
        <span>hello text</span>
      </ClickToSelect>,
      this.container
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
    document.getSelection = this.getSelection;
  });

  it('sets selection when node is clicked', function () {
    var node = ReactDOM.findDOMNode(this.instance);
    var element = node.querySelector('span');

    TestUtils.Simulate.click(element);

    expect(this.spy.selectAllChildren).toHaveBeenCalled();
  });

});
