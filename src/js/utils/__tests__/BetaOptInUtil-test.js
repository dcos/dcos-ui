jest.dontMock("../BetaOptInUtil");

const BetaOptInUtil = require("../BetaOptInUtil");

describe("BetaOptInUtil", function() {
  const betaSchema = {
    properties: {
      service: {
        required: ["beta-optin", "foo"],
        properties: {
          "beta-optin": {
            type: "boolean"
          },
          foo: {
            type: "string"
          }
        }
      }
    }
  };

  const nonBetaSchema = {
    properties: {
      service: {
        required: ["foo"],
        properties: {
          foo: {
            type: "string"
          }
        }
      }
    }
  };

  describe("#isBeta", function() {
    it("returns true for beta package schema", function() {
      expect(BetaOptInUtil.isBeta(betaSchema)).toEqual(true);
    });

    it("returns false for non-beta package schema", function() {
      expect(BetaOptInUtil.isBeta(nonBetaSchema)).toEqual(false);
    });
  });

  describe("#getProperty", function() {
    it("returns beta-optin property for beta package schema", function() {
      expect(BetaOptInUtil.getProperty(betaSchema)).toEqual({
        type: "boolean"
      });
    });

    it("returns undefined for non-beta package schema", function() {
      expect(BetaOptInUtil.getProperty(nonBetaSchema)).toEqual(undefined);
    });
  });

  describe("#filterProperty", function() {
    it("does not mutuate original schema", function() {
      expect(BetaOptInUtil.filterProperty(betaSchema)).not.toEqual(betaSchema);
    });

    it("returns schema object with beta-optin removed for beta package schema", function() {
      expect(BetaOptInUtil.filterProperty(betaSchema)).toEqual(nonBetaSchema);
    });

    it("returns original package schema for non-beta package schema", function() {
      expect(BetaOptInUtil.filterProperty(nonBetaSchema)).toEqual(
        nonBetaSchema
      );
    });
  });

  describe("#setBetaOptIn", function() {
    it("returns config argument if config is not an object", function() {
      expect(BetaOptInUtil.setBetaOptIn()).toEqual(undefined);
    });

    it("returns config with beta-optin set to true on emtpy config", function() {
      expect(BetaOptInUtil.setBetaOptIn({})).toEqual({
        service: {
          "beta-optin": true
        }
      });
    });

    it("returns config with beta-optin set to true on existing config", function() {
      expect(
        BetaOptInUtil.setBetaOptIn({
          foo: "bar",
          service: {
            foobar: "baz"
          }
        })
      ).toEqual({
        foo: "bar",
        service: {
          "beta-optin": true,
          foobar: "baz"
        }
      });
    });
  });
});
