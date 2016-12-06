const Containers = require('../Containers');
const Batch = require('../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../src/js/structs/Transaction');
const {ADD_ITEM} = require('../../../../../../../src/js/constants/TransactionTypes');

describe('Containers', function () {

  describe('#JSONReducer', function () {

    it('should pass through state as default', function () {
      let batch = new Batch();

      expect(batch.reduce(Containers.JSONReducer.bind({}), {}))
        .toEqual({});
    });

    it('returns an array as default with a container path Transaction', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

      expect(batch.reduce(Containers.JSONReducer.bind({})))
        .toEqual([{}]);
    });

  });
  // FormReducer is the same as JSONReducer
});
