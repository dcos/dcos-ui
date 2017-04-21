jest.dontMock("../BreadcrumbSegment");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");

const BreadcrumbSegment = require("../BreadcrumbSegment");
const BreadcrumbSegmentLink = require("../BreadcrumbSegmentLink");

describe("BreadcrumbSegment", function() {
  beforeEach(function() {
    this.routes = [
      {
        path: "foo/:bar"
      }
    ];
    this.params = { bar: "baz" };
  });

  it("renders the label", function() {
    const instance = TestUtils.renderIntoDocument(
      <BreadcrumbSegment
        routePath="foo/:bar"
        routes={this.routes}
        params={this.params}
      />
    );

    expect(instance.getBackupCrumbLabel()).toEqual("baz");
  });

  it("renders the link", function() {
    const instance = TestUtils.renderIntoDocument(
      <BreadcrumbSegment
        routePath="foo"
        routes={this.routes}
        params={this.params}
      />
    );

    const node = TestUtils.findRenderedComponentWithType(
      instance,
      BreadcrumbSegmentLink
    );
    expect(
      TestUtils.isCompositeComponentWithType(node, BreadcrumbSegmentLink)
    ).toBeTruthy();
  });
});
