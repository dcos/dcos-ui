jest.dontMock('../BreadcrumbSegment');

/* eslint-disable no-unused-vars */
let React = require('react');
/* eslint-enable no-unused-vars */
let TestUtils = require('react-addons-test-utils');

let BreadcrumbSegment = require('../BreadcrumbSegment');
let BreadcrumbSegmentLink = require('../BreadcrumbSegmentLink');

describe('BreadcrumbSegment', function () {

  beforeEach(function () {
    function parentRouter () {}
    parentRouter.namedRoutes = {
      'foo': {
        paramNames: ['bar']
      }
    };
    parentRouter.getCurrentParams = function () {
      return {bar: 'baz'};
    };

    this.parentRouter = parentRouter;
  })

  it('renders the label', function () {
    let instance = TestUtils.renderIntoDocument(
      <BreadcrumbSegment routeName="foo" parentRouter={this.parentRouter} />
    );

    expect(instance.getBackupCrumbLabel()).toEqual('baz');
  });

  it('renders the link', function () {
    let instance = TestUtils.renderIntoDocument(
      <BreadcrumbSegment routeName="foo" parentRouter={this.parentRouter} />
    );

    let node = TestUtils.findRenderedComponentWithType(
      instance, BreadcrumbSegmentLink
    );
    expect(TestUtils.isCompositeComponentWithType(node, BreadcrumbSegmentLink))
    .toBeTruthy();
  });

});
