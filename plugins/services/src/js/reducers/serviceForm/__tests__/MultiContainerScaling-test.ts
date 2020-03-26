import Transaction from "#SRC/js/structs/Transaction";
import Batch from "#SRC/js/structs/Batch";

import * as MultiContainerScaling from "../MultiContainerScaling";
import { SET } from "#SRC/js/constants/TransactionTypes";

describe("MultiContainerScaling", () => {
  describe("#JSONReducer", () => {
    it("does not return anything with an empty batch", () => {
      const batch = new Batch();

      expect(batch.reduce(MultiContainerScaling.JSONReducer.bind({}))).toEqual(
        null
      );
    });

    it("returns a fixed scaling block when instances defined", () => {
      let batch = new Batch();

      batch = batch.add(new Transaction(["instances"], 1));

      expect(
        batch.reduce(MultiContainerScaling.JSONReducer.bind({}), {})
      ).toEqual({
        kind: "fixed",
        instances: 1,
      });
    });

    it("returns different scaling kinds if defined", () => {
      let batch = new Batch();

      batch = batch.add(new Transaction(["scaling.kind"], "wrong"));

      // NOTE: This is mainly future-proofing and not a feature
      expect(
        batch.reduce(MultiContainerScaling.JSONReducer.bind({}), {})
      ).toEqual({
        kind: "wrong",
        instances: 1,
      });
    });

    it("returns scaling block when instances == 0", () => {
      let batch = new Batch();

      batch = batch.add(new Transaction(["instances"], 0));

      expect(
        batch.reduce(MultiContainerScaling.JSONReducer.bind({}), {})
      ).toEqual({
        kind: "fixed",
        instances: 0,
      });
    });
  });

  describe("#JSONParser", () => {
    it("does not populate transactions on empty config", () => {
      const expectedObject = [];

      expect(MultiContainerScaling.JSONParser({})).toEqual(expectedObject);
    });

    it("supports instances = 0", () => {
      const expectedObject = [{ type: SET, value: 0, path: ["instances"] }];

      expect(
        MultiContainerScaling.JSONParser({ scaling: { instances: 0 } })
      ).toEqual(expectedObject);
    });

    it("populates instances and scaling.kind", () => {
      const expectedObject = [
        { type: SET, value: 2, path: ["instances"] },
        { type: SET, value: "random", path: ["scaling", "kind"] },
      ];

      expect(
        MultiContainerScaling.JSONParser({
          scaling: {
            instances: 2,
            kind: "random",
          },
        })
      ).toEqual(expectedObject);
    });
  });
});
