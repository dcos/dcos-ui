/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const VersionsModal = require("../VersionsModal");

let thisCallback, thisContainer, thisInstance;

describe("VersionsModal", function() {
  describe("#onClose", function() {
    beforeEach(function() {
      thisCallback = jasmine.createSpy();

      thisContainer = global.document.createElement("div");
      thisInstance = ReactDOM.render(
        <VersionsModal onClose={thisCallback} versionDump={{}} />,
        thisContainer
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("doesn't call the callback after initialization", function() {
      expect(thisCallback).not.toHaveBeenCalled();
    });

    it("calls the callback when #onClose is called", function() {
      thisInstance.onClose();
      expect(thisCallback).toHaveBeenCalled();
    });
  });

  describe("#getContent", function() {
    beforeEach(function() {
      var data = { foo: "bar" };
      thisContainer = global.document.createElement("div");
      thisInstance = ReactDOM.render(
        <VersionsModal
          onClose={function() {}}
          versionDump={data}
          open={true}
        />,
        thisContainer
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("returns a pre element tag", function() {
      var content = thisInstance.getContent();
      var contentInstance = ReactDOM.render(content, thisContainer);
      var node = ReactDOM.findDOMNode(contentInstance);
      expect(node.tagName).toBe("PRE");
    });

    it("returns a pre element tag", function() {
      var content = thisInstance.getContent();
      var contentInstance = ReactDOM.render(content, thisContainer);
      var node = ReactDOM.findDOMNode(contentInstance);
      expect(node.innerHTML).toEqual('{\n  "foo": "bar"\n}');
    });
  });
});
