const Batch = require('../Batch');

describe('Batch', function () {
  beforeEach(function () {
    this.batch = new Batch();
  });

  describe('#add', function () {

    it('should not throw an error', function () {
      expect(() => {
        this.batch.add({
          value: 'test'
        });
      }).not.toThrow();
    });

  });

  describe('#reduce', function () {

    it('should iterate correctly over a batch with 1 item', function () {
      this.batch.add({value: 'a'});
      let values = this.batch.reduce(function (values, item) {
        values.push(item.value);

        return values;
      }, []);

      expect(values).toEqual(['a']);
    });

    it('should iterate correctly over a batch with 3 item', function () {
      this.batch.add({value: 'a'});
      this.batch.add({value: 'b'});
      this.batch.add({value: 'c'});
      let values = this.batch.reduce(function (values, item) {
        values.push(item.value);

        return values;
      }, []);

      expect(values).toEqual(['a', 'b', 'c']);
    });

    it('should run reducers at least once', function () {
      let sum = this.batch.reduce(function (sum) {
        return sum + 1;
      }, 0);

      expect(sum).toEqual(1);
    });

  });

});
