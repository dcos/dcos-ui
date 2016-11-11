jest.dontMock('../AuthService');

const AuthService = require('../AuthService');
const Authorizer = require('../Authorizer');

describe('AuthService', function () {
  const authorizer = new Authorizer();

  describe('registerAuthorizer', function () {

    it('should not throw if a instance of Authorizer is provided',
        function () {
          expect(function () {
            AuthService.registerAuthorizer(authorizer);
          }).not.toThrow();
        }
    );

    it('should throw if an object instead of a authorizer was provided',
        function () {
          expect(function () {
            AuthService.registerAuthorizer({});
          }).toThrow();
        }
    );

    it('should throw if null instead of a authorizer was provided', function () {
      expect(function () {
        AuthService.registerAuthorizer(null);
      }).toThrow();
    });

    it('should throw if authorizer is undefined', function () {
      expect(function () {
        AuthService.registerAuthorizer(undefined);
      }).toThrow();
    });

  });

  describe('unregisterAuthenticator', function () {

    beforeEach(function () {
      AuthService.registerAuthorizer(authorizer);
    });

    afterEach(function () {
      AuthService.unregisterAuthorizer(authorizer);
    });

    it('should not throw if a instance of Authorizer is provided',
        function () {
          expect(function () {
            AuthService.unregisterAuthorizer(authorizer);
          }).not.toThrow();
        }
    );

  });

});
