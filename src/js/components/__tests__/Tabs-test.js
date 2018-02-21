const React = require("react");
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const TabButton = require("../TabButton");
const TabButtonList = require("../TabButtonList");
const Tabs = require("../Tabs");
const TabView = require("../TabView");
const TabViewList = require("../TabViewList");

let thisHandleTabChange, thisContainer, thisInstance;

describe("Tabs", function() {
  beforeEach(function() {
    thisHandleTabChange = jest.fn();
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <Tabs
        vertical={true}
        handleTabChange={thisHandleTabChange}
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
      thisContainer
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  it("calls handleTabChange function", function() {
    const tabButtons = ReactDOM.findDOMNode(thisInstance).querySelectorAll(
      ".menu-tabbed-item"
    );

    TestUtils.Simulate.click(
      tabButtons[1].querySelector(".menu-tabbed-item-label")
    );
    expect(thisHandleTabChange.mock.calls[0]).toEqual(["bar"]);
  });

  it("updates to the correct active tab", function() {
    let activeTab = ReactDOM.findDOMNode(thisInstance).querySelector(
      ".menu-tabbed-item.active .menu-tabbed-item-label"
    );
    expect(activeTab.textContent).toEqual("Foo");

    thisInstance = ReactDOM.render(
      <Tabs
        vertical={true}
        activeTab="qux"
        handleTabChange={thisHandleTabChange}
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
      thisContainer
    );

    activeTab = ReactDOM.findDOMNode(thisInstance).querySelector(
      ".menu-tabbed-item.active .menu-tabbed-item-label"
    );
    expect(activeTab.textContent).toEqual("Qux");
  });

  it("passes the activeTab prop to its children", function() {
    const tabButtons = ReactDOM.findDOMNode(thisInstance).querySelectorAll(
      ".menu-tabbed-item"
    );

    // Click on the 'Foo' tab.
    TestUtils.Simulate.click(
      tabButtons[0].querySelector(".menu-tabbed-item-label")
    );

    const tabViewsInstance = TestUtils.scryRenderedComponentsWithType(
      thisInstance,
      TabViewList
    )[0];
    const tabButtonsInstance = TestUtils.scryRenderedComponentsWithType(
      thisInstance,
      TabButtonList
    )[0];

    expect(tabViewsInstance.props.activeTab).toEqual("foo");
    expect(tabButtonsInstance.props.activeTab).toEqual("foo");
  });

  it("passes the change handler to TabButtonList", function() {
    const tabButtonsInstance = TestUtils.scryRenderedComponentsWithType(
      thisInstance,
      TabButtonList
    )[0];
    expect(tabButtonsInstance.props.onChange).toEqual(thisHandleTabChange);
  });

  it("passes the vertical prop to TabButtonList", function() {
    const tabButtonsInstance = TestUtils.scryRenderedComponentsWithType(
      thisInstance,
      TabButtonList
    )[0];
    expect(tabButtonsInstance.props.vertical).toEqual(true);
  });
});
