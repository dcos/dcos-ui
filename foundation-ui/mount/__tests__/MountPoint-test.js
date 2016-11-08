jest.dontMock('../MountPoint');
jest.dontMock('../MountService');
jest.dontMock('../../utils/ReactUtil');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const TestUtils = require('react-addons-test-utils');

const MountPoint = require('../MountPoint');
const MountService = require('../MountService');

describe('MountPoint', function () {
  const FirstTestComponent = function (props) {
    return (<div className="component">{props.message}</div>);
  };

  const SecondTestComponent = function (props) {
    return (<div className="component">{props.message}</div>);
  };

  beforeEach(function () {
    MountService.registerComponent(FirstTestComponent, 'mount-test');
  });

  afterEach(function () {
    MountService.unregisterComponent(FirstTestComponent, 'mount-test');
    MountService.unregisterComponent(SecondTestComponent, 'mount-test');
  });

  it('should render the children by default', function () {
    const result = TestUtils.renderIntoDocument(
        <MountPoint type="children-test">
          <span>foo</span>
        </MountPoint>
    );

    expect(TestUtils.findRenderedDOMComponentWithTag(result, 'span'))
        .toBeDefined();
  });

  it('should render null if no component is registered and no children defined',
      function () {
        const renderer = TestUtils.createRenderer();
        renderer.render(<MountPoint type="children-test" />);

        expect(renderer.getRenderOutput()).toBe(null);
      }
  );

  it('should not wrap a single child', function () {
    const renderer = TestUtils.createRenderer();
    renderer.render(
        <MountPoint type="foo">
          <span>foo</span>
        </MountPoint>
    );

    expect(TestUtils.isElementOfType(renderer.getRenderOutput(), 'span'))
        .toBe(true);
  });

  it('should always wrap elements if configured', function () {
    const renderer = TestUtils.createRenderer();
    renderer.render(
        <MountPoint type="foo" alwaysWrap={true}>
          <span>foo</span>
        </MountPoint>
    );

    expect(TestUtils.isElementOfType(renderer.getRenderOutput(), 'div'))
        .toBe(true);
  });

  it('should wrap elements with provided wrapper', function () {
    const renderer = TestUtils.createRenderer();
    renderer.render(
        <MountPoint type="foo" wrapper="p" alwaysWrap={true}>
          <span>foo</span>
        </MountPoint>
    );

    expect(TestUtils.isElementOfType(renderer.getRenderOutput(), 'p'))
        .toBe(true);
  });

  it('should render registered components', function () {
    const dom = TestUtils.renderIntoDocument(
        <MountPoint type="mount-test">
          <span>foo</span>
        </MountPoint>
    );

    const result =
        TestUtils.scryRenderedDOMComponentsWithClass(dom, 'component');

    expect(result.length).toBe(1);
  });

  it('should replace children with registered components', function () {
    const dom = TestUtils.renderIntoDocument(
        <MountPoint type="mount-test">
          <span className="child">foo</span>
        </MountPoint>
    );

    const result =
        TestUtils.scryRenderedDOMComponentsWithClass(dom, 'child');

    expect(result.length).toBe(0);
  });

  it('should update if new component was registered', function () {
    const dom = TestUtils.renderIntoDocument(
        <MountPoint type="mount-test">
          <span className="child">foo</span>
        </MountPoint>
    );

    MountService.registerComponent(SecondTestComponent, 'mount-test');

    const result =
        TestUtils.scryRenderedDOMComponentsWithClass(dom, 'component');

    expect(result.length).toBe(2);
  });

  it('should update if new component was unregistered', function () {
    const dom = TestUtils.renderIntoDocument(
        <MountPoint type="mount-test">
          <span className="child">foo</span>
        </MountPoint>
    );

    MountService.unregisterComponent(FirstTestComponent, 'mount-test');

    const result =
        TestUtils.scryRenderedDOMComponentsWithClass(dom, 'child');

    expect(result.length).toBe(1);
  });

  it('should pass down properties', function () {
    const renderer = TestUtils.createRenderer();
    renderer.render(
        <MountPoint type="mount-test" message="hello world">
          <span>foo</span>
        </MountPoint>
    );

    expect(renderer.getRenderOutput().props.children[0].props)
        .toEqual({message:'hello world'});
  });

});
