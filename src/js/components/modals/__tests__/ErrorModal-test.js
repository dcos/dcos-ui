/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const ErrorModal = require("../ErrorModal");

let thisCallback, thisContainer, thisInstance;

describe("ErrorModal", () => {
  describe("#onClose", () => {
    beforeEach(() => {
      thisCallback = jasmine.createSpy();
      thisContainer = global.document.createElement("div");
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
