/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const ErrorModal = require("../ErrorModal");

let thisCallback, thisContainer, thisInstance;

describe("ErrorModal", function() {
  describe("#onClose", function() {
    beforeEach(function() {
      thisCallback = jasmine.createSpy();
      thisContainer = global.document.createElement("div");
      thisInstance = ReactDOM.render(
        <ErrorModal onClose={thisCallback} />,
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
});
