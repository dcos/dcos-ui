const Batch = require('../Batch');

describe('Batch', function () {
  beforeEach(function() {
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

    it('should return a Batch', function () {
      let newBatch = this.batch.add({action: 'a'});
      expect(newBatch instanceof Batch).toBeTruthy();
    });

  });

  describe('#reduce', function () {

    it('should iterate correctly over a batch with 1 item', function () {
      let newBatch = this.batch.add({action: 'a'});
      let actions = newBatch.reduce(function(actions, item) {
        actions.push(item.action);
        return actions;
      }, []);

      expect(actions).toEqual(['a']);
    });

    it('should iterate correctly over a batch with 3 item', function () {
      let newBatch = this.batch
          .add({action: 'a'})
          .add({action: 'b'})
          .add({action: 'c'});
      let actions = newBatch.reduce(function(actions, item) {
        actions.push(item.action);
        return actions;
      }, []);

      expect(actions).toEqual(['a', 'b', 'c']);
    });

  });

});
