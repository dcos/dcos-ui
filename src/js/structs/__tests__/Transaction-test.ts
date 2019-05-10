import Transaction from "../Transaction";
import * as TransactionTypes from "../../constants/TransactionTypes";

describe("Transaction", () => {
  describe("#constructor", () => {
    it("has the type SET", () => {
      const transaction = new Transaction([0], 0);
      expect(transaction.type).toEqual(TransactionTypes.SET);
    });

    it("throws an Error for random type", () => {
      //@ts-ignore
      expect(() => new Transaction([0], 0, "DEL")).toThrowError(TypeError);
    });

    it("accepts SET constant", () => {
      expect(
        () => new Transaction([0], 0, TransactionTypes.SET)
      ).not.toThrowError();
    });

    it("ensures that type is not be writable", () => {
      const transaction = new Transaction([0], 0);
      //@ts-ignore
      expect(() => (transaction.type = "EVIL DELETE")).toThrowError();
    });

    it("has the value which has been set", () => {
      const value = "test";
      const transaction = new Transaction([0], value);
      expect(transaction.value).toEqual(value);
    });

    it("ensures that value is not be writable", () => {
      const transaction = new Transaction([0], 0);
      //@ts-ignore
      expect(() => (transaction.value = "EVIL value")).toThrowError();
    });

    it("has the path which has been set", () => {
      const path = ["path"];
      const transaction = new Transaction(path, 0);
      expect(transaction.path).toEqual(path);
    });

    it("ensures that path is not be writable", () => {
      const transaction = new Transaction([0], 0);
      //@ts-ignore
      expect(() => (transaction.path = "EVIL path")).toThrowError();
    });
  });
});
