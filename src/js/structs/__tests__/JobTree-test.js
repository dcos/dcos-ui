let Job = require('../Job');
let JobTree = require('../JobTree');

describe('JobTree', function () {

  describe('#constructor', function () {

    beforeEach(function () {
      this.instance = new JobTree({
        id: '/group',
        items: [
          new JobTree({id: '/group/foo', items: []}),
          {id: '/group/bar', items: []},
          {id: '/group/alpha'},
          new Job({id: '/group/beta'}),
          {id: '/group/wibble/wobble'}
        ],
      });
    });

    it('defaults id to slash (root group id)', function () {
      let tree = new JobTree({items: []});
      expect(tree.getId()).toEqual('/');
    });

    it('sets correct tree id', function () {
      expect(this.instance.getId()).toEqual('/group');
    });

    it('should throw error if the provided id doesn\'t start with a slash',
      function () {
        expect(function () {
          new JobTree({id: 'malformed/id'});
        }).toThrow();
      }
    );

    it('should throw error if the provided id ends with a slash',
      function () {
        expect(function () {
          new JobTree({id: '/malformed/id/'});
        }).toThrow();
      }
    );

    it('should not throw error if the provided id is only a slash (root id)',
      function () {
        expect(function () {
          new JobTree({id: '/'});
        }).not.toThrow();
      }
    );

    it('accepts nested trees (groups)', function () {
      expect(this.instance.getItems()[0] instanceof JobTree).toEqual(true);
    });

    it('converts tree like items into instances of JobTree', function () {
      expect(this.instance.getItems()[1] instanceof JobTree).toEqual(true);
    });

    it('converts items into instances of Job', function () {
      expect(this.instance.getItems()[2] instanceof Job).toEqual(true);
    });

  });

  describe('#add', function () {

    beforeEach(function () {
      this.instance = new JobTree();
    });

    it('adds a job to the tree', function () {
      this.instance.add(new Job({id: '/alpha'}));

      expect(this.instance.getItems()[0].getId()).toEqual('/alpha');
    });

    it('adds nested items at the correct location based on id/path matching',
      function () {
        this.instance.add(new Job({id: '/group/foo/bar'}));

        expect(this.instance.getItems()[0].getId()).toEqual('/group');
        expect(this.instance.getItems()[0].getItems()[0].getId())
          .toEqual('/group/foo');
        expect(this.instance.getItems()[0].getItems()[0].getItems()[0].getId())
          .toEqual('/group/foo/bar');
      }
    );

    it('should throw error if item is neither an instance of Job nor JobTree',
      function () {
        expect(function () {
          this.instance.add({})
        }).toThrow();
        expect(function () {
          this.instance.add([])
        }).toThrow();
        expect(function () {
          this.instance.add(NaN)
        }).toThrow();
        expect(function () {
          this.instance.add()
        }).toThrow();
      }
    );

  });

  describe('#findItemById', function () {

    beforeEach(function () {
      this.instance = new JobTree({
        id: '/',
        items: [
          {id: '/foo', items: []},
          {id: '/alpha'},
          {id: '/wibble/wobble'}
        ],
      });
    });

    it('should find matching item', function () {
      expect(this.instance.findItemById('/alpha').getId()).toEqual('/alpha');
    });

    it('should find matching subtree item', function () {
      expect(this.instance.findItemById('/wibble/wobble').getId())
        .toEqual('/wibble/wobble');
    });

    it('should find matching subtree', function () {
      expect(this.instance.findItemById('/foo').getId()).toEqual('/foo');
    });

  });

});
