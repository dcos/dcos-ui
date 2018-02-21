const QueryParamsMixin = require("../QueryParamsMixin");

let thisInstance;

describe("QueryParamsMixin", function() {
  beforeEach(function() {
    thisInstance = QueryParamsMixin;
    thisInstance.props = {
      location: {
        pathname: "/pathname",
        query: {
          stringValue: "string",
          arrayValue: ["value1", "value2"]
        }
      }
    };
    thisInstance.context = {
      router: {
        push: jasmine.createSpy()
      }
    };
  });

  it("returns the current pathname", function() {
    expect(thisInstance.getCurrentPathname()).toEqual("/pathname");
  });

  it("returns an Object built from the query params", function() {
    const queryParamObject = {
      stringValue: "string",
      arrayValue: ["value1", "value2"]
    };
    expect(thisInstance.getQueryParamObject()).toEqual(queryParamObject);
  });

  it("returns a specific value from the query params object", function() {
    expect(thisInstance.getQueryParamObject()["stringValue"]).toEqual("string");
  });

  it("transitions to the right path with the given query params", function() {
    const queryObject = {
      arrayValue: ["value1", "value2"],
      paramKey: "paramValue",
      stringValue: "string"
    };

    thisInstance.setQueryParam("paramKey", "paramValue");

    const push = thisInstance.context.router.push;

    expect(push.calls.count()).toEqual(1);

    const { pathname, query } = push.calls.first().args[0];

    expect(pathname).toEqual("/pathname");
    expect(query).toEqual(queryObject);
  });

  it("decodes an arrayString given in the query params", function() {
    const decodedArrayString = thisInstance.decodeQueryParamArray("a;b;c");
    expect(decodedArrayString).toEqual(["a", "b", "c"]);
  });

  it("encodes nested arrays in query params", function() {
    const queryObject = {
      arrayValue: ["value1", "value2"],
      nestedArray: ["1;2;3", "4;5;6", "", "7;;8", "non-array"],
      stringValue: "string"
    };

    thisInstance.setQueryParam("nestedArray", [
      [1, 2, 3],
      [4, 5, 6],
      [],
      ["7", null, "8"],
      "non-array"
    ]);

    const push = thisInstance.context.router.push;

    expect(push.calls.count()).toEqual(1);

    const { pathname, query } = push.calls.first().args[0];

    expect(pathname).toEqual("/pathname");
    expect(query).toEqual(queryObject);
  });

  describe("#resetQueryParams", function() {
    it("resets all params by default", function() {
      thisInstance.resetQueryParams();
      expect(thisInstance.context.router.push).toHaveBeenCalledWith({
        pathname: "/pathname",
        query: {}
      });
    });

    it("resets only specified params, when present", function() {
      thisInstance.resetQueryParams(["arrayValue"]);
      expect(thisInstance.context.router.push).toHaveBeenCalledWith({
        pathname: "/pathname",
        query: { stringValue: "string" }
      });
    });

    it("exits cleanly when called without a router", function() {
      expect(thisInstance.resetQueryParams.bind({ context: {} })).not.toThrow();
    });
  });
});
