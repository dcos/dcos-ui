const Artifacts = require('../Artifacts');
const Batch = require('../../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../../src/js/structs/Transaction');
const {SET, ADD_ITEM} = require('../../../../../../../../src/js/constants/TransactionTypes');

describe('Artifacts', function () {

  describe('#JSONReducer', function () {

    it('emits correct JSON', function () {
      const batch = new Batch([
        new Transaction(['fetch'], 0, ADD_ITEM),
        new Transaction(['fetch', 0, 'uri'], 'http://mesosphere.io', SET),
        new Transaction(['fetch'], 1, ADD_ITEM),
        new Transaction(['fetch', 1, 'uri'], 'http://mesosphere.com', SET)
      ]);

      expect(batch.reduce(Artifacts.JSONReducer.bind({}), {}))
        .toEqual([
          {uri: 'http://mesosphere.io'},
          {uri: 'http://mesosphere.com'}
        ]);
    });

  });
});
