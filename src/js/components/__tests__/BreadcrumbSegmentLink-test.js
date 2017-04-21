jest.dontMock("../BreadcrumbSegmentLink");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");

const BreadcrumbSegmentLink = require("../BreadcrumbSegmentLink");

describe("BreadcrumbSegmentLink", function() {
  it("renders the label", function() {
    const instance = TestUtils.renderIntoDocument(
      <BreadcrumbSegmentLink label="foo" />
    );

    const node = TestUtils.findRenderedDOMComponentWithTag(instance, "span");

    expect(node.textContent).toEqual("foo");
  });
});
