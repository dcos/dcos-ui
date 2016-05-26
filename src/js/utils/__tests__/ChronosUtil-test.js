let ChronosUtil = require('../ChronosUtil');

describe('ChronosUtil', function () {

  describe('#addJob', function () {

    beforeEach(function () {
      this.instance = {id: '/', items: []};
    });

    it('should throw error if the provided id doesn\'t start with a slash',
      function () {
        expect(function () {
          ChronosUtil.addJob(this.instance, {id: 'malformed/id'}, {});
        }.bind(this)).toThrow();
      }
    );

    it('should throw error if the provided id ends with a slash',
      function () {
        expect(function () {
          ChronosUtil.addJob(this.instance, {id: '/malformed/id/'}, {});
        }.bind(this)).toThrow();
      }
    );

    it('should not throw error if the provided id is only a slash (root id)',
      function () {
        expect(function () {
          ChronosUtil.addJob(this.instance, {id: '/'}, {});
        }.bind(this)).not.toThrow();
      }
    );

    it('adds a job to the tree', function () {
      ChronosUtil.addJob(this.instance, {id: '/alpha'}, {});

      expect(this.instance.items[0].id).toEqual('/alpha');
    });

    it('adds nested items at the correct location based on id/path matching',
      function () {

        ChronosUtil.addJob(this.instance, {id: '/group/foo/bar'}, {});

        expect(this.instance.items[0].id).toEqual('/group');
        expect(this.instance.items[0].items[0].id)
          .toEqual('/group/foo');
        expect(this.instance.items[0].items[0].items[0].id)
          .toEqual('/group/foo/bar');
      }
    );

    it('should throw error if item is neither an instance of Job nor JobTree',
      function () {
        expect(function () {
          ChronosUtil.addJob({})
        }).toThrow();
        expect(function () {
          ChronosUtil.addJob([])
        }).toThrow();
        expect(function () {
          ChronosUtil.addJob(NaN)
        }).toThrow();
        expect(function () {
          ChronosUtil.addJob()
        }).toThrow();
      }
    );

  });

  describe('#parseJobs', function () {

    beforeEach(function () {
      this.instance = ChronosUtil.parseJobs([{
        id: '/group',
        items: [
          {id: '/group/foo', items: []},
          {id: '/group/bar', items: []},
          {id: '/group/alpha'},
          {id: '/group/beta'},
          {id: '/group/wibble/wobble'}
        ],
      }]);
    });

    it('defaults id to slash (root group id)', function () {
      let tree = ChronosUtil.parseJobs([]);
      expect(tree.id).toEqual('/');
    });

    it('sets correct tree id', function () {
      expect(this.instance.items[0].id).toEqual('/group');
    });

    it('accepts nested trees (groups)', function () {
      expect(this.instance.items[0].items[0].items.length).toEqual(0);
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

  });

});
