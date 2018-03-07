/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const ClickToSelect = require("../ClickToSelect");

let thisSpy, thisGetSelection, thisContainer, thisInstance;

describe("ClickToSelect", function() {
  beforeEach(function() {
    thisSpy = { selectAllChildren: jasmine.createSpy() };
    thisGetSelection = global.document.getSelection;

    // Mock this document function, which is unsupported by jest.
    global.document.getSelection = function() {
      return thisSpy;
    };

    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <ClickToSelect>
        <span>hello text</span>
      </ClickToSelect>,
      thisContainer
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
    global.document.getSelection = thisGetSelection;
  });

  it("sets selection when node is clicked", function() {
    var node = ReactDOM.findDOMNode(thisInstance);
    var element = node.querySelector("span");

    TestUtils.Simulate.click(element);

    expect(thisSpy.selectAllChildren).toHaveBeenCalled();
  });
});
