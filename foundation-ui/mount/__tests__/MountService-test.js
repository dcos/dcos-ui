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

    afterEach(function () {
      MountService.unregisterComponent('register-test', ReactComponent);
      MountService.unregisterComponent('register-test', FunctionalComponent);
    });

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

    it('should properly register components', function () {
      MountService.registerComponent('register-test', ReactComponent, 0);
      MountService.registerComponent('register-test', FunctionalComponent, 0);

      expect(MountService.findComponentsWithType('register-test'))
          .toEqual([ReactComponent, FunctionalComponent]);
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

  describe('unregisterComponent', function () {

    beforeEach(function () {
      MountService.registerComponent('unregister-test', ReactComponent, 0);
      MountService.registerComponent('unregister-test', FunctionalComponent, 0);
    });

    afterEach(function () {
      MountService.unregisterComponent('unregister-test', ReactComponent);
      MountService.unregisterComponent('unregister-test', FunctionalComponent);
    });

    it('should properly remove matching components', function () {
      MountService.unregisterComponent('unregister-test', FunctionalComponent);
      expect(MountService.findComponentsWithType('unregister-test'))
          .toEqual([ReactComponent]);
    });

    it('should do nothing if no matching components was found', function () {
      MountService.unregisterComponent('unknown', FunctionalComponent);

      expect(MountService.findComponentsWithType('unregister-test'))
          .toEqual([ReactComponent, FunctionalComponent]);
    });

  });

  describe('findComponentsWithType', function () {

    beforeEach(function () {
      MountService.registerComponent('find-test', FunctionalComponent, 0);
      MountService.registerComponent('find-test', FunctionalComponent, 0);
      MountService.registerComponent('find-test', ReactComponent, 2);
      MountService.registerComponent('find-test', ReactComponent, 0);
    });

    afterEach(function () {
      MountService.unregisterComponent('find-test', FunctionalComponent);
      MountService.unregisterComponent('find-test', FunctionalComponent);
      MountService.unregisterComponent('find-test', ReactComponent);
      MountService.unregisterComponent('find-test', ReactComponent);
    });

    it('should return list of matching components in proper order',
        function () {
          expect(MountService.findComponentsWithType('find-test'))
              .toEqual([
                ReactComponent,
                FunctionalComponent,
                FunctionalComponent,
                ReactComponent
              ]);
        }
    );

    it('should return empty list if no match was found ', function () {
      expect(MountService.findComponentsWithType('unknown'))
          .toEqual([]);
    });

  });
});
