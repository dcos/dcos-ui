jest.dontMock("../../../utils/DOMUtils");
jest.dontMock("../../../utils/JestUtil");
jest.dontMock(".././ModalHeading");
jest.dontMock("../VersionsModal");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const VersionsModal = require("../VersionsModal");

describe("VersionsModal", function() {
  describe("#onClose", function() {
    beforeEach(function() {
      this.callback = jasmine.createSpy();

      this.container = global.document.createElement("div");
      this.instance = ReactDOM.render(
        <VersionsModal onClose={this.callback} versionDump={{}} />,
        this.container
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("shouldn't call the callback after initialization", function() {
      expect(this.callback).not.toHaveBeenCalled();
    });

    it("should call the callback when #onClose is called", function() {
      this.instance.onClose();
      expect(this.callback).toHaveBeenCalled();
    });
  });

  describe("#getContent", function() {
    beforeEach(function() {
      var data = { foo: "bar" };
      this.container = global.document.createElement("div");
      this.instance = ReactDOM.render(
        <VersionsModal
          onClose={function() {}}
          versionDump={data}
          open={true}
        />,
        this.container
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("should return a pre element tag", function() {
      var content = this.instance.getContent();
      var contentInstance = ReactDOM.render(content, this.container);
      var node = ReactDOM.findDOMNode(contentInstance);
      expect(node.tagName).toBe("PRE");
    });

    it("should return a pre element tag", function() {
      var content = this.instance.getContent();
      var contentInstance = ReactDOM.render(content, this.container);
      var node = ReactDOM.findDOMNode(contentInstance);
      expect(node.innerHTML).toEqual('{\n  "foo": "bar"\n}');
    });
  });
});
