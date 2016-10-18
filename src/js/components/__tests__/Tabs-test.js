jest.dontMock('../TabButton');
jest.dontMock('../TabButtons');
jest.dontMock('../Tabs');
jest.dontMock('../TabView');
jest.dontMock('../TabViews');

const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');

const TabButton = require('../TabButton');
const TabButtons = require('../TabButtons');
const Tabs = require('../Tabs');
const TabView = require('../TabView');
const TabViews = require('../TabViews');

describe('TabButtons', function () {

  beforeEach(function () {
    this.instance = TestUtils.renderIntoDocument(
      <Tabs vertical={true}>
        <TabButtons>
          <TabButton id="foo" label="Foo">
            <TabButton id="bar" label="Bar" />
            <TabButton id="baz" label="Baz">
              <TabButton id="qux" label="Qux" />
            </TabButton>
          </TabButton>
        </TabButtons>
        <TabViews>
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
        </TabViews>
      </Tabs>
    );
  });

  it('should maintain state of the active tab', function () {
    let tabButtons = ReactDOM.findDOMNode(this.instance).querySelectorAll('.menu-tabbed-item');

    expect(this.instance.state.activeTab).toEqual(null);
    TestUtils.Simulate.click(tabButtons[0].querySelector('.menu-tabbed-item-label'));
    expect(this.instance.state.activeTab).toEqual('foo');
    TestUtils.Simulate.click(tabButtons[1].querySelector('.menu-tabbed-item-label'));
    expect(this.instance.state.activeTab).toEqual('bar');
  });

  it('should pass the activeTab prop to its children', function () {
    let tabButtons = ReactDOM.findDOMNode(this.instance).querySelectorAll('.menu-tabbed-item');

    // Click on the 'Foo' tab.
    TestUtils.Simulate.click(tabButtons[0].querySelector('.menu-tabbed-item-label'));

    let tabViewsInstance = TestUtils.scryRenderedComponentsWithType(this.instance, TabViews)[0];
    let tabButtonsInstance = TestUtils.scryRenderedComponentsWithType(this.instance, TabButtons)[0];

    expect(tabViewsInstance.props.activeTab).toEqual('foo');
    expect(tabButtonsInstance.props.activeTab).toEqual('foo');
  });

  it('should pass the change handler to TabButtons', function () {
    let tabButtonsInstance = TestUtils.scryRenderedComponentsWithType(this.instance, TabButtons)[0];
    expect(tabButtonsInstance.props.onChange).toEqual(this.instance.handleTabChange);
  });

  it('should pass the vertical prop to TabButtons', function () {
    let tabButtonsInstance = TestUtils.scryRenderedComponentsWithType(this.instance, TabButtons)[0];
    expect(tabButtonsInstance.props.vertical).toEqual(true);
  });

});
