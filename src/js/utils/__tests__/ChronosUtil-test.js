let ChronosUtil = require('../ChronosUtil');

describe('ChronosUtil', function () {

  describe('#addJob', function () {

    it('should throw error if the provided id doesn\'t start with a slash',
      function () {
        expect(function () {
          ChronosUtil.parseJobs({id: 'malformed/id'});
        }.bind(this)).toThrow();
      }
    );

    it('should throw error if the provided id ends with a slash',
      function () {
        expect(function () {
          ChronosUtil.parseJobs({id: '/malformed/id/'});
        }.bind(this)).toThrow();
      }
    );

    it('should not throw error if the provided id is only a slash (root id)',
      function () {
        expect(function () {
          ChronosUtil.parseJobs({id: '/'});
        }.bind(this)).not.toThrow();
      }
    );

    it('adds a job to the tree', function () {
      var instance = ChronosUtil.parseJobs({id: '/alpha'});

      expect(instance.items[0].id).toEqual('/alpha');
    });

    it('adds nested items at the correct location based on id/path matching',
      function () {

        var instance = ChronosUtil.parseJobs({id: '/group/foo/bar'});

        expect(instance.items[0].id).toEqual('/group');
        expect(instance.items[0].items[0].id)
          .toEqual('/group/foo');
        expect(instance.items[0].items[0].items[0].id)
          .toEqual('/group/foo/bar');
      }
    );

    it('should throw error if item is not an object with id', function () {
      expect(function () {
        ChronosUtil.parseJobs({});
      }).toThrow();
      expect(function () {
        ChronosUtil.parseJobs(NaN);
      }).toThrow();
      expect(function () {
        ChronosUtil.parseJobs();
      }).toThrow();
    });

    it('should return root group if empty array is passed', function () {
      var instance = ChronosUtil.parseJobs([]);
      expect(instance.id).toEqual('/');
      expect(instance.items).toEqual(undefined);
    });

  });

  describe('#parseJobs', function () {

    beforeEach(function () {
      this.instance = ChronosUtil.parseJobs([
        {id: '/group'},
        {id: '/group/foo'},
        {id: '/group/bar'},
        {id: '/group/alpha'},
        {id: '/group/beta', cmd: '>beta', description: 'First beta'},
        {id: '/group/beta', label: 'Beta', description: 'Second beta'},
        {id: '/group/wibble/wobble'}
      ]);
    });

    it('nests everything under root', function () {
      expect(this.instance.id).toEqual('/');
    });

    it('consolidates jobs into common parent', function () {
      expect(this.instance.items.length).toEqual(1);
      expect(this.instance.items[0].id).toEqual('/group');
    });

    it('defaults id to slash (root group id)', function () {
      let tree = ChronosUtil.parseJobs([]);
      expect(tree.id).toEqual('/');
    });

    it('sets correct tree id', function () {
      expect(this.instance.items[0].id).toEqual('/group');
    });

    it('accepts nested trees (groups)', function () {
      expect(this.instance.items[0].items[4].items.length).toEqual(1);
    });

    it('doesn\'t add items to jobs with no nested items', function () {
      expect(this.instance.items[0].items[2].items).toEqual(undefined);
    });

    it('converts a single item into a subitem of root', function () {
      let instance = ChronosUtil.parseJobs({id: '/group/job'});

      expect(instance.id).toEqual('/');
      expect(instance.items[0].id).toEqual('/group');
      expect(instance.items[0].items[0].id).toEqual('/group/job');
    });

    it('merges data of items that are defined multiple times', function () {
      let result = this.instance.items[0].items[3];
      expect(result).toEqual({
        id: '/group/beta',
        cmd: '>beta',
        label: 'Beta',
        description: 'Second beta'
      });
    });

  });

});
