const mockDataLayer = jest.fn();
jest.mock("@dcos/data-service", () => ({
  graphqlObservable: mockDataLayer
}));

import { marbles } from "rxjs-marbles/jest";

import { getAction$ } from "../streams";
import { rollbackUI, updateUI } from "../commands";

describe("commands", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("#rollbackUI", () => {
    it(
      "emits two actions",
      marbles(m => {
        mockDataLayer.mockReturnValueOnce(
          m.cold("-j|", {
            j: {
              data: {
                resetDCOSUI: "OK"
              }
            }
          })
        );
        const actionSpy = jest.spyOn(getAction$(), "next");

        rollbackUI(1);
        m.flush();
        expect(actionSpy).toHaveBeenCalledTimes(2);
      })
    );
    it(
      "emits Reset started action",
      marbles(m => {
        mockDataLayer.mockReturnValueOnce(
          m.cold("-j|", {
            j: {
              data: {
                resetDCOSUI: "OK"
              }
            }
          })
        );
        const actionSpy = jest.spyOn(getAction$(), "next");

        rollbackUI(1);
        expect(actionSpy.mock.calls[0]).toEqual([
          {
            type: "UIReset",
            action: "start",
            value: { message: "" }
          }
        ]);
      })
    );
    it(
      "emits Reset completed action",
      marbles(m => {
        mockDataLayer.mockReturnValueOnce(
          m.cold("-j|", {
            j: {
              data: {
                resetDCOSUI: "OK"
              }
            }
          })
        );
        const actionSpy = jest.spyOn(getAction$(), "next");

        rollbackUI(1);
        m.flush();
        expect(actionSpy.mock.calls[1]).toEqual([
          {
            type: "UIReset",
            action: "complete",
            value: { message: "OK" }
          }
        ]);
      })
    );
    it(
      "emits error if mutation fails",
      marbles(m => {
        mockDataLayer.mockReturnValueOnce(
          m.cold("-#", undefined, {
            message: "On No Something bad happened",
            name: "Error"
          })
        );
        const actionSpy = jest.spyOn(getAction$(), "next");

        rollbackUI(1);
        m.flush();
        expect(actionSpy.mock.calls[1]).toEqual([
          {
            type: "UIReset",
            action: "error",
            value: { message: "On No Something bad happened" }
          }
        ]);
      })
    );
  });
  describe("#updateUI", () => {
    it(
      "emits two actions",
      marbles(m => {
        mockDataLayer.mockReturnValueOnce(
          m.cold("-j|", {
            j: {
              data: {
                updateDCOSUI: "OK"
              }
            }
          })
        );
        const actionSpy = jest.spyOn(getAction$(), "next");

        updateUI("1.0.0", 1);
        m.flush();
        expect(actionSpy).toHaveBeenCalledTimes(2);
      })
    );
    it(
      "emits Update started action",
      marbles(m => {
        mockDataLayer.mockReturnValueOnce(
          m.cold("-j|", {
            j: {
              data: {
                updateDCOSUI: "OK"
              }
            }
          })
        );
        const actionSpy = jest.spyOn(getAction$(), "next");

        updateUI("1.0.0", 1);
        expect(actionSpy.mock.calls[0]).toEqual([
          {
            type: "UIUpdate",
            action: "start",
            value: {
              data: "1.0.0",
              message: ""
            }
          }
        ]);
      })
    );
    it(
      "emits Update completed action",
      marbles(m => {
        mockDataLayer.mockReturnValueOnce(
          m.cold("-j|", {
            j: {
              data: {
                updateDCOSUI: "OK"
              }
            }
          })
        );
        const actionSpy = jest.spyOn(getAction$(), "next");

        updateUI("1.0.0", 1);
        m.flush();
        expect(actionSpy.mock.calls[1]).toEqual([
          {
            type: "UIUpdate",
            action: "complete",
            value: { message: "OK" }
          }
        ]);
      })
    );
    it(
      "emits error if mutation fails",
      marbles(m => {
        mockDataLayer.mockReturnValueOnce(
          m.cold("-#", undefined, {
            message: "On No Something bad happened",
            name: "Error"
          })
        );
        const actionSpy = jest.spyOn(getAction$(), "next");

        updateUI("1.0.1", 1);
        m.flush();
        expect(actionSpy.mock.calls[1]).toEqual([
          {
            type: "UIUpdate",
            action: "error",
            value: {
              data: "1.0.1",
              message: "On No Something bad happened"
            }
          }
        ]);
      })
    );
  });
});
