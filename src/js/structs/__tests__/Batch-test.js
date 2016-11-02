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

    it('should pass sane arguments for reducing on empty batch', function () {
      let args = this.batch.reduce(function (sum, action, index) {
        return [sum, action, index];
      }, 'initial');

      expect(args).toEqual(['initial', {value: 'INIT'}, 0]);
    });

    it('should not run reducers more than number than values', function () {
      this.batch.add({value: 'a'});
      this.batch.add({value: 'b'});
      this.batch.add({value: 'c'});
      let sum = this.batch.reduce(function (sum) {
        return sum + 1;
      }, 0);

      expect(sum).toEqual(3);
    });

    it('only adds one per consecutive values with same path', function () {
      this.batch.add({value: 'a', path: ['foo', 'bar']});
      this.batch.add({value: 'b', path: ['foo', 'foo']});
      this.batch.add({value: 'c', path: ['foo', 'foo']});
      this.batch.add({value: 'd', path: ['foo']});
      this.batch.add({value: 'e', path: ['foo', 'bar']});
      let sum = this.batch.reduce(function (sum) {
        return sum + 1;
      }, 0);

      expect(sum).toEqual(4);
    });

    it('doesn\'t add action if last action with same path had same value', function () {
      this.batch.add({value: 'a', path: ['foo', 'bar']});
      this.batch.add({value: 'b', path: ['foo', 'foo']});
      this.batch.add({value: 'a', path: ['foo', 'bar']});
      this.batch.add({value: 'a', path: ['foo', 'bar']});
      let sum = this.batch.reduce(function (sum) {
        return sum + 1;
      }, 0);

      expect(sum).toEqual(2);
    });

  });

});
