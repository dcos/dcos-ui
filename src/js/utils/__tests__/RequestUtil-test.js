jest.dontMock('../../config/Config');
jest.dontMock('../../utils/RequestUtil');

var Config = require('../../config/Config');
var RequestUtil = require('../../utils/RequestUtil');

describe('RequestUtil', function () {
  describe('#debounceOnError', function () {
    var successFn;
    var errorFn;

    beforeEach(function () {
      successFn = jest.genMockFunction();
      errorFn = jest.genMockFunction();

      spyOn(RequestUtil, 'json').andCallFake(
        function (options) {
          // Trigger error for url 'failRequest'
          if (/failRequest/.test(options.url)) {
            options.error();
          }

          // Trigger success for url 'successRequest'
          if (/successRequest/.test(options.url)) {
            options.success();
          }

          return {};
        }
      );

      this.request = RequestUtil.debounceOnError(
        10,
        function (resolve, reject) {
          return function (url) {
            return RequestUtil.json({
              url: url,
              success: function () {
                successFn();
                resolve();
              },
              error: function () {
                errorFn();
                reject();
              }
            });
          };
        },
        {delayAfterCount: Config.delayAfterErrorCount}
      );

    });

    it('should not debounce on the first 5 errors', function () {
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      expect(errorFn.mock.calls.length).toEqual(5);
    });

    it('should debounce on more than 5 errors', function () {
      // These will all be called
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      // These will all be debounced
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      expect(errorFn.mock.calls.length).toEqual(5);
    });

    it('should reset debouncing after success call', function () {
      // These will all be called
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('successRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      this.request('failRequest');
      // This will be debounced
      this.request('failRequest');
      this.request('failRequest');
      expect(errorFn.mock.calls.length).toEqual(8);
      expect(successFn.mock.calls.length).toEqual(1);
    });

    it('should return the result of the function', function () {
      let result = this.request('successRequest');

      expect(typeof result).toEqual('object');
    });

  });

  describe('#parseResponseBody', function () {
    it('should parse the object with responseText correctly', function () {
      var originalObject = {name: 'Kenny'};
      var xhr = {
        responseText: JSON.stringify(originalObject)
      };

      expect(RequestUtil.parseResponseBody(xhr)).toEqual(originalObject);
    });

    it('should parse the object with responseJSON correctly', function () {
      var originalObject = {name: 'Kenny'};
      var xhr = {
        responseJSON: originalObject
      };

      expect(RequestUtil.parseResponseBody(xhr)).toEqual(originalObject);
    });

    it('should return empty object if responseText/responseJSON doesnt exist',
      function () {
        let originalObject = {status: 200};
        expect(RequestUtil.parseResponseBody(originalObject))
          .toEqual({});
      }
    );
  });

  describe('#getErrorFromXHR', function () {
    it('should return the description property', function () {
      let json = {responseJSON: {description: 'bar'}};
      expect(RequestUtil.getErrorFromXHR(json)).toEqual('bar');
    });

    it('should return the default error message when there is no description',
      function () {
      let json = {responseJSON: {foo: 'bar'}};
      expect(RequestUtil.getErrorFromXHR(json))
        .toEqual('An error has occurred.');
    });
  });

});
