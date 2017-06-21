jest.dontMock("../QueryParamsMixin");

const QueryParamsMixin = require("../QueryParamsMixin");

describe("QueryParamsMixin", function() {
  beforeEach(function() {
    this.instance = QueryParamsMixin;
    this.instance.props = {
      location: {
        pathname: "/pathname",
        query: {
          stringValue: "string",
          arrayValue: ["value1", "value2"]
        }
      }
    };
    this.instance.context = {
      router: {
        push: jasmine.createSpy()
      }
    };
  });

  it("returns the current pathname", function() {
    expect(this.instance.getCurrentPathname()).toEqual("/pathname");
  });

  it("returns an Object built from the query params", function() {
    const queryParamObject = {
      stringValue: "string",
      arrayValue: ["value1", "value2"]
    };
    expect(this.instance.getQueryParamObject()).toEqual(queryParamObject);
  });

  it("returns a specific value from the query params object", function() {
    expect(this.instance.getQueryParamObject()["stringValue"]).toEqual(
      "string"
    );
  });

  it("should transition to the right path with the given query params", function() {
    const queryObject = {
      arrayValue: ["value1", "value2"],
      paramKey: "paramValue",
      stringValue: "string"
    };

    this.instance.setQueryParam("paramKey", "paramValue");

    const push = this.instance.context.router.push;

    expect(push.calls.count()).toEqual(1);

    const { pathname, query } = push.calls.first().args[0];

    expect(pathname).toEqual("/pathname");
    expect(query).toEqual(queryObject);
  });

  it("decodes an arrayString given in the query params", function() {
    const decodedArrayString = this.instance.decodeQueryParamArray("a;b;c");
    expect(decodedArrayString).toEqual(["a", "b", "c"]);
  });

  it("should encode nested arrays in query params", function() {
    const queryObject = {
      arrayValue: ["value1", "value2"],
      nestedArray: ["1;2;3", "4;5;6", "", "7;;8", "non-array"],
      stringValue: "string"
    };

    this.instance.setQueryParam("nestedArray", [
      [1, 2, 3],
      [4, 5, 6],
      [],
      ["7", null, "8"],
      "non-array"
    ]);

    const push = this.instance.context.router.push;

    expect(push.calls.count()).toEqual(1);

    const { pathname, query } = push.calls.first().args[0];

    expect(pathname).toEqual("/pathname");
    expect(query).toEqual(queryObject);
  });

  describe("#resetQueryParams", function() {
    it("should reset all params by default", function() {
      this.instance.resetQueryParams();
      expect(this.instance.context.router.push).toHaveBeenCalledWith({
        pathname: "/pathname",
        query: {}
      });
    });

    it("should reset only specified params, when present", function() {
      this.instance.resetQueryParams(["arrayValue"]);
      expect(this.instance.context.router.push).toHaveBeenCalledWith({
        pathname: "/pathname",
        query: { stringValue: "string" }
      });
    });

    it("should exit cleanly when called without a router", function() {
      expect(
        this.instance.resetQueryParams.bind({ context: {} })
      ).not.toThrow();
    });
  });
});
