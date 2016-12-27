const HealthChecks = require('../HealthChecks');
const Batch = require('../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../src/js/structs/Transaction');
const {ADD_ITEM, REMOVE_ITEM} =
  require('../../../../../../../src/js/constants/TransactionTypes');

describe('Labels', function () {
  describe('#JSONReducer', function () {
    it('should return an Array', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {}))
      .toEqual([{
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3
      }]);
    });

    it('should set the protocol', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'COMMAND'));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {}))
      .toEqual([{
        protocol: 'COMMAND',
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3
      }]);
    });

    it('should set the right Command', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'COMMAND'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'command'], 'sleep 1000;'));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {}))
      .toEqual([{
        protocol: 'COMMAND',
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3,
        command: {
          value: 'sleep 1000;'
        }
      }]);
    });

    it('should set the right path', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'HTTP'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'path'], '/test'));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {}))
      .toEqual([{
        protocol: 'HTTP',
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3,
        path: '/test'
      }]);
    });

    it('should have a fully fledged health check object', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'HTTP'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'https'], true));
      batch = batch.add(new Transaction(['healthChecks', 0, 'path'], '/test'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'gracePeriodSeconds'], 1));
      batch = batch.add(new Transaction(['healthChecks', 0, 'intervalSeconds'], 2));
      batch = batch.add(new Transaction(['healthChecks', 0, 'timeoutSeconds'], 3));
      batch = batch.add(
        new Transaction(['healthChecks', 0, 'maxConsecutiveFailures'], 4)
      );

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {}))
      .toEqual([{
        protocol: 'HTTPS',
        path: '/test',
        gracePeriodSeconds: 1,
        intervalSeconds: 2,
        timeoutSeconds: 3,
        maxConsecutiveFailures: 4
      }]);
    });

    it('should remove the right item', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'COMMAND'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'path'], 'sleep 1000;'));
      batch = batch.add(new Transaction(['healthChecks', 1, 'protocol'], 'HTTP'));
      batch = batch.add(new Transaction(['healthChecks', 1, 'path'], '/test'));
      batch = batch.add(new Transaction(['healthChecks'], 0, REMOVE_ITEM));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {}))
      .toEqual([{
        protocol: 'HTTP',
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3,
        path: '/test'
      }]);
    });

  });

  describe('#FormReducer', function () {
    it('should return an Array', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), []))
      .toEqual([{
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3
      }]);
    });

    it('should set the protocol', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'COMMAND'));

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), []))
      .toEqual([{
        protocol: 'COMMAND',
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3
      }]);
    });

    it('should set the right Command', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'COMMAND'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'command'], 'sleep 1000;'));

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), []))
      .toEqual([{
        protocol: 'COMMAND',
        command: 'sleep 1000;',
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3
      }]);
    });

    it('should set the right path', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'HTTP'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'path'], '/test'));

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), []))
      .toEqual([{
        protocol: 'HTTP',
        path: '/test',
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3
      }]);
    });

    it('should have a fully fledged health check object', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'HTTP'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'https'], true));
      batch = batch.add(new Transaction(['healthChecks', 0, 'path'], '/test'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'gracePeriodSeconds'], 1));
      batch = batch.add(new Transaction(['healthChecks', 0, 'intervalSeconds'], 2));
      batch = batch.add(new Transaction(['healthChecks', 0, 'timeoutSeconds'], 3));
      batch = batch.add(
        new Transaction(['healthChecks', 0, 'maxConsecutiveFailures'], 4)
      );

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), []))
      .toEqual([{
        protocol: 'HTTPS',
        path: '/test',
        gracePeriodSeconds: 1,
        intervalSeconds: 2,
        timeoutSeconds: 3,
        maxConsecutiveFailures: 4
      }]);
    });

    it('should keep https after switching protocol back to HTTP', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'HTTP'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'https'], true));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'COMMAND'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'HTTP'));

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), [])).toEqual([{
        protocol: 'HTTPS',
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3
      }]);
    });

    it('should set protocol to http if https was set', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['healthChecks'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'HTTP'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'https'], true));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'COMMAND'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'protocol'], 'HTTP'));
      batch = batch.add(new Transaction(['healthChecks', 0, 'https'], false));

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), [])).toEqual([{
        protocol: 'HTTP',
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3
      }]);
    });

  });
});
