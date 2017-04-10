const RequirePorts = require('../RequirePorts');
const Batch = require('../../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../../src/js/structs/Transaction');
const {SET} =
  require('../../../../../../../../src/js/constants/TransactionTypes');

describe('RequirePorts', function () {
  describe('#JSONReducer', function () {
    it('it should return null as default', function () {
      let batch = new Batch();

      batch = batch.add(new Transaction(['id'], 'foo'));

      expect(batch.reduce(RequirePorts.JSONReducer.bind({}))).toEqual(null);
    });

    it('should return true if there is an endpoint with requested host port', function () {
      let batch = new Batch();

      batch = batch.add(new Transaction(['portDefinitions', 0, 'hostPort'], 80, SET));

      expect(batch.reduce(RequirePorts.JSONReducer.bind({})))
      .toEqual(true);
    });

    it('should return true if there is at least one endpoint with requested host port', function () {
      let batch = new Batch();

      batch = batch.add(new Transaction(['portDefinitions', 0, 'hostPort'], 80, SET));
      batch = batch.add(new Transaction(['portDefinitions', 0, 'hostPort'], 0, SET));
      batch = batch.add(new Transaction(['portDefinitions', 1, 'hostPort'], 8080, SET));

      expect(batch.reduce(RequirePorts.JSONReducer.bind({})))
      .toEqual(true);
    });

    it('should return null if all of the endpoints do not request host port', function () {
      let batch = new Batch();

      batch = batch.add(new Transaction(['portDefinitions', 0, 'hostPort'], 0, SET));
      batch = batch.add(new Transaction(['portDefinitions', 1, 'hostPort'], 0, SET));
      batch = batch.add(new Transaction(['portDefinitions', 2, 'hostPort'], 0, SET));

      expect(batch.reduce(RequirePorts.JSONReducer.bind({})))
      .toEqual(null);
    });

  });
});
