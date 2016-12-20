const EnvironmentVariables = require('../EnvironmentVariables');
const Batch = require('../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../src/js/structs/Transaction');
const {ADD_ITEM, REMOVE_ITEM, SET} =
  require('../../../../../../../src/js/constants/TransactionTypes');

describe('Environment Variables', function () {
  describe('#JSONReducer', function () {
    it('should return a key value object', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['env'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['env', 0, 'key'], 'key'));
      batch = batch.add(new Transaction(['env', 0, 'value'], 'value'));

      expect(batch.reduce(EnvironmentVariables.JSONReducer.bind({}), {}))
        .toEqual({key: 'value'});
    });
    it('should keep the last value if they have the same key', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['env'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['env', 0, 'key'], 'key'));
      batch = batch.add(new Transaction(['env', 0, 'value'], 'value'));
      batch = batch.add(new Transaction(['env'], 1, ADD_ITEM));
      batch = batch.add(new Transaction(['env', 1, 'key'], 'key'));
      batch = batch.add(new Transaction(['env', 1, 'value'], 'value2'));

      expect(batch.reduce(EnvironmentVariables.JSONReducer.bind({}), {}))
        .toEqual({key: 'value2'});
    });
    it('should keep remove the first item', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['env'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['env', 0, 'key'], 'first'));
      batch = batch.add(new Transaction(['env', 0, 'value'], 'value'));
      batch = batch.add(new Transaction(['env'], 1, ADD_ITEM));
      batch = batch.add(new Transaction(['env', 1, 'key'], 'second'));
      batch = batch.add(new Transaction(['env', 1, 'value'], 'value'));
      batch = batch.add(new Transaction(['env'], 0, REMOVE_ITEM));

      expect(batch.reduce(EnvironmentVariables.JSONReducer.bind({}), {}))
        .toEqual({second: 'value'});
    });

  });
  describe('#FormReducer', function () {
    it('should return a array containing key value objects', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['env'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['env', 0, 'key'], 'key'));
      batch = batch.add(new Transaction(['env', 0, 'value'], 'value'));

      expect(batch.reduce(EnvironmentVariables.FormReducer.bind({}), []))
        .toEqual([{key: 'key', value: 'value'}]);
    });
    it('should multiple items if they have the same key', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['env'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['env', 0, 'key'], 'key'));
      batch = batch.add(new Transaction(['env', 0, 'value'], 'value'));
      batch = batch.add(new Transaction(['env'], 1, ADD_ITEM));
      batch = batch.add(new Transaction(['env', 1, 'key'], 'key'));
      batch = batch.add(new Transaction(['env', 1, 'value'], 'value2'));

      expect(batch.reduce(EnvironmentVariables.FormReducer.bind({}), []))
        .toEqual([
          {key: 'key', value: 'value'},
          {key: 'key', value: 'value2'}
        ]);
    });
    it('should keep remove the first item', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['env'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['env', 0, 'key'], 'first'));
      batch = batch.add(new Transaction(['env', 0, 'value'], 'value'));
      batch = batch.add(new Transaction(['env'], 1, ADD_ITEM));
      batch = batch.add(new Transaction(['env', 1, 'key'], 'second'));
      batch = batch.add(new Transaction(['env', 1, 'value'], 'value'));
      batch = batch.add(new Transaction(['env'], 0, REMOVE_ITEM));

      expect(batch.reduce(EnvironmentVariables.FormReducer.bind({}), []))
        .toEqual([{key: 'second', value: 'value'}]);
    });
  });
  describe('#JSONParser', function () {
    it('should return an empty array', function () {
      expect(EnvironmentVariables.JSONParser({})).toEqual([]);
    });
    it('should return an array of transactions', function () {
      expect(EnvironmentVariables.JSONParser({env: {key: 'value'}})).toEqual([
        {type: ADD_ITEM, value: 0, path: ['env']},
        {type: SET, value: 'key', path: ['env', 0, 'key']},
        {type: SET, value: 'value', path: ['env', 0, 'value']}
      ]);
    });
  });
});
