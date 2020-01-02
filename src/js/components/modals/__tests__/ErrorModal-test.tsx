import ErrorModal from "../ErrorModal";

const React = require("react");

const ReactDOM = require("react-dom");

let thisCallback, thisContainer, thisInstance;

describe("ErrorModal", () => {
  describe("#onClose", () => {
    beforeEach(() => {
      thisCallback = jasmine.createSpy();
      thisContainer = window.document.createElement("div");
      thisInstance = ReactDOM.render(
        <ErrorModal onClose={thisCallback} />,
        thisContainer
      );
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("doesn't call the callback after initialization", () => {
      expect(thisCallback).not.toHaveBeenCalled();
    });

    it("calls the callback when #onClose is called", () => {
      thisInstance.onClose();
      expect(thisCallback).toHaveBeenCalled();
    });
  });
});
