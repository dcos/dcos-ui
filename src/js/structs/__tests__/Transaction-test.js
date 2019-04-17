import Transaction from "../Transaction";
import * as TransactionTypes from "../../constants/TransactionTypes";

describe("Transaction", function() {
  describe("#constructor", function() {
    it("has the type SET", function() {
      const transaction = new Transaction(0, 0);
      expect(transaction.type).toEqual(TransactionTypes.SET);
    });

    it("throws an Error for random type", function() {
      expect(() => new Transaction(0, 0, "DEL")).toThrowError(TypeError);
    });

    it("accepts SET constant", function() {
      expect(
        () => new Transaction(0, 0, TransactionTypes.SET)
      ).not.toThrowError();
    });

    it("ensures that type is not be writable", function() {
      const transaction = new Transaction(0, 0);
      expect(() => (transaction.type = "EVIL DELETE")).toThrowError();
    });

    it("has the value which has been set", function() {
      const value = "test";
      const transaction = new Transaction(0, value);
      expect(transaction.value).toEqual(value);
    });

    it("ensures that value is not be writable", function() {
      const transaction = new Transaction(0, 0);
      expect(() => (transaction.value = "EVIL value")).toThrowError();
    });

    it("has the path which has been set", function() {
      const path = "path";
      const transaction = new Transaction(path, 0);
      expect(transaction.path).toEqual(path);
    });

    it("ensures that path is not be writable", function() {
      const transaction = new Transaction(0, 0);
      expect(() => (transaction.path = "EVIL path")).toThrowError();
    });
  });
});
