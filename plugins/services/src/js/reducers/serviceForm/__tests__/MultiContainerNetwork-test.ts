import Transaction from "#SRC/js/structs/Transaction";
import Batch from "#SRC/js/structs/Batch";
import Networking from "#SRC/js/constants/Networking";

import * as MultiContainerNetwork from "../MultiContainerNetwork";
import { ADD_ITEM } from "#SRC/js/constants/TransactionTypes";

describe("MultiContainerNetwork", () => {
  describe("#JSONReducer", () => {
    it("is host default type", () => {
      const batch = new Batch();

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        { mode: "host" },
      ]);
    });

    it("returns a network with mode host by default", () => {
      let batch = new Batch();

      batch = batch.add(new Transaction(["networks", 0], Networking.type.HOST));

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        { mode: "host" },
      ]);
    });

    it("returns a network with mode container", () => {
      let batch = new Batch();

      batch = batch.add(
        new Transaction(["networks", 0], `${Networking.type.CONTAINER}.foo`)
      );

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        { mode: "container", name: "foo" },
      ]);
    });

    it("resets network to mode host", () => {
      let batch = new Batch();

      batch = batch.add(
        new Transaction(["networks", 0], `${Networking.type.CONTAINER}.foo`)
      );
      batch = batch.add(new Transaction(["networks", 0], Networking.type.HOST));

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        { mode: "host" },
      ]);
    });

    it("creates the right network object", () => {
      let batch = new Batch();

      batch = batch.add(
        new Transaction(
          ["networks", 0],
          { mode: Networking.type.CONTAINER, name: "foo" },
          ADD_ITEM
        )
      );
      batch = batch.add(
        new Transaction(["networks", 0, "mode"], `${Networking.type.CONTAINER}`)
      );
      batch = batch.add(new Transaction(["networks", 0, "name"], "foo"));

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        {
          mode: "container",
          name: "foo",
        },
      ]);
    });
  });
  describe("#FORMReducer", () => {
    it("creates the right network object", () => {
      let batch = new Batch();

      batch = batch.add(
        new Transaction(
          ["networks", 0],
          { mode: Networking.type.CONTAINER, name: "foo" },
          ADD_ITEM
        )
      );
      batch = batch.add(
        new Transaction(["networks", 0, "mode"], `${Networking.type.CONTAINER}`)
      );
      batch = batch.add(new Transaction(["networks", 0, "name"], "foo"));

      expect(batch.reduce(MultiContainerNetwork.FormReducer.bind({}))).toEqual([
        {
          mode: "CONTAINER",
          name: "foo",
        },
      ]);
    });
  });
});
