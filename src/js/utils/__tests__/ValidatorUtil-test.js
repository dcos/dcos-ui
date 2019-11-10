describe("ValidatorUtil", () => {
  const ValidatorUtil = require("../ValidatorUtil");

  describe("#isCallable", function() {
    describe("with a function", function() {
      it("returns true", function() {
        expect(ValidatorUtil.isCallable(function() {})).toBe(true);
      });
    });

    describe("with a callable object", function() {
      it("returns true", function() {
        const callable = {
          call() {}
        };

        expect(ValidatorUtil.isCallable(callable)).toBe(true);
      });
    });

    describe("with an instance of a callable class", function() {
      it("returns true", function() {
        class Callable {
          call() {}
        }

        expect(ValidatorUtil.isCallable(new Callable())).toBe(true);
      });
    });

    describe("with a scalar value", function() {
      it("returns false", function() {
        expect(ValidatorUtil.isCallable("string")).toBe(false);
      });
    });

    describe("with a null value", function() {
      it("returns false", function() {
        expect(ValidatorUtil.isCallable(null)).toBe(false);
      });
    });
  });

  describe("#isDefined", () => {
    it("handles empty strings", () => {
      expect(ValidatorUtil.isDefined("")).toBe(false);
    });

    it("handles undefined values", () => {
      expect(ValidatorUtil.isDefined()).toBe(false);
    });

    it("handles null values", () => {
      expect(ValidatorUtil.isDefined(null)).toBe(false);
    });

    it("verifies that the value is defined", () => {
      expect(ValidatorUtil.isDefined("a")).toBe(true);
      expect(ValidatorUtil.isDefined("#")).toBe(true);
      expect(ValidatorUtil.isDefined(0)).toBe(true);
      expect(ValidatorUtil.isDefined(1)).toBe(true);
      expect(ValidatorUtil.isDefined({})).toBe(true);
      expect(ValidatorUtil.isDefined([])).toBe(true);
    });
  });

  describe("#isEmail", function() {
    // RFC822 email address validator
    // http://sphinx.mythic-beasts.com/~pdw/cgi-bin/emailvalidate?address=

    it("has at least an username, an @ and one period", function() {
      expect(ValidatorUtil.isEmail("user@foo.bar")).toBe(true);
      expect(ValidatorUtil.isEmail("Abc.123@example.com")).toBe(true);
      expect(ValidatorUtil.isEmail("!#$%&'*+-/=?^_`.{|}~@example.com")).toBe(
        true
      );
      expect(ValidatorUtil.isEmail('"Abc@def"@example.com')).toBe(true);
      expect(
        ValidatorUtil.isEmail("user+mailbox/department=shipping@example.com")
      ).toBe(true);
      expect(ValidatorUtil.isEmail('"Joe.\\Blow"@example.com')).toBe(true);
    });

    it("has an @", function() {
      expect(ValidatorUtil.isEmail("foobar")).toBe(false);
      expect(ValidatorUtil.isEmail("userfoo.bar")).toBe(false);
    });

    it("has an username", function() {
      expect(ValidatorUtil.isEmail("@foo.bar")).toBe(false);
      expect(ValidatorUtil.isEmail("user@foo.bar")).toBe(true);
    });

    it("has at least one period after @", function() {
      expect(ValidatorUtil.isEmail("user@foobar")).toBe(false);
      expect(ValidatorUtil.isEmail("Abc.123@examplecom")).toBe(false);
      expect(ValidatorUtil.isEmail("user@foo.bar")).toBe(true);
      expect(ValidatorUtil.isEmail("user@baz.foo.bar")).toBe(true);
    });

    it("treats IDN emails as valid", function() {
      expect(ValidatorUtil.isEmail("伊昭傑@郵件.商務")).toBe(true);
      expect(ValidatorUtil.isEmail("θσερ@εχαμπλε.ψομ")).toBe(true);
      expect(ValidatorUtil.isEmail("test@könig.de")).toBe(true);
      expect(ValidatorUtil.isEmail("伊昭傑郵件.商務")).toBe(false);
      expect(ValidatorUtil.isEmail("θσερ@εχαμπλεψομ")).toBe(false);
      expect(ValidatorUtil.isEmail("@könig.de")).toBe(false);
    });

    it("treats long unknown TLDs as valid", function() {
      expect(ValidatorUtil.isEmail("user@foobar.hamburg")).toBe(true);
      expect(ValidatorUtil.isEmail("user@foobar.københavn")).toBe(true);
      expect(
        ValidatorUtil.isEmail(
          "test@asdf.com.asd.fasd.f.asdf.asd.fa.xn--sdf-x68do18h"
        )
      ).toBe(true);
    });

    it("doesn't have whitespaces", function() {
      expect(ValidatorUtil.isEmail('"Fred Bloggs"@example.com')).toBe(false);
      expect(ValidatorUtil.isEmail("user@f o o.om")).toBe(false);
      expect(ValidatorUtil.isEmail("  user  @foo.com")).toBe(false);
    });
  });

  describe("#isEmpty", () => {
    it("returns false if it receives a number", () => {
      expect(ValidatorUtil.isEmpty(0)).toBe(false);
      expect(ValidatorUtil.isEmpty(-100)).toBe(false);
      expect(ValidatorUtil.isEmpty(20)).toBe(false);
    });

    it("returns false if it receives a boolean", () => {
      expect(ValidatorUtil.isEmpty(false)).toBe(false);
      expect(ValidatorUtil.isEmpty(true)).toBe(false);
    });

    it("returns true if it receives undefined or null", () => {
      expect(ValidatorUtil.isEmpty()).toBe(true);
      expect(ValidatorUtil.isEmpty(undefined)).toBe(true);
      expect(ValidatorUtil.isEmpty(null)).toBe(true);
    });

    it("returns true if it receives an empty array", () => {
      expect(ValidatorUtil.isEmpty([])).toBe(true);
    });

    it("returns false if it receives array with items", () => {
      expect(ValidatorUtil.isEmpty([0])).toBe(false);
      expect(ValidatorUtil.isEmpty([{}])).toBe(false);
    });

    it("returns true if it receives an empty object", () => {
      expect(ValidatorUtil.isEmpty({})).toBe(true);
    });

    it("returns false if it receives an object with keys", () => {
      expect(ValidatorUtil.isEmpty({ foo: "bar", baz: "qux" })).toBe(false);
    });

    it("returns false if it receives a string", () => {
      expect(ValidatorUtil.isEmpty("foo")).toBe(false);
    });
  });

  describe("#isInteger", () => {
    it("handles empty strings", () => {
      expect(ValidatorUtil.isInteger("")).toBe(false);
    });

    it("handles undefined values", () => {
      expect(ValidatorUtil.isInteger()).toBe(false);
    });

    it("handles null values", () => {
      expect(ValidatorUtil.isInteger(null)).toBe(false);
    });

    it("handles wrong value types", () => {
      expect(ValidatorUtil.isInteger("not a number 666")).toBe(false);
    });

    it("handles number like inputs", () => {
      expect(ValidatorUtil.isInteger(2)).toBe(true);
      expect(ValidatorUtil.isInteger("2")).toBe(true);
    });

    it("verifies that the value is in an integer", () => {
      expect(ValidatorUtil.isInteger(0.1)).toBe(false);
      expect(ValidatorUtil.isInteger(2.2)).toBe(false);
      expect(ValidatorUtil.isInteger(-0.3)).toBe(false);
      expect(ValidatorUtil.isInteger(0)).toBe(true);
      expect(ValidatorUtil.isInteger(1)).toBe(true);
      expect(ValidatorUtil.isInteger(2)).toBe(true);
    });
  });

  describe("#isNumber", () => {
    it("handles empty strings", () => {
      expect(ValidatorUtil.isNumber("")).toBe(false);
    });

    it("handles undefined values", () => {
      expect(ValidatorUtil.isNumber()).toBe(false);
    });

    it("handles null values", () => {
      expect(ValidatorUtil.isNumber(null)).toBe(false);
    });

    it("handles wrong value types", () => {
      expect(ValidatorUtil.isNumber("not a number 666")).toBe(false);
      expect(ValidatorUtil.isNumber("2a+1")).toBe(false);
      expect(ValidatorUtil.isNumber("2a1")).toBe(false);
    });

    it("handles number like inputs", () => {
      expect(ValidatorUtil.isNumber("0.0001")).toBe(true);
      expect(ValidatorUtil.isNumber(-0.1)).toBe(true);
      expect(ValidatorUtil.isNumber("-.1")).toBe(true);
      expect(ValidatorUtil.isNumber("2")).toBe(true);
      expect(ValidatorUtil.isNumber("2e+1")).toBe(true);
      expect(ValidatorUtil.isNumber("2e1")).toBe(true);
    });

    it("verifies that the value is in a number", () => {
      expect(ValidatorUtil.isNumber(0.1)).toBe(true);
      expect(ValidatorUtil.isNumber(2.2)).toBe(true);
      expect(ValidatorUtil.isNumber(-0.3)).toBe(true);
      expect(ValidatorUtil.isNumber(0)).toBe(true);
      expect(ValidatorUtil.isNumber(1)).toBe(true);
      expect(ValidatorUtil.isNumber(2)).toBe(true);
      expect(ValidatorUtil.isNumber(2e1)).toBe(true);
      expect(ValidatorUtil.isNumber(2e1)).toBe(true);
    });
  });

  describe("#isNumberInRange", () => {
    it("handles empty strings", () => {
      expect(ValidatorUtil.isNumberInRange("")).toBe(false);
    });

    it("handles  undefined values", () => {
      expect(ValidatorUtil.isNumberInRange()).toBe(false);
    });

    it("handles wrong value types", () => {
      expect(ValidatorUtil.isNumberInRange("not a number 666")).toBe(false);
    });

    it("handles number like inputs", () => {
      expect(ValidatorUtil.isNumberInRange(0.001)).toBe(true);
      expect(ValidatorUtil.isNumberInRange("0.0001")).toBe(true);
      expect(ValidatorUtil.isNumberInRange(-0.1)).toBe(false);
      expect(ValidatorUtil.isNumberInRange("-.1")).toBe(false);
      expect(ValidatorUtil.isNumberInRange(2)).toBe(true);
      expect(ValidatorUtil.isNumberInRange("2")).toBe(true);
    });

    it("verifies that the value is in the default range (0 - infinity)", () => {
      expect(ValidatorUtil.isNumberInRange(-1)).toBe(false);
      expect(ValidatorUtil.isNumberInRange(1)).toBe(true);
    });

    it("verifies that the value is in the range (0 - `max`)", () => {
      const range = { max: 4 };

      expect(ValidatorUtil.isNumberInRange(-1, range)).toBe(false);
      expect(ValidatorUtil.isNumberInRange(5, range)).toBe(false);
      expect(ValidatorUtil.isNumberInRange(4, range)).toBe(true);
    });

    it("verifies that the value is in the range (`min` - infinity)", () => {
      const range = { min: 2 };

      expect(ValidatorUtil.isNumberInRange(0, range)).toBe(false);
      expect(ValidatorUtil.isNumberInRange(1, range)).toBe(false);
      expect(ValidatorUtil.isNumberInRange(2, range)).toBe(true);
    });

    it("verifies that the value is in the range (`min` - `max`)", () => {
      const range = { min: 3, max: 5 };

      expect(ValidatorUtil.isNumberInRange(0, range)).toBe(false);
      expect(ValidatorUtil.isNumberInRange(2, range)).toBe(false);
      expect(ValidatorUtil.isNumberInRange(6, range)).toBe(false);
      expect(ValidatorUtil.isNumberInRange(3, range)).toBe(true);
      expect(ValidatorUtil.isNumberInRange(4, range)).toBe(true);
      expect(ValidatorUtil.isNumberInRange(5, range)).toBe(true);
    });
  });

  describe("#isStringInteger", () => {
    it("handles empty strings", () => {
      expect(ValidatorUtil.isStringInteger("")).toBe(false);
    });

    it("handles undefined values", () => {
      expect(ValidatorUtil.isStringInteger()).toBe(false);
    });

    it("handles null values", () => {
      expect(ValidatorUtil.isStringInteger(null)).toBe(false);
    });

    it("handles wrong value types", () => {
      expect(ValidatorUtil.isStringInteger("not a number 666")).toBe(false);
      expect(ValidatorUtil.isStringInteger("2a+1")).toBe(false);
      expect(ValidatorUtil.isStringInteger("2a1")).toBe(false);
      expect(ValidatorUtil.isStringInteger("0.0001")).toBe(false);
      expect(ValidatorUtil.isStringInteger(-0.1)).toBe(false);
      expect(ValidatorUtil.isStringInteger("-.1")).toBe(false);
      expect(ValidatorUtil.isStringInteger("2e+1")).toBe(false);
      expect(ValidatorUtil.isStringInteger("2e1")).toBe(false);
      expect(ValidatorUtil.isStringInteger("1.23")).toBe(false);
    });

    it("handles integer string inputs", () => {
      expect(ValidatorUtil.isStringInteger("2")).toBe(true);
      expect(ValidatorUtil.isStringInteger("123")).toBe(true);
    });

    it("disregards any value is in a number", () => {
      expect(ValidatorUtil.isStringInteger(0.1)).toBe(false);
      expect(ValidatorUtil.isStringInteger(2.2)).toBe(false);
      expect(ValidatorUtil.isStringInteger(-0.3)).toBe(false);
      expect(ValidatorUtil.isStringInteger(0)).toBe(false);
      expect(ValidatorUtil.isStringInteger(1)).toBe(false);
      expect(ValidatorUtil.isStringInteger(2)).toBe(false);
      expect(ValidatorUtil.isStringInteger(2e1)).toBe(false);
      expect(ValidatorUtil.isStringInteger(2e1)).toBe(false);
    });
  });
});
