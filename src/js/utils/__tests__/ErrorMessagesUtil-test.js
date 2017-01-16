const ErrorMessagesUtil = require('../ErrorMessagesUtil');

describe('ErrorMessagesUtil', function () {

  describe('#create', function () {

    it('should correctly transpose the data', function () {
      const config = ErrorMessagesUtil.create({
        'foo': {
          CONSTANT_1: 'message1',
          CONSTANT_2: 'message2'
        }
      });

      expect(config).toEqual({
        CONSTANT_1: [
          {regexp: /foo/, message: 'message1'}
        ],
        CONSTANT_2: [
          {regexp: /foo/, message: 'message2'}
        ]
      });
    });

    it('should stack error messages in correct order', function () {
      const config = ErrorMessagesUtil.create({
        'foo': {
          CONSTANT_1: 'message1',
          CONSTANT_2: 'message2'
        },
        'bar': {
          CONSTANT_1: 'message3'
        }
      });

      expect(config).toEqual({
        CONSTANT_1: [
          {regexp: /foo/, message: 'message1'},
          {regexp: /bar/, message: 'message3'}
        ],
        CONSTANT_2: [
          {regexp: /foo/, message: 'message2'}
        ]
      });
    });

  });

  describe('#extend', function () {

    it('should correctly create empty constants on the same path', function () {
      const config = ErrorMessagesUtil.create({
        'foo': {
          CONSTANT_1: 'message1'
        }
      });

      const extended = ErrorMessagesUtil.extend({
        'foo': {
          CONSTANT_2: 'message2'
        }
      }, config);

      expect(extended).toEqual({
        CONSTANT_1: [
          {regexp: /foo/, message: 'message1'}
        ],
        CONSTANT_2: [
          {regexp: /foo/, message: 'message2'}
        ]
      });
    });

    it('should correctly prepend new tests on existing constants', function () {
      const config = ErrorMessagesUtil.create({
        'foo': {
          CONSTANT_1: 'message1'
        }
      });

      const extended = ErrorMessagesUtil.extend({
        'bar': {
          CONSTANT_1: 'message2'
        }
      }, config);

      expect(extended).toEqual({
        CONSTANT_1: [
          {regexp: /bar/, message: 'message2'},
          {regexp: /foo/, message: 'message1'}
        ]
      });
    });

  });

  describe('#errorMessagesFromConfig', function () {

    it('should create a function for every constant', function () {
      const config = ErrorMessagesUtil.create({
        'foo': {
          CONSTANT_1: 'message1',
          CONSTANT_2: 'message2'
        }
      });
      const errorMessages = ErrorMessagesUtil.errorMessagesFromConfig(config);

      expect(Object.keys(errorMessages)).toEqual(['CONSTANT_1', 'CONSTANT_2']);
      expect(Object.keys(errorMessages).map((key) => typeof errorMessages[key]))
        .toEqual(['function', 'function']);
    });

    it('should create functions that correctly match path', function () {
      const config = ErrorMessagesUtil.create({
        'foo\\.bar': {
          CONSTANT_1: 'message1'
        },
        '.*': {
          CONSTANT_1: 'default'
        }
      });
      const errorMessages = ErrorMessagesUtil.errorMessagesFromConfig(config);

      expect(errorMessages.CONSTANT_1({}, ['foo', 'bar'])).toEqual('message1');
      expect(errorMessages.CONSTANT_1({}, ['foo', 'baz'])).toEqual('default');
    });

    it('should correctly handle missing template vars', function () {
      const config = ErrorMessagesUtil.create({
        '.*': {
          CONSTANT_1: 'default{missing}'
        }
      });
      const errorMessages = ErrorMessagesUtil.errorMessagesFromConfig(config);

      expect(errorMessages.CONSTANT_1({}, ['foo', 'bar'])).toEqual('default');
    });

    it('should create functions that correctly use templates vars', function () {
      const config = ErrorMessagesUtil.create({
        'foo\\.bar': {
          CONSTANT_1: 'message1 {foo}'
        },
        '.*': {
          CONSTANT_1: 'default {bar}'
        }
      });
      const errorMessages = ErrorMessagesUtil.errorMessagesFromConfig(config);
      const tpl = {
        'foo': '1',
        'bar': '2'
      };

      expect(errorMessages.CONSTANT_1(tpl, ['foo', 'bar'])).toEqual('message1 1');
      expect(errorMessages.CONSTANT_1(tpl, ['foo', 'baz'])).toEqual('default 2');
    });

    it('should throw error if no path can be matched on a constant', function () {
      const config = ErrorMessagesUtil.create({
        'foo\\.bar': {
          CONSTANT_1: 'message1 {foo}{missing}'
        },
        'no\\.baz': {
          CONSTANT_1: 'default {bar}'
        }
      });
      const errorMessages = ErrorMessagesUtil.errorMessagesFromConfig(config);

      expect(function () {
        errorMessages.CONSTANT_1({}, ['foo', 'baz']);
      }).toThrow();
    });

  });

});
