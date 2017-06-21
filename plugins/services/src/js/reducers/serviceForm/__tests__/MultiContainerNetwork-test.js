const MultiContainerNetwork = require("../MultiContainerNetwork");
const Networking = require("../../../../../../../src/js/constants/Networking");
const Batch = require("../../../../../../../src/js/structs/Batch");
const Transaction = require("../../../../../../../src/js/structs/Transaction");

describe("MultiContainerNetwork", function() {
  describe("#JSONReducer", function() {
    it("should be host default type", function() {
      const batch = new Batch();

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        { mode: "host" }
      ]);
    });

    it("should return a network with mode host by default", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["networks", 0], Networking.type.HOST));

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        { mode: "host" }
      ]);
    });

    it("should return a network with mode container", function() {
      let batch = new Batch();

      batch = batch.add(
        new Transaction(["networks", 0], `${Networking.type.CONTAINER}.foo`)
      );

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        { mode: "container", name: "foo" }
      ]);
    });

    it("should reset network to mode host", function() {
      let batch = new Batch();

      batch = batch.add(
        new Transaction(["networks", 0], `${Networking.type.CONTAINER}.foo`)
      );
      batch = batch.add(new Transaction(["networks", 0], Networking.type.HOST));

      expect(batch.reduce(MultiContainerNetwork.JSONReducer.bind({}))).toEqual([
        { mode: "host" }
      ]);
    });
  });
});
