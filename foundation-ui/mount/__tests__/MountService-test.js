jest.dontMock('../MountPoint');
jest.dontMock('../MountService');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const MountService = require('../MountService');

describe('MountService', function () {
  class ReactComponent extends React.Component {};
  const FunctionalComponent = function () {};

  describe('registerComponent', function () {

    it('should not throw if a valid React.Component is provided', function () {
      expect(function () {
        MountService.registerComponent('register-test', ReactComponent, 0);
      }).not.toThrow();
    });

    it('should not throw if a valid stateless functional component is provided',
        function () {
          expect(function () {
            MountService
                .registerComponent('register-test', FunctionalComponent, 0);
          }).not.toThrow();
        }
    );

    it('should not throw if a valid role was provided', function () {
      expect(function () {
        MountService
            .registerComponent('register-test', FunctionalComponent, 0);
      }).not.toThrow();
    });

    it('should throw if an object instead of a component was provided',
        function () {
          expect(function () {
            MountService.registerComponent('register-test', {}, 0);
          }).toThrow();
        }
    );

    it('should throw if null instead of a component was provided', function () {
      expect(function () {
        MountService.registerComponent('register-test', null, 0);
      }).toThrow();
    });

    it('should throw if component is undefined', function () {
      expect(function () {
        MountService.registerComponent('register-test', undefined, 0);
      }).toThrow();
    });

    it('should throw if an object instead of a valid role was provided',
        function () {
          expect(function () {
            MountService.registerComponent({}, FunctionalComponent, 0);
          }).toThrow();
        }
    );

    it('should throw if null instead of a valid role was provided',
        function () {
          expect(function () {
            MountService.registerComponent(null, FunctionalComponent, 0);
          }).toThrow();
        }
    );

    it('should throw if role is undefined', function () {
      expect(function () {
        MountService.registerComponent(undefined, FunctionalComponent, 0);
      }).toThrow();
    });

  });

});
