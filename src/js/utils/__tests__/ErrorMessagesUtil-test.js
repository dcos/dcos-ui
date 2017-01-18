const ErrorMessagesUtil = require('../ErrorMessagesUtil');

describe('ErrorMessagesUtil', function () {

  describe('#errorMessagesFromConfig', function () {

    it('should create a function for every constant', function () {
      const config = [
        {path: /^foo$/, type: 'CONSTANT_1', message: 'message1'},
        {path: /^foo$/, type: 'CONSTANT_2', message: 'message2'}
      ];
      const errorMessages = ErrorMessagesUtil.errorMessagesFromConfig(config);

      expect(Object.keys(errorMessages)).toEqual(['CONSTANT_1', 'CONSTANT_2']);
      expect(Object.keys(errorMessages).map((key) => typeof errorMessages[key]))
        .toEqual(['function', 'function']);
    });

    it('should create functions that correctly match path', function () {
      const config = [
        {path: /^foo\.bar$/, type: 'CONSTANT_1', message: 'message1'},
        {path: /.*/, type: 'CONSTANT_1', message: 'default'}
      ];
      const errorMessages = ErrorMessagesUtil.errorMessagesFromConfig(config);

      expect(errorMessages.CONSTANT_1({}, ['foo', 'bar'])).toEqual('message1');
      expect(errorMessages.CONSTANT_1({}, ['foo', 'baz'])).toEqual('default');
    });

    it('should correctly handle missing template vars', function () {
      const config = [
        {path: /.*/, type: 'CONSTANT_1', message: 'default{missing}'}
      ];
      const errorMessages = ErrorMessagesUtil.errorMessagesFromConfig(config);

      expect(errorMessages.CONSTANT_1({}, ['foo', 'bar'])).toEqual('default');
    });

    it('should create functions that correctly use templates vars', function () {
      const config = [
        {path: /^foo\.bar$/, type: 'CONSTANT_1', message: 'message1 {foo}'},
        {path: /.*/, type: 'CONSTANT_1', message: 'default {bar}'}
      ];
      const errorMessages = ErrorMessagesUtil.errorMessagesFromConfig(config);
      const tpl = {
        'foo': '1',
        'bar': '2'
      };

      expect(errorMessages.CONSTANT_1(tpl, ['foo', 'bar'])).toEqual('message1 1');
      expect(errorMessages.CONSTANT_1(tpl, ['foo', 'baz'])).toEqual('default 2');
    });

    it('should throw error if no path can be matched on a constant', function () {
      const config = [
        {path: /^foo\.bar$/, type: 'CONSTANT_1', message: 'message1 {foo}'},
        {path: /^no\.baz$/, type: 'CONSTANT_1', message: 'default {bar}'}
      ];
      const errorMessages = ErrorMessagesUtil.errorMessagesFromConfig(config);

      expect(function () {
        errorMessages.CONSTANT_1({}, ['foo', 'baz']);
      }).toThrow();
    });

  });

});
