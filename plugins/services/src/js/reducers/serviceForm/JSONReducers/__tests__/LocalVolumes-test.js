const LocalVolumes = require('../LocalVolumes');
const {ADD_ITEM, SET} =
  require('../../../../../../../../src/js/constants/TransactionTypes');

describe('LocalVolumes', function () {
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
        {type: SET, value: 'PERSISTENT', path: ['localVolumes', 0, 'type']},
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
        {type: SET, value: 'PERSISTENT', path: ['localVolumes', 0, 'type']},
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
        {type: SET, value: 'PERSISTENT', path: ['localVolumes', 0, 'type']},
        {type: SET, value: 1024, path: ['localVolumes', 0, 'size']},
        {type: SET, value: '/dev/null', path: ['localVolumes', 0, 'containerPath']},
        {type: SET, value: 'READ', path: ['localVolumes', 0, 'mode']}
      ]);
    });
  });
});
