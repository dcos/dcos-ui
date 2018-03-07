const React = require("react");
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const TabButton = require("../TabButton");

let thisClickHandler, thisInstance;

describe("TabButton", function() {
  beforeEach(function() {
    thisClickHandler = jasmine.createSpy("click handler");
  });

  it("calls the onClick prop with ID when clicked", function() {
    thisInstance = TestUtils.renderIntoDocument(
      <TabButton label="foo" onClick={thisClickHandler} id="foo" />
    );

    // Click the TabButton's label
    TestUtils.Simulate.click(
      ReactDOM.findDOMNode(thisInstance).querySelector(
        ".menu-tabbed-item-label"
      )
    );

    expect(thisClickHandler).toHaveBeenCalledWith("foo");
  });

  it("clones nested TabButton instances with onClick and activeTab props", function() {
    thisInstance = TestUtils.renderIntoDocument(
      <TabButton
        activeTab="foo"
        label="foo"
        onClick={thisClickHandler}
        id="foo"
      >
        <TabButton label="bar" id="bar" />
      </TabButton>
    );

    const nestedInstance = TestUtils.scryRenderedComponentsWithType(
      thisInstance,
      TabButton
    )[0];

    expect(nestedInstance.props.activeTab).toEqual("foo");
    expect(nestedInstance.props.onClick).toEqual(thisClickHandler);
  });

  it("calls the parent onClick when clicking a nested TabButton", function() {
    thisInstance = TestUtils.renderIntoDocument(
      <TabButton
        activeTab="foo"
        label="foo"
        onClick={thisClickHandler}
        id="foo"
      >
        <TabButton label="bar" id="bar" />
      </TabButton>
    );

    // Click the TabButton's label
    TestUtils.Simulate.click(
      ReactDOM.findDOMNode(thisInstance).querySelector(
        ".menu-tabbed-item .menu-tabbed-item .menu-tabbed-item-label"
      )
    );

    expect(thisClickHandler).toHaveBeenCalledWith("bar");
  });
});
