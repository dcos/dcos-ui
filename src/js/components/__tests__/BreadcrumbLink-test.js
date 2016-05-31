jest.dontMock('../BreadcrumbLink');

/* eslint-disable no-unused-vars */
let React = require('react');
/* eslint-enable no-unused-vars */
let Router = require('react-router');
let TestUtils = require('react-addons-test-utils');

let BreadcrumbLink = require('../BreadcrumbLink');

describe('BreadcrumbLink', function () {

  it('renders the label', function () {
    let instance = TestUtils.renderIntoDocument(
      <BreadcrumbLink label="foo" />
    );

    let node = TestUtils.findRenderedDOMComponentWithTag(instance, 'span');

    expect(node.textContent).toEqual('foo');
  });

});
