const Batch = require('../../../../../../../src/js/structs/Batch');
const {COMMAND, HTTP, HTTPS, TCP} =
  require('../../../constants/HealtCheckProtocols');
const MultiContainerHealthChecks = require('../MultiContainerHealthChecks');
const Transaction = require('../../../../../../../src/js/structs/Transaction');
const {ADD_ITEM, REMOVE_ITEM, SET} =
  require('../../../../../../../src/js/constants/TransactionTypes');

describe('MultiContainerHealthChecks', function () {
  describe('#JSONSegmentReducer', function () {
    describe('Generic', function () {
      it('Should not alter state when batch is empty', function () {
        const batch = new Batch();

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          )).toEqual({});
      });

      it('Should define health checks on ADD_ITEM', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null, ADD_ITEM));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({});
      });

      it('Should undefine health checks on REMOVE_ITEM', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null, REMOVE_ITEM));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual(null);
      });

      it('Should define `gracePeriodSeconds`', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null));
        batch = batch.add(new Transaction(['gracePeriodSeconds'], 1));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'gracePeriodSeconds': 1
          });
      });

      it('Should define `intervalSeconds`', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null));
        batch = batch.add(new Transaction(['intervalSeconds'], 1));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'intervalSeconds': 1
          });
      });

      it('Should define `maxConsecutiveFailures`', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null));
        batch = batch.add(new Transaction(['maxConsecutiveFailures'], 1));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'maxConsecutiveFailures': 1
          });
      });

      it('Should define `timeoutSeconds`', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null));
        batch = batch.add(new Transaction(['timeoutSeconds'], 1));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'timeoutSeconds': 1
          });
      });

      it('Should define `delaySeconds`', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null));
        batch = batch.add(new Transaction(['delaySeconds'], 1));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'delaySeconds': 1
          });
      });
    });

    describe('COMMAND', function () {
      it('Should populate default string commands', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(['protocol'], COMMAND));
        batch = batch.add(new Transaction(['exec', 'command', 'string'], 'test'));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'exec': {
              'command': {
                'shell': 'test'
              }
            }
          });
      });

      it('Should populate argv when shell=false on commands', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(['protocol'], COMMAND));
        batch = batch.add(new Transaction(['exec', 'command', 'string'], 'test'));
        batch = batch.add(new Transaction(['exec', 'command', 'shell'], false));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'exec': {
              'command': {
                'argv': ['test']
              }
            }
          });
      });

      it('The order of shell=false should not matter on commands', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(['protocol'], COMMAND));
        batch = batch.add(new Transaction(['exec', 'command', 'shell'], false));
        batch = batch.add(new Transaction(['exec', 'command', 'string'], 'test'));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'exec': {
              'command': {
                'argv': ['test']
              }
            }
          });
      });
    });

    describe('HTTP', function () {
      it('Should populate http endpoint', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(['protocol'], HTTP));
        batch = batch.add(new Transaction(['http', 'endpoint'], 'test'));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'http': {
              'endpoint': 'test'
            }
          });
      });

      it('Should populate http path', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(['protocol'], HTTP));
        batch = batch.add(new Transaction(['http', 'path'], 'test'));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'http': {
              'path': 'test'
            }
          });
      });

      it('Should populate http scheme on https', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(['protocol'], HTTP));
        batch = batch.add(new Transaction(['http', 'https'], true));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'http': {
              'scheme': HTTPS
            }
          });
      });
    });

    describe('TCP', function () {
      it('Should populate tcp endpoint', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(['protocol'], TCP));
        batch = batch.add(new Transaction(['tcp', 'endpoint'], 'test'));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'tcp': {
              'endpoint': 'test'
            }
          });
      });
    });

    describe('Protocol Switching', function () {
      it('Should switch from TCP to COMMAND', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(['protocol'], TCP));
        batch = batch.add(new Transaction(['tcp', 'endpoint'], 'test'));
        batch = batch.add(new Transaction(['protocol'], COMMAND));
        batch = batch.add(new Transaction(['exec', 'command', 'string'], 'test'));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'exec': {
              'command': {
                'shell': 'test'
              }
            }
          });
      });

      it('Should switch from HTTP to COMMAND', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(['protocol'], HTTP));
        batch = batch.add(new Transaction(['http', 'endpoint'], 'test'));
        batch = batch.add(new Transaction(['protocol'], COMMAND));
        batch = batch.add(new Transaction(['exec', 'command', 'string'], 'test'));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'exec': {
              'command': {
                'shell': 'test'
              }
            }
          });
      });

      it('Should switch from COMMAND to HTTP', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(['protocol'], COMMAND));
        batch = batch.add(new Transaction(['exec', 'command', 'string'], 'test'));
        batch = batch.add(new Transaction(['protocol'], HTTP));
        batch = batch.add(new Transaction(['http', 'endpoint'], 'test'));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'http': {
              'endpoint': 'test'
            }
          });
      });

      it('Should switch from COMMAND to TCP', function () {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(['protocol'], COMMAND));
        batch = batch.add(new Transaction(['exec', 'command', 'string'], 'test'));
        batch = batch.add(new Transaction(['protocol'], TCP));
        batch = batch.add(new Transaction(['tcp', 'endpoint'], 'test'));

        const state = {};
        expect(batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}), state
          ))
          .toEqual({
            'tcp': {
              'endpoint': 'test'
            }
          });
      });
    });
  });

  describe('#FormReducer', function () {
    it('Should include `protocol` field', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction([], {}));
      batch = batch.add(new Transaction(['protocol'], COMMAND));

      const state = {};
      expect(batch.reduce(
          MultiContainerHealthChecks.FormReducer.bind({}), state
        ))
        .toEqual({
          'protocol': COMMAND,
          'exec': {
            'command': {}
          }
        });
    });

    it('Should include `exec.command.shell` field', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction([], {}));
      batch = batch.add(new Transaction(['protocol'], COMMAND));
      batch = batch.add(new Transaction(['exec', 'command', 'shell'], false));

      const state = {};
      expect(batch.reduce(
          MultiContainerHealthChecks.FormReducer.bind({}), state
        ))
        .toEqual({
          'protocol': COMMAND,
          'exec': {
            'command': {
              'argv': [],
              'shell': false
            }
          }
        });
    });

    it('Should include `exec.command.string` field', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction([], {}));
      batch = batch.add(new Transaction(['protocol'], COMMAND));
      batch = batch.add(new Transaction(['exec', 'command', 'string'], 'test'));

      const state = {};
      expect(batch.reduce(
          MultiContainerHealthChecks.FormReducer.bind({}), state
        ))
        .toEqual({
          'protocol': COMMAND,
          'exec': {
            'command': {
              'shell': 'test',
              'string': 'test'
            }
          }
        });
    });

    it('Should include `http.https` field', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction([], {}));
      batch = batch.add(new Transaction(['protocol'], HTTP));
      batch = batch.add(new Transaction(['http', 'https'], true));

      const state = {};
      expect(batch.reduce(
          MultiContainerHealthChecks.FormReducer.bind({}), state
        ))
        .toEqual({
          'protocol': HTTP,
          'http': {
            'scheme': HTTPS,
            'https': true
          }
        });
    });
  });

  describe('#JSONSegmentParser', function () {
    it('Should correctly populate `http` transactions', function () {
      const healthCheck = {
        'http': {
          'endpoint': 'foo',
          'path': '/bar',
          'scheme': 'HTTPS'
        }
      };
      const transactions = [
        {type: ADD_ITEM, value: null, path: []},
        {type: SET, value: HTTP, path: ['protocol']},
        {type: SET, value: 'foo', path: ['http', 'endpoint']},
        {type: SET, value: '/bar', path: ['http', 'path']},
        {type: SET, value: true, path: ['http', 'https']}
      ];

      expect(MultiContainerHealthChecks.JSONSegmentParser(healthCheck, []))
        .toEqual(transactions);
    });

    it('Should correctly populate `tcp` transactions', function () {
      const healthCheck = {
        'tcp': {
          'endpoint': 'foo'
        }
      };
      const transactions = [
        {type: ADD_ITEM, value: null, path: []},
        {type: SET, value: TCP, path: ['protocol']},
        {type: SET, value: 'foo', path: ['tcp', 'endpoint']}
      ];

      expect(MultiContainerHealthChecks.JSONSegmentParser(healthCheck, []))
        .toEqual(transactions);
    });

    it('Should correctly populate `exec` (shell) transactions', function () {
      const healthCheck = {
        'exec': {
          'command': {
            'shell': 'test'
          }
        }
      };
      const transactions = [
        {type: ADD_ITEM, value: null, path: []},
        {type: SET, value: COMMAND, path: ['protocol']},
        {type: SET, value: true, path: ['exec', 'command', 'shell']},
        {type: SET, value: 'test', path: ['exec', 'command', 'string']}
      ];

      expect(MultiContainerHealthChecks.JSONSegmentParser(healthCheck, []))
        .toEqual(transactions);
    });

    it('Should correctly populate `exec` (argv) transactions', function () {
      const healthCheck = {
        'exec': {
          'command': {
            'argv': ['test']
          }
        }
      };
      const transactions = [
        {type: ADD_ITEM, value: null, path: []},
        {type: SET, value: COMMAND, path: ['protocol']},
        {type: SET, value: false, path: ['exec', 'command', 'shell']},
        {type: SET, value: 'test', path: ['exec', 'command', 'string']}
      ];

      expect(MultiContainerHealthChecks.JSONSegmentParser(healthCheck, []))
        .toEqual(transactions);
    });
  });
});
