const Volumes = require('../Volumes');
const Batch = require('../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../src/js/structs/Transaction');
const {ADD_ITEM, REMOVE_ITEM, SET} =
  require('../../../../../../../src/js/constants/TransactionTypes');

describe('Volumes', function () {
  describe('#JSONReducer', function () {
    it('should return an empty array if no volumes are set', function () {
      let batch = new Batch();

      expect(batch.reduce(Volumes.JSONReducer, [])).toEqual([]);
    });

    it('should return a local volume', function () {
      let batch = new Batch();

      batch = batch.add(new Transaction(['localVolumes'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['localVolumes', 0, 'type'], 'PERSISTENT', SET));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: null,
          persistent: {
            size: null
          },
          mode: 'RW'
        }
      ]);
    });

    it('should return an external volume', function () {
      let batch = new Batch();

      batch = batch.add(new Transaction(['externalVolumes'], 0, ADD_ITEM));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: null,
          external: {
            name: null,
            provider: 'dvdi',
            options: {
              'dvdi/driver': 'rexray'
            }
          },
          mode: 'RW'

        }
      ]);
    });

    it('should return a local and an external volume', function () {
      let batch = new Batch();

      batch = batch.add(new Transaction(['externalVolumes'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['localVolumes'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['localVolumes', 0, 'type'], 'PERSISTENT', SET));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: null,
          persistent: {
            size: null
          },
          mode: 'RW'
        },
        {
          containerPath: null,
          external: {
            name: null,
            provider: 'dvdi',
            options: {
              'dvdi/driver': 'rexray'
            }
          },
          mode: 'RW'
        }

      ]);
    });

    it('should return a fully filled local volume', function () {
      let batch = new Batch();

      batch = batch.add(new Transaction(['localVolumes'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['localVolumes', 0, 'type'], 'PERSISTENT', SET));
      batch = batch.add(new Transaction(['localVolumes', 0, 'containerPath'], '/dev/null', SET));
      batch = batch.add(new Transaction(['localVolumes', 0, 'size'], 1024, SET));
      batch = batch.add(new Transaction(['localVolumes', 0, 'mode'], 'READ', SET));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: '/dev/null',
          persistent: {
            size: 1024
          },
          mode: 'READ'
        }
      ]);
    });

    it('should return a fully filled external volume', function () {
      let batch = new Batch();

      batch = batch.add(new Transaction(['externalVolumes'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['externalVolumes', 0, 'containerPath'], '/dev/null', SET));
      batch = batch.add(new Transaction(['externalVolumes', 0, 'name'], 'null', SET));
      batch = batch.add(new Transaction(['externalVolumes', 0, 'options'], {someValue: true}, SET));
      batch = batch.add(new Transaction(['externalVolumes', 0, 'provider'], 'provider', SET));
      batch = batch.add(new Transaction(['externalVolumes', 0, 'size'], 1024, SET));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: '/dev/null',
          external: {
            size: 1024,
            name: 'null',
            provider: 'provider',
            options: {
              someValue: true
            }
          },
          mode: 'RW'
        }
      ]);
    });

    it('should remove the right local volume', function () {
      let batch = new Batch();

      batch = batch.add(new Transaction(['localVolumes'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['localVolumes'], 1, ADD_ITEM));
      batch = batch.add(new Transaction(['localVolumes', 0, 'type'], 'PERSISTENT', SET));
      batch = batch.add(new Transaction(['localVolumes', 1, 'type'], 'PERSISTENT', SET));
      batch = batch.add(new Transaction(['localVolumes', 0, 'containerPath'], '/dev/null', SET));
      batch = batch.add(new Transaction(['localVolumes', 0, 'size'], 1024, SET));
      batch = batch.add(new Transaction(['localVolumes', 0, 'mode'], 'READ', SET));
      batch = batch.add(new Transaction(['localVolumes', 1, 'containerPath'], '/dev/one', SET));
      batch = batch.add(new Transaction(['localVolumes', 1, 'size'], 512, SET));
      batch = batch.add(new Transaction(['localVolumes'], 0, REMOVE_ITEM));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: '/dev/one',
          persistent: {
            size: 512
          },
          mode: 'RW'
        }
      ]);
    });

    it('should remove the right external volume', function () {
      let batch = new Batch();

      batch = batch.add(new Transaction(['externalVolumes'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['externalVolumes'], 1, ADD_ITEM));
      batch = batch.add(new Transaction(['externalVolumes', 0, 'containerPath'], '/dev/null', SET));
      batch = batch.add(new Transaction(['externalVolumes', 0, 'name'], 'null', SET));
      batch = batch.add(new Transaction(['externalVolumes', 0, 'options'], {someValue: true}, SET));
      batch = batch.add(new Transaction(['externalVolumes', 0, 'provider'], 'provider', SET));
      batch = batch.add(new Transaction(['externalVolumes', 1, 'containerPath'], '/dev/one', SET));
      batch = batch.add(new Transaction(['externalVolumes', 1, 'name'], 'one', SET));
      batch = batch.add(new Transaction(['externalVolumes'], 0, REMOVE_ITEM));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: '/dev/one',
          external: {
            name: 'one',
            provider: 'dvdi',
            options: {
              'dvdi/driver': 'rexray'
            }
          },
          mode: 'RW'
        }
      ]);

    });

    it('should contain a mixed combinantion of volumes', function () {
      let batch = new Batch();

      // Add the first external Volume
      batch = batch.add(new Transaction(['externalVolumes'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['externalVolumes', 0, 'containerPath'], '/dev/null', SET));
      batch = batch.add(new Transaction(['externalVolumes', 0, 'name'], 'null', SET));
      batch = batch.add(new Transaction(['externalVolumes', 0, 'options'], {someValue: true}, SET));
      batch = batch.add(new Transaction(['externalVolumes', 0, 'provider'], 'provider', SET));
      // Add the first local Volume
      batch = batch.add(new Transaction(['localVolumes'], 0, ADD_ITEM));
      batch = batch.add(new Transaction(['localVolumes', 0, 'type'], 'PERSISTENT', SET));
      batch = batch.add(new Transaction(['localVolumes', 0, 'containerPath'], '/dev/null', SET));
      batch = batch.add(new Transaction(['localVolumes', 0, 'size'], 1024, SET));
      batch = batch.add(new Transaction(['localVolumes', 0, 'mode'], 'READ', SET));
      // Add the second external Volume
      batch = batch.add(new Transaction(['externalVolumes'], 1, ADD_ITEM));
      batch = batch.add(new Transaction(['externalVolumes', 1, 'containerPath'], '/dev/one', SET));
      batch = batch.add(new Transaction(['externalVolumes', 1, 'name'], 'one', SET));
      // Add the second local Volume
      batch = batch.add(new Transaction(['localVolumes'], 1, ADD_ITEM));
      batch = batch.add(new Transaction(['localVolumes', 1, 'type'], 'PERSISTENT', SET));
      batch = batch.add(new Transaction(['localVolumes', 1, 'containerPath'], '/dev/one', SET));
      batch = batch.add(new Transaction(['localVolumes', 1, 'size'], 512, SET));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: '/dev/null',
          persistent: {
            size: 1024
          },
          mode: 'READ'
        },
        {
          containerPath: '/dev/one',
          persistent: {
            size: 512
          },
          mode: 'RW'
        },
        {
          containerPath: '/dev/null',
          external: {
            name: 'null',
            provider: 'provider',
            options: {
              someValue: true
            }
          },
          mode: 'RW'
        },
        {
          containerPath: '/dev/one',
          external: {
            name: 'one',
            provider: 'dvdi',
            options: {
              'dvdi/driver': 'rexray'
            }
          },
          mode: 'RW'
        }
      ]);
    });
  });
});
