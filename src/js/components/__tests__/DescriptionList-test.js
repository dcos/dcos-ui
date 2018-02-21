/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const HashMapDisplay = require("../HashMapDisplay");

let thisContainer;

describe("HashMapDisplay", function() {
  beforeEach(function() {
    thisContainer = global.document.createElement("div");
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  it("returns null if hash is not passed", function() {
    var instance = ReactDOM.render(<HashMapDisplay />, thisContainer);

    var result = ReactDOM.findDOMNode(instance);
    expect(TestUtils.isDOMComponent(result)).toEqual(false);
  });

  it("returns null if hash is not passed with headline", function() {
    var instance = ReactDOM.render(
      <HashMapDisplay headline="foo" />,
      thisContainer
    );

    var result = ReactDOM.findDOMNode(instance);
    expect(TestUtils.isDOMComponent(result)).toEqual(false);
  });

  it("returns null if undefined is passed to hash", function() {
    var instance = ReactDOM.render(
      <HashMapDisplay hash={undefined} />,
      thisContainer
    );

    var result = ReactDOM.findDOMNode(instance);
    expect(TestUtils.isDOMComponent(result)).toEqual(false);
  });

  it("returns null if empty object is passed to hash", function() {
    var instance = ReactDOM.render(<HashMapDisplay hash={{}} />, thisContainer);

    var result = ReactDOM.findDOMNode(instance);
    expect(TestUtils.isCompositeComponent(result)).toEqual(false);
  });

  it("returns a node of elements if node exists", function() {
    var instance = ReactDOM.render(
      <HashMapDisplay hash={{ foo: "bar" }} />,
      thisContainer
    );

    var result = ReactDOM.findDOMNode(instance);
    expect(TestUtils.isDOMComponent(result)).toEqual(true);
  });

  it("returns a headline if headline string is given", function() {
    var instance = ReactDOM.render(
      <HashMapDisplay hash={{ foo: "bar" }} headline="baz" />,
      thisContainer
    );

    var node = ReactDOM.findDOMNode(instance);
    var headline = node.querySelector(".configuration-map-heading");

    expect(headline.textContent).toEqual("baz");
  });
});
