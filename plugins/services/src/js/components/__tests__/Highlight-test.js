jest.dontMock("../Highlight");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");
const Highlight = require("../Highlight");

describe("Highlight instance", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
  });
  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });
  it("is what it says it is", function() {
    var instance = ReactDOM.render(
      <Highlight search="world">
        Hello World
      </Highlight>,
      this.container
    );
    var node = ReactDOM.findDOMNode(instance);
    var match = node.querySelector("strong");
    expect(TestUtils.isCompositeComponent(instance)).toBe(true);
    expect(TestUtils.isCompositeComponentWithType(instance, Highlight)).toBe(
      true
    );
    expect(match.textContent).toEqual("World");
  });

  it("should have children", function() {
    var instance = ReactDOM.render(
      <Highlight search="fox">
        The quick brown fox jumped over the lazy dog.
      </Highlight>,
      this.container
    );

    var node = ReactDOM.findDOMNode(instance);
    var matches = node.querySelectorAll(".highlight");
    expect(node.children.length).toEqual(3);
    expect(matches.length).toEqual(1);
  });

  it("should support custom HTML tag for matching elements", function() {
    var instance = ReactDOM.render(
      <Highlight matchElement="em" search="world">
        Hello World
      </Highlight>,
      this.container
    );

    var node = ReactDOM.findDOMNode(instance);
    var matches = node.querySelectorAll("em");
    expect(matches.length).toEqual(1);
  });

  it("should support custom className for matching element", function() {
    var instance = ReactDOM.render(
      <Highlight matchClass="fffffound" search="Seek">
        Hide and Seek
      </Highlight>,
      this.container
    );

    var node = ReactDOM.findDOMNode(instance);
    var matches = node.querySelectorAll(".fffffound");
    expect(matches.length).toEqual(1);
  });

  it("should support passing props to parent element", function() {
    var instance = ReactDOM.render(
      <Highlight className="myHighlighter" search="world">
        Hello World
      </Highlight>,
      this.container
    );

    var node = ReactDOM.findDOMNode(instance);
    var match = node.querySelector("strong");

    expect(node.className).toEqual("myHighlighter");
    expect(match.className).toEqual("highlight");
  });

  it("should support regular expressions in search", function() {
    var instance = ReactDOM.render(
      <Highlight className="myHighlighter" search={/[A-Za-z]+/}>
        Easy as 123, ABC...
      </Highlight>,
      this.container
    );

    var node = ReactDOM.findDOMNode(instance);
    var matches = node.querySelectorAll("strong");

    expect(matches[0].textContent).toEqual("Easy");
    expect(matches[1].textContent).toEqual("as");
    expect(matches[2].textContent).toEqual("ABC");
  });

  it("should support escaping arbitrary string in search", function() {
    function renderInstance() {
      ReactDOM.render(
        <Highlight className="myHighlighter" search="Test (">
          Test (should not throw)
        </Highlight>,
        this.container
      );
    }
    expect(renderInstance.bind(this)).not.toThrow();
  });
});
