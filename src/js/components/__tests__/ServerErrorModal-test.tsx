import ServerErrorModal from "../ServerErrorModal";

import * as React from "react";
import ReactDOM from "react-dom";

let thisContainer, thisInstance;

describe("ServerErrorModal", () => {
  beforeEach(() => {
    thisContainer = window.document.createElement("div");
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
});
