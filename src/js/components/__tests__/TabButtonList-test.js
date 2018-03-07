const React = require("react");
const TestUtils = require("react-addons-test-utils");

const TabButton = require("../TabButton");
const TabButtonList = require("../TabButtonList");

let thisChangeHandler, thisInstance;

describe("TabButtonList", function() {
  beforeEach(function() {
    thisChangeHandler = jasmine.createSpy("change handler");
  });

  it("passes onChange as click handler for each TabButton instance", function() {
    thisInstance = TestUtils.renderIntoDocument(
      <TabButtonList onChange={thisChangeHandler}>
        <TabButton id="foo" />
        <TabButton id="bar" />
        <TabButton id="baz" />
      </TabButtonList>
    );

    const instances = TestUtils.scryRenderedComponentsWithType(
      thisInstance,
      TabButton
    );

    instances.forEach(tabButtonInstance => {
      expect(tabButtonInstance.props.onClick).toEqual(thisChangeHandler);
    });
  });

  it("sets only first child to active if no active tab is defined", function() {
    thisInstance = TestUtils.renderIntoDocument(
      <TabButtonList>
        <TabButton id="foo" />
        <TabButton id="bar" />
        <TabButton id="baz" />
      </TabButtonList>
    );

    const instances = TestUtils.scryRenderedComponentsWithType(
      thisInstance,
      TabButton
    );

    instances.forEach(function(tabButtonInstance, index) {
      if (index === 0) {
        expect(tabButtonInstance.props.active).toBeTruthy();
      } else {
        expect(tabButtonInstance.props.active).toBeFalsy();
      }
    });
  });

  it("passes active prop to instance whose ID matches activeTab", function() {
    thisInstance = TestUtils.renderIntoDocument(
      <TabButtonList activeTab="bar">
        <TabButton id="foo" />
        <TabButton id="bar" />
        <TabButton id="baz" />
      </TabButtonList>
    );

    const instances = TestUtils.scryRenderedComponentsWithType(
      thisInstance,
      TabButton
    );

    instances.forEach(function(tabButtonInstance) {
      if (tabButtonInstance.props.id === "bar") {
        expect(tabButtonInstance.props.active).toBeTruthy();
      } else {
        expect(tabButtonInstance.props.active).toBeFalsy();
      }
    });
  });
});
