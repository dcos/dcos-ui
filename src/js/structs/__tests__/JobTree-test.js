let Job = require('../Job');
let JobTree = require('../JobTree');

describe('JobTree', function () {

  describe('#constructor', function () {

    beforeEach(function () {
      this.instance = new JobTree({
        id: 'group',
        items: [
          {id: 'group.foo', items: []},
          {id: 'group.bar', items: []},
          {id: 'group.alpha'},
          {id: 'group.beta'}
        ]
      });
    });

    it('defaults id to slash (root group id)', function () {
      let tree = new JobTree({items: []});
      expect(tree.getId()).toEqual('');
    });

    it('sets correct tree id', function () {
      expect(this.instance.getId()).toEqual('group');
    });

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
  describe('#findItemById', function () {

    beforeEach(function () {
      this.instance = new JobTree({
        id: '',
        items: [
          {id: 'foo', items: []},
          {id: 'alpha'}
        ],
      });
    });

    it('should find matching item', function () {
      expect(this.instance.findItemById('alpha').getId()).toEqual('alpha');
    });

    it('should find matching subtree', function () {
      expect(this.instance.findItemById('foo').getId()).toEqual('foo');
    });

  });

});
