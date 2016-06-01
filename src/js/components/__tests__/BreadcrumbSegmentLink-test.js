jest.dontMock('../BreadcrumbSegmentLink');

/* eslint-disable no-unused-vars */
let React = require('react');
/* eslint-enable no-unused-vars */
let Router = require('react-router');
let TestUtils = require('react-addons-test-utils');

let BreadcrumbSegmentLink = require('../BreadcrumbSegmentLink');

describe('BreadcrumbSegmentLink', function () {

  it('renders the label', function () {
    let instance = TestUtils.renderIntoDocument(
      <BreadcrumbSegmentLink label="foo" />
    );

    let node = TestUtils.findRenderedDOMComponentWithTag(instance, 'span');

    expect(node.textContent).toEqual('foo');
  });

});
