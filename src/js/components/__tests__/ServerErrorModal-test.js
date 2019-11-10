/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const ServerErrorModal = require("../ServerErrorModal");

let thisContainer, thisInstance;

describe("ServerErrorModal", () => {
  beforeEach(() => {
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(<ServerErrorModal />, thisContainer);
  });
  afterEach(() => {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#handleModalClose", () => {
    beforeEach(() => {
      thisInstance.handleModalClose();
    });

    it("closes the modal", () => {
      expect(thisInstance.state.isOpen).toEqual(false);
    });

    it("resets the error array", () => {
      expect(thisInstance.state.errors).toEqual([]);
    });
  });

  describe("#handleServerError", () => {
    it("doesn't throw when an id and errorMessage are passed", () => {
      const fn = thisInstance.handleServerError.bind(
        thisInstance,
        "foo",
        "bar"
      );
      expect(fn).not.toThrow();
    });

    it("doesn't throw when an id is passed", () => {
      const fn = thisInstance.handleServerError.bind(thisInstance, "foo");
      expect(fn).not.toThrow();
    });

    it("throws an error when no id or errorMessage is passed", () => {
      const fn = thisInstance.handleServerError.bind(thisInstance);
      expect(fn).toThrow();
    });
  });

  describe("#getContent", () => {
    it("returns the same number of children as errors", () => {
      thisInstance.state.errors = [1, 2, 3];
      var contents = thisInstance.getContent();
      var result = contents.props.children;

      expect(result.length).toEqual(3);
    });
  });
});
