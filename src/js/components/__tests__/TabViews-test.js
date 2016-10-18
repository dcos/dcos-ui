jest.dontMock('../TabView');
jest.dontMock('../TabViews');

const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');

const TabView = require('../TabView');
const TabViews = require('../TabViews');

describe('TabViews', function () {

  it('should return content of first child if no activeTab is defined', function () {
    this.instance = TestUtils.renderIntoDocument(
      <TabViews>
        <TabView id="foo">foo</TabView>
        <TabView id="bar">bar</TabView>
        <TabView id="baz">baz</TabView>
      </TabViews>
    );

    let node = ReactDOM.findDOMNode(this.instance);
    expect(node.textContent).toEqual('foo');
  });

  it('should return content of activeTab when defined', function () {
    this.instance = TestUtils.renderIntoDocument(
      <TabViews activeTab="bar">
        <TabView id="foo">foo</TabView>
        <TabView id="bar">bar</TabView>
        <TabView id="baz">baz</TabView>
      </TabViews>
    );

    let node = ReactDOM.findDOMNode(this.instance);
    expect(node.textContent).toEqual('bar');
  });

});
