const PortDefinitions = require('../PortDefinitions');
const Batch = require('../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../src/js/structs/Transaction');
const {ADD_ITEM} = require('../../../../../../../src/js/constants/TransactionTypes');

describe('PortDefinitions', function () {
  describe('#JSONReducer', function () {
    it('should create default portDefinition configurations', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {}))
        .toEqual([{name: null, port: 0, protocol: 'tcp'}]);
    });

    it('should create two default portDefinition configurations', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {}))
        .toEqual([
          {name: null, port: 0, protocol: 'tcp'},
          {name: null, port: 0, protocol: 'tcp'}
        ]);
    });

    it('should set the name value', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['portDefinitions', 0, 'name'], 'foo'));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {}))
        .toEqual([
          {name: 'foo', port: 0, protocol: 'tcp'}
        ]);
    });

    it('should set the port value', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['portDefinitions', 0, 'hostPort'], 100));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {}))
        .toEqual([
          {name: null, port: 100, protocol: 'tcp'}
        ]);
    });

    it('should set the protocol value', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['portDefinitions', 0, 'protocol'], 'udp'));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {}))
        .toEqual([
          {name: null, port: 0, protocol: 'udp'}
        ]);
    });

    it('should add the labels key if the portDefinition is load balanced', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['portDefinitions', 1, 'loadBalanced'], true));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {}))
        .toEqual([
          {name: null, port: 0, protocol: 'tcp'},
          {name: null, port: 0, protocol: 'tcp', labels: {'VIP_1': ':0'}}
        ]);
    });

    it('should add the index of the portDefinition to the VIP keys', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['portDefinitions', 0, 'loadBalanced'], true));
      batch = batch.add(new Transaction(['portDefinitions', 1, 'loadBalanced'], true));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {}))
        .toEqual([
          {name: null, port: 0, protocol: 'tcp', labels: {VIP_0: ':0'}},
          {name: null, port: 0, protocol: 'tcp', labels: {VIP_1: ':0'}}
        ]);
    });

    it('should add the port to the VIP string', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['portDefinitions', 0, 'hostPort'], 300));
      batch = batch.add(new Transaction(['portDefinitions', 0, 'loadBalanced'], true));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {}))
        .toEqual([
          {name: null, port: 300, protocol: 'tcp', labels: {VIP_0: ':300'}},
          {name: null, port: 0, protocol: 'tcp'}
        ]);
    });

    it('should add the app ID to the VIP string when it is defined', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['portDefinitions', 1, 'loadBalanced'], true));
      batch = batch.add(new Transaction(['id'], 'foo'));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {}))
        .toEqual([
          {name: null, port: 0, protocol: 'tcp'},
          {name: null, port: 0, protocol: 'tcp', labels: {'VIP_1': 'foo:0'}}
        ]);
    });
  });
  describe('#JSONParser', function () {
    it('should return an empty array', function () {
      expect(PortDefinitions.JSONParser({})).toEqual([]);
    });
  });
});
