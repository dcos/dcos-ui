jest.dontMock("../TabButton");
jest.dontMock("../TabButtonList");
jest.dontMock("../Tabs");
jest.dontMock("../TabView");
jest.dontMock("../TabViewList");

const React = require("react");
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const TabButton = require("../TabButton");
const TabButtonList = require("../TabButtonList");
const Tabs = require("../Tabs");
const TabView = require("../TabView");
const TabViewList = require("../TabViewList");

describe("Tabs", function() {
  beforeEach(function() {
    this.handleTabChange = jest.fn();
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <Tabs
        vertical={true}
        handleTabChange={this.handleTabChange}
        activeTab="foo"
      >
        <TabButtonList>
          <TabButton id="foo" label="Foo">
            <TabButton id="bar" label="Bar" />
            <TabButton id="baz" label="Baz">
              <TabButton id="qux" label="Qux" />
            </TabButton>
          </TabButton>
        </TabButtonList>
        <TabViewList>
          <TabView id="foo">
            Foo
          </TabView>
          <TabView id="bar">
            Bar
          </TabView>
          <TabView id="baz">
            Baz
          </TabView>
          <TabView id="qux">
            Qux
          </TabView>
        </TabViewList>
      </Tabs>,
      this.container
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  it("calls handleTabChange function", function() {
    const tabButtons = ReactDOM.findDOMNode(this.instance).querySelectorAll(
      ".menu-tabbed-item"
    );

    TestUtils.Simulate.click(
      tabButtons[1].querySelector(".menu-tabbed-item-label")
    );
    expect(this.handleTabChange.mock.calls[0]).toEqual(["bar"]);
  });

  it("should update to the correct active tab", function() {
    let activeTab = ReactDOM.findDOMNode(this.instance).querySelector(
      ".menu-tabbed-item.active .menu-tabbed-item-label"
    );
    expect(activeTab.textContent).toEqual("Foo");

    this.instance = ReactDOM.render(
      <Tabs
        vertical={true}
        activeTab="qux"
        handleTabChange={this.handleTabChange}
      >
        <TabButtonList>
          <TabButton id="foo" label="Foo">
            <TabButton id="bar" label="Bar" />
            <TabButton id="baz" label="Baz">
              <TabButton id="qux" label="Qux" />
            </TabButton>
          </TabButton>
        </TabButtonList>
        <TabViewList>
          <TabView id="foo">
            Foo
          </TabView>
          <TabView id="bar">
            Bar
          </TabView>
          <TabView id="baz">
            Baz
          </TabView>
          <TabView id="qux">
            Qux
          </TabView>
        </TabViewList>
      </Tabs>,
      this.container
    );

    activeTab = ReactDOM.findDOMNode(this.instance).querySelector(
      ".menu-tabbed-item.active .menu-tabbed-item-label"
    );
    expect(activeTab.textContent).toEqual("Qux");
  });

  it("should pass the activeTab prop to its children", function() {
    const tabButtons = ReactDOM.findDOMNode(this.instance).querySelectorAll(
      ".menu-tabbed-item"
    );

    // Click on the 'Foo' tab.
    TestUtils.Simulate.click(
      tabButtons[0].querySelector(".menu-tabbed-item-label")
    );

    const tabViewsInstance = TestUtils.scryRenderedComponentsWithType(
      this.instance,
      TabViewList
    )[0];
    const tabButtonsInstance = TestUtils.scryRenderedComponentsWithType(
      this.instance,
      TabButtonList
    )[0];

    expect(tabViewsInstance.props.activeTab).toEqual("foo");
    expect(tabButtonsInstance.props.activeTab).toEqual("foo");
  });

  it("should pass the change handler to TabButtonList", function() {
    const tabButtonsInstance = TestUtils.scryRenderedComponentsWithType(
      this.instance,
      TabButtonList
    )[0];
    expect(tabButtonsInstance.props.onChange).toEqual(this.handleTabChange);
  });

  it("should pass the vertical prop to TabButtonList", function() {
    const tabButtonsInstance = TestUtils.scryRenderedComponentsWithType(
      this.instance,
      TabButtonList
    )[0];
    expect(tabButtonsInstance.props.vertical).toEqual(true);
  });
});
