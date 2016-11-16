jest.dontMock('../AuthService');
jest.dontMock('../Authorizer');

const Authorizer = require('../Authorizer');
const AuthService = require('../AuthService');
const AuthEvent = require('../AuthEvent');

describe('AuthService', function () {
  class Authorized extends Authorizer {}
  class Unauthorized extends Authorizer {
    /* eslint-disable no-unused-vars */
    authorize(permission) {
      return false;
    }
    /* eslint-enable no-unused-vars */
  }

  const authorized = new Authorized();
  const unauthorized = new Unauthorized();

  describe('registerAuthorizer', function () {

    afterEach(function () {
      AuthService.unregisterAuthorizer(authorized);
      AuthService.unregisterAuthorizer(unauthorized);
    });

    it('should not throw if a instance of Authorizer is provided',
        function () {
          expect(function () {
            AuthService.registerAuthorizer(authorized);
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

    it('should throw if the same authorizer instance is already registered',
        function () {
          AuthService.registerAuthorizer(authorized);

          expect(function () {
            AuthService.registerAuthorizer(authorized);
          }).toThrow();
        }
    );

    it('should properly register authorizer', function () {
      AuthService.registerAuthorizer(unauthorized);

      expect(AuthService.authorize()).toBe(false);
    });

    it('should emit change event', function () {
      const changeHandler = jasmine.createSpy();

      AuthService.addListener(AuthEvent.CHANGE, changeHandler);
      AuthService.registerAuthorizer(unauthorized);

      expect(changeHandler).toHaveBeenCalled();
    });

  });

  describe('unregisterAuthenticator', function () {

    beforeEach(function () {
      AuthService.registerAuthorizer(unauthorized);
    });

    afterEach(function () {
      AuthService.unregisterAuthorizer(authorized);
      AuthService.unregisterAuthorizer(unauthorized);
    });

    it('should not throw if a instance of Authorizer is provided',
        function () {
          expect(function () {
            AuthService.unregisterAuthorizer(authorized);
          }).not.toThrow();
        }
    );

    it('should properly remove mathing authorizer', function () {
      AuthService.unregisterAuthorizer(unauthorized);

      expect(AuthService.authorize()).toBe(true);
    });

    it('should do nothing if no matching authorizers was found', function () {
      class Unknown extends Authorizer {}

      AuthService.unregisterAuthorizer(new Unknown());
      expect(AuthService.authorize()).toBe(false);
    });

    it('should emit change event', function () {
      const changeHandler = jasmine.createSpy();

      AuthService.addListener(AuthEvent.CHANGE, changeHandler);
      AuthService.unregisterAuthorizer(unauthorized);

      expect(changeHandler).toHaveBeenCalled();
    });

  });

  describe('authorize', function () {

    afterEach(function () {
      AuthService.unregisterAuthorizer(authorized);
      AuthService.unregisterAuthorizer(unauthorized);
    });

    it('should return true if every authorizer authorized the request',
        function () {
          AuthService.registerAuthorizer(authorized);

          expect(AuthService.authorize()).toBe(true);
        }
    );

    it('should return false if one authorizer didn\'t authorized the request',
        function () {
          AuthService.registerAuthorizer(authorized);
          AuthService.registerAuthorizer(unauthorized);

          expect(AuthService.authorize()).toBe(false);
        }
    );

  });

});
