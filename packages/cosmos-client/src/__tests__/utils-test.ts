import { getErrorMessage } from "../utils";

describe("cosmos-client utils", () => {
  describe("#getErrorMessage", () => {
    it("returns the response if its a string", () => {
      const reqResp = {
        code: 400,
        message: "Bad Request",
        response: "I'm a string response"
      };
      expect(getErrorMessage(reqResp)).toEqual("I'm a string response");
    });

    it("returns response.description if it exists", () => {
      const reqResp = {
        code: 400,
        message: "Bad Request",
        response: {
          description: "I'm a response.description"
        }
      };
      expect(getErrorMessage(reqResp)).toEqual("I'm a response.description");
    });

    it("returns response.message if it exists and description doesn't", () => {
      const reqResp = {
        code: 400,
        message: "Bad Request",
        response: {
          message: "I'm a response.message"
        }
      };
      expect(getErrorMessage(reqResp)).toEqual("I'm a response.message");
    });

    it("returns message if the response doesn't have the expected keys", () => {
      const reqResp = {
        code: 400,
        message: "Bad Request",
        response: {
          somethingElse: "I'm a something else"
        }
      };
      expect(getErrorMessage(reqResp)).toEqual("Bad Request");
    });

    it("falls back to a canned error if message is empty", () => {
      const reqResp = {
        code: 400,
        message: "",
        response: {
          somethingElse: "I'm a something else"
        }
      };
      expect(getErrorMessage(reqResp)).toEqual("An error has occurred.");
    });
  });
});
