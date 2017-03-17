const Artifacts = require('../Artifacts');
const {SET, ADD_ITEM} = require('../../../../../../../../src/js/constants/TransactionTypes');

describe('Artifacts', function () {

  describe('#JSONParser', function () {

    it('parses JSON correctly', function () {
      expect(Artifacts.JSONParser({
        fetch: [
          {uri: 'http://mesosphere.io'},
          {uri: 'http://mesosphere.com'}
        ]
      })).toEqual([
        {type: ADD_ITEM, path: ['fetch'], value: 0},
        {type: SET, path: ['fetch', 0, 'uri'], value: 'http://mesosphere.io'},
        {type: ADD_ITEM, path: ['fetch'], value: 1},
        {type: SET, path: ['fetch', 1, 'uri'], value: 'http://mesosphere.com'}
      ]);
    });

  });

});
