const LocalVolumes = require('../LocalVolumes');
const Batch = require('../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../src/js/structs/Transaction');
const {ADD_ITEM, REMOVE_ITEM, SET} =
  require('../../../../../../../src/js/constants/TransactionTypes');

describe('Labels', function () {
  describe('#FormReducer', function () {
    it('should return an Array with one item', function () {
      let batch = new Batch()
        .add(new Transaction(['localVolumes'], 0, ADD_ITEM));
      expect(batch.reduce(LocalVolumes.FormReducer, [])).toEqual([{size: null, containerPath: null, mode: 'RW'}]);
    });

    it('should contain one full local Volumes item', function () {
      let batch = new Batch()
        .add(new Transaction(['localVolumes'], 0, ADD_ITEM))
        .add(new Transaction(['localVolumes', 0, 'size'], 1024))
        .add(new Transaction(['localVolumes', 0, 'containerPath'], '/dev/null'));
      expect(batch.reduce(LocalVolumes.FormReducer, [])).toEqual([{size: 1024, containerPath: '/dev/null', mode: 'RW'}]);
    });

    it('should contain two full local Volumes items', function () {
      let batch = new Batch()
        .add(new Transaction(['localVolumes'], 0, ADD_ITEM))
        .add(new Transaction(['localVolumes'], 1, ADD_ITEM))
        .add(new Transaction(['localVolumes', 0, 'size'], 1024))
        .add(new Transaction(['localVolumes', 0, 'containerPath'], '/dev/null'))
        .add(new Transaction(['localVolumes', 1, 'size'], 512))
        .add(new Transaction(['localVolumes', 1, 'containerPath'], '/dev/dev2'));
      expect(batch.reduce(LocalVolumes.FormReducer, [])).toEqual([
        {size: 1024, containerPath: '/dev/null', mode: 'RW'},
        {size: 512, containerPath: '/dev/dev2', mode: 'RW'}
      ]);
    });

    it('should remove the right row.', function () {
      let batch = new Batch()
        .add(new Transaction(['localVolumes'], 0, ADD_ITEM))
        .add(new Transaction(['localVolumes'], 1, ADD_ITEM))
        .add(new Transaction(['localVolumes', 0, 'size'], 1024))
        .add(new Transaction(['localVolumes', 0, 'containerPath'], '/dev/null'))
        .add(new Transaction(['localVolumes', 1, 'size'], 512))
        .add(new Transaction(['localVolumes', 1, 'containerPath'], '/dev/dev2'))
        .add(new Transaction(['localVolumes'], 0, REMOVE_ITEM));

      expect(batch.reduce(LocalVolumes.FormReducer, [])).toEqual([
        {size: 512, containerPath: '/dev/dev2', mode: 'RW'}
      ]);
    });

    it('should set the right mode.', function () {
      let batch = new Batch()
        .add(new Transaction(['localVolumes'], 0, ADD_ITEM))
        .add(new Transaction(['localVolumes', 0, 'size'], 1024))
        .add(new Transaction(['localVolumes', 0, 'containerPath'], '/dev/null'))
        .add(new Transaction(['localVolumes', 0, 'mode'], 'READ'));

      expect(batch.reduce(LocalVolumes.FormReducer, [])).toEqual([
        {size: 1024, containerPath: '/dev/null', mode: 'READ'}
      ]);
    });
  });

  describe('#JSONParser', function () {
    it('should return an empty array', function () {
      expect(LocalVolumes.JSONParser({})).toEqual([]);
    });

    it('should return an empty array if only external volumes are present',
      function () {
        const state = {
          container: {
            volumes: [
              {
                containerPath: '/mnt/volume',
                external: {
                  name: 'someVolume',
                  provider: 'dvdi',
                  options: {
                    'dvdi/driver': 'rexray'
                  }
                },
                mode: 'RW'
              }
            ]
          }
        };
        expect(LocalVolumes.JSONParser(state)).toEqual([]);
      });

    it('should contain the transaction for one local volume', function () {
      const state = {
        container: {
          volumes: [
            {
              containerPath: '/dev/null',
              persistent: {size: 1024},
              mode: 'RW'
            }
          ]
        }
      };
      expect(LocalVolumes.JSONParser(state)).toEqual([
        {type: ADD_ITEM, value: 0, path: ['localVolumes']},
        {type: SET, value: 1024, path: ['localVolumes', 0, 'size']},
        {type: SET, value: '/dev/null', path: ['localVolumes', 0, 'containerPath']},
        {type: SET, value: 'RW', path: ['localVolumes', 0, 'mode']}
      ]);
    });

    it('should exclude the external volumes', function () {
      const state = {
        container: {
          volumes: [
            {
              containerPath: '/mnt/volume',
              external: {
                name: 'someVolume',
                provider: 'dvdi',
                options: {
                  'dvdi/driver': 'rexray'
                }
              },
              mode: 'RW'
            },
            {
              containerPath: '/dev/null',
              persistent: {size: 1024},
              mode: 'RW'
            }
          ]
        }
      };
      expect(LocalVolumes.JSONParser(state)).toEqual([
        {type: ADD_ITEM, value: 0, path: ['localVolumes']},
        {type: SET, value: 1024, path: ['localVolumes', 0, 'size']},
        {type: SET, value: '/dev/null', path: ['localVolumes', 0, 'containerPath']},
        {type: SET, value: 'RW', path: ['localVolumes', 0, 'mode']}
      ]);
    });

    it('should include a unknown value for modes', function () {
      const state = {
        container: {
          volumes: [
            {
              containerPath: '/dev/null',
              persistent: {size: 1024},
              mode: 'READ'
            }
          ]
        }
      };
      expect(LocalVolumes.JSONParser(state)).toEqual([
        {type: ADD_ITEM, value: 0, path: ['localVolumes']},
        {type: SET, value: 1024, path: ['localVolumes', 0, 'size']},
        {type: SET, value: '/dev/null', path: ['localVolumes', 0, 'containerPath']},
        {type: SET, value: 'READ', path: ['localVolumes', 0, 'mode']}
      ]);
    });
  });
});
