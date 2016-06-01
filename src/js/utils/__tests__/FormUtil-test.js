jest.dontMock('../FormUtil');

var FormUtil = require('../FormUtil');

describe('FormUtil', function () {
  describe('#getMultipleFields', function () {
    describe('one property', function () {
      beforeEach(function () {
        this.result = FormUtil.getMultipleFields('uid', 2, {
          name: 'uid'
        });
      });

      it('returns the correct amount of fields', function () {
        expect(this.result.length).toEqual(2);
      });

      it('returns the correct names for fields', function () {
        expect(this.result[0].name).toEqual('uid[0]');
        expect(this.result[1].name).toEqual('uid[1]');
      });
    });

    describe('multiple properties', function () {
      beforeEach(function () {
        this.result = FormUtil.getMultipleFields('uid', 2, [
          {
            name: 'uid'
          },
          {
            name: 'password'
          }
        ]);
      });

      it('returns the correct amount of fields', function () {
        expect(this.result.length).toEqual(2);
      });

      it('returns the correct names for fields', function () {
        expect(this.result[0][0].name).toEqual('uid[0].uid');
        expect(this.result[0][1].name).toEqual('uid[0].password');
        expect(this.result[1][0].name).toEqual('uid[1].uid');
        expect(this.result[1][1].name).toEqual('uid[1].password');
      });
    });
  });

  describe('#modelToCombinedProps', function () {
    beforeEach(function () {
      this.result = FormUtil.modelToCombinedProps('uid', {
        'uid[0].uid': 'kenny',
        'uid[0].password': 'secret',
        'uid[1].uid': 'jane',
        'uid[1].password': 'secret2',
        unrelatedProp: 'hellothere'
      });
    });

    it('should not modify the unrelated properties', function () {
      expect(this.result.unrelatedProp).toEqual('hellothere');
    });

    it('should create a property named "uid" that is an array', function () {
      expect(Array.isArray(this.result.uid)).toEqual(true);
    });

    it('should convert each instance into an object', function () {
      expect(typeof this.result.uid[0]).toEqual('object');
    });

    it('should convert each instance with the correct values', function () {
      expect(this.result.uid[0].uid).toEqual('kenny');
      expect(this.result.uid[0].password).toEqual('secret');
      expect(this.result.uid[1].uid).toEqual('jane');
      expect(this.result.uid[1].password).toEqual('secret2');
    });
  });
});
