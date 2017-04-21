jest.dontMock("../TabButton");
jest.dontMock("../TabButtonList");

const React = require("react");
const TestUtils = require("react-addons-test-utils");

const TabButton = require("../TabButton");
const TabButtonList = require("../TabButtonList");

describe("TabButtonList", function() {
  beforeEach(function() {
    this.changeHandler = jasmine.createSpy("change handler");
  });

  it("should pass onChange as click handler for each TabButton instance", function() {
    this.instance = TestUtils.renderIntoDocument(
      <TabButtonList onChange={this.changeHandler}>
        <TabButton id="foo" />
        <TabButton id="bar" />
        <TabButton id="baz" />
      </TabButtonList>
    );

    const instances = TestUtils.scryRenderedComponentsWithType(
      this.instance,
      TabButton
    );

    instances.forEach(tabButtonInstance => {
      expect(tabButtonInstance.props.onClick).toEqual(this.changeHandler);
    });
  });

  it("should set only first child to active if no active tab is defined", function() {
    this.instance = TestUtils.renderIntoDocument(
      <TabButtonList>
        <TabButton id="foo" />
        <TabButton id="bar" />
        <TabButton id="baz" />
      </TabButtonList>
    );

    const instances = TestUtils.scryRenderedComponentsWithType(
      this.instance,
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

  it("should pass active prop to instance whose ID matches activeTab", function() {
    this.instance = TestUtils.renderIntoDocument(
      <TabButtonList activeTab="bar">
        <TabButton id="foo" />
        <TabButton id="bar" />
        <TabButton id="baz" />
      </TabButtonList>
    );

    const instances = TestUtils.scryRenderedComponentsWithType(
      this.instance,
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
