const Batch = require('../Batch');

describe('Batch', function () {
  beforeEach(function () {
    this.batch = new Batch();
  });

  describe('#add', function () {

    it('should not throw an error', function () {
      expect(() => {
        this.batch.add({
          action: 'test'
        });
      }).not.toThrow();
    });

  });

  describe('#reduce', function () {

    it('should iterate correctly over a batch with 1 item', function () {
      this.batch.add({action: 'a'});
      let actions = this.batch.reduce(function (actions, item) {
        actions.push(item.action);
        return actions;
      }, []);

      expect(actions).toEqual(['a']);
    });

    it('should iterate correctly over a batch with 3 item', function () {
      this.batch.add({action: 'a'});
      this.batch.add({action: 'b'});
      this.batch.add({action: 'c'});
      let actions = this.batch.reduce(function (actions, item) {
        actions.push(item.action);
        return actions;
      }, []);

      expect(actions).toEqual(['a', 'b', 'c']);
    });

  });

});
