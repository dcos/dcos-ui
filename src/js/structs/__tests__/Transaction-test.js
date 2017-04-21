const TransactionTypes = require("../../constants/TransactionTypes");

const Transaction = require("../Transaction");

describe("Transaction", function() {
  describe("#constructor", function() {
    it("should have the type SET", function() {
      const transaction = new Transaction(0, 0);
      expect(transaction.type).toEqual(TransactionTypes.SET);
    });

    it("should throw a Error for random type", function() {
      expect(() => new Transaction(0, 0, "DEL")).toThrowError(TypeError);
    });

    it("should accept SET constant", function() {
      expect(
        () => new Transaction(0, 0, TransactionTypes.SET)
      ).not.toThrowError();
    });

    it("type should not be writable", function() {
      const transaction = new Transaction(0, 0);
      expect(() => (transaction.type = "EVIL DELETE")).toThrowError();
    });

    it("Should have the value which has been set", function() {
      const value = "test";
      const transaction = new Transaction(0, value);
      expect(transaction.value).toEqual(value);
    });

    it("value should not be writable", function() {
      const transaction = new Transaction(0, 0);
      expect(() => (transaction.value = "EVIL value")).toThrowError();
    });

    it("Should have the path which has been set", function() {
      const path = "path";
      const transaction = new Transaction(path, 0);
      expect(transaction.path).toEqual(path);
    });

    it("path should not be writable", function() {
      const transaction = new Transaction(0, 0);
      expect(() => (transaction.path = "EVIL path")).toThrowError();
    });
  });
});
