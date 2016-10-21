jest.dontMock('../BreadcrumbSegment');

/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const TestUtils = require('react-addons-test-utils');

const BreadcrumbSegment = require('../BreadcrumbSegment');
const BreadcrumbSegmentLink = require('../BreadcrumbSegmentLink');

describe('BreadcrumbSegment', function () {

  beforeEach(function () {
    this.routes = [{
      path:'foo',
      paramNames: ['bar']
    }];
    this.params = {bar: 'baz'};
  });

  it('renders the label', function () {
    let instance = TestUtils.renderIntoDocument(
      <BreadcrumbSegment routePath="foo" routes={this.routes} params={this.params} />
    );

    expect(instance.getBackupCrumbLabel()).toEqual('baz');
  });

  it('renders the link', function () {
    let instance = TestUtils.renderIntoDocument(
      <BreadcrumbSegment routePath="foo" routes={this.routes} params={this.params} />
    );

    let node = TestUtils.findRenderedComponentWithType(
      instance, BreadcrumbSegmentLink
    );
    expect(TestUtils.isCompositeComponentWithType(node, BreadcrumbSegmentLink))
    .toBeTruthy();
  });

});
