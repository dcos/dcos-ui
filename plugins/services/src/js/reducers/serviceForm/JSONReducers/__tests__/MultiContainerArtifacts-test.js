const MultiContainerArtifacts = require('../MultiContainerArtifacts');
const Batch = require('../../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../../src/js/structs/Transaction');
const {ADD_ITEM, SET} = require(
  '../../../../../../../../src/js/constants/TransactionTypes');

describe('MultiContainerArtifacts', function () {
  describe('#JSONReducer', function () {

    it('emits correct form data', function () {
      const batch = new Batch([
        new Transaction(['containers'], 0, ADD_ITEM),
        new Transaction(['containers', 0, 'artifacts'], 0, ADD_ITEM),
        new Transaction([
          'containers',
          0,
          'artifacts',
          0,
          'uri'
        ], 'http://mesosphere.io', SET),
        new Transaction(['containers', 0, 'artifacts'], 1, ADD_ITEM),
        new Transaction([
          'containers',
          0,
          'artifacts',
          1,
          'uri'
        ], 'http://mesosphere.com', SET),
        new Transaction(['containers', 0, 'artifacts'], 2, ADD_ITEM),
        new Transaction(['containers', 0, 'artifacts'], 3, ADD_ITEM)
      ]);

      expect(batch.reduce(MultiContainerArtifacts.JSONReducer.bind({})))
      .toEqual([[
        {uri: 'http://mesosphere.io'},
        {uri: 'http://mesosphere.com'},
        {uri: null},
        {uri: null}
      ]]);
    });
  });
});
