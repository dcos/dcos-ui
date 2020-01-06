import Transaction from "#SRC/js/structs/Transaction";
import Batch from "#SRC/js/structs/Batch";

import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import * as Residency from "../Residency";

describe("Residency", () => {
  describe("#JSONReducer", () => {
    it("returns undefined as default", () => {
      let batch = new Batch();

      batch = batch.add(new Transaction(["id"], "foo"));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toEqual(undefined);
    });

    it("returns residency if residency ist set", () => {
      let batch = new Batch();

      batch = batch.add(new Transaction(["residency"], { foo: "bar" }));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toEqual({
        foo: "bar"
      });
    });

    it("returns undefined residency if a persistent volume is set", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumes", 0, "type"], "PERSISTENT"));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toBeUndefined();
    });

    it("returns undefined if a persistent volume is removed", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumes", 0, "type"], "PERSISTENT"));
      batch = batch.add(new Transaction(["volumes"], 0, REMOVE_ITEM));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toBeUndefined();
    });

    it("respects the parsed residency", () => {
      let batch = new Batch();

      batch = batch.add(new Transaction(["residency"], { foo: "bar" }));
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumes", 0, "type"], "PERSISTENT"));

      expect(batch.reduce(Residency.JSONReducer.bind({}))).toEqual({
        foo: "bar"
      });
    });
  });

  describe("#JSONParser", () => {
    it("returns empty array if residency is not present", () => {
      expect(Residency.JSONParser({ id: "test" })).toEqual([]);
    });
    it("returns a transaction if residency is present", () => {
      expect(Residency.JSONParser({ residency: { foo: "bar" } })).toEqual({
        type: SET,
        path: ["residency"],
        value: { foo: "bar" }
      });
    });
  });
});
