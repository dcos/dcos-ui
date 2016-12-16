const Constraints = require('../Constraints');
const Batch = require('../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../src/js/structs/Transaction');
const {SET, ADD_ITEM} = require('../../../../../../../src/js/constants/TransactionTypes');

describe('Constraints', function () {

  describe('#JSONReducer', function () {

    it('emits correct JSON', function () {
      const batch = new Batch([
        new Transaction(['constraints'], 0, ADD_ITEM),
        new Transaction(['constraints', 0, 'field'], 'hostname', SET),
        new Transaction(['constraints', 0, 'operator'], 'JOIN', SET),
        new Transaction(['constraints', 0, 'value'], 'param', SET)
      ]);

      expect(batch.reduce(Constraints.JSONReducer.bind({}), {}))
        .toEqual([['hostname', 'JOIN', 'param']]);
    });

    it('skips optional value', function () {
      const batch = new Batch([
        new Transaction(['constraints'], 0, ADD_ITEM),
        new Transaction(['constraints', 0, 'field'], 'hostname', SET),
        new Transaction(['constraints', 0, 'operator'], 'JOIN', SET)
      ]);

      expect(batch.reduce(Constraints.JSONReducer.bind({}), {}))
        .toEqual([['hostname', 'JOIN']]);
    });

  });
});
