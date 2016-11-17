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
      MountService.unregisterComponent(ReactComponent, 'register-test');
      MountService.unregisterComponent(FunctionalComponent, 'register-test');
    });

    it('should not throw if a valid React.Component is provided', function () {
      expect(function () {
        MountService.registerComponent(ReactComponent, 'register-test', 0);
      }).not.toThrow();
    });

    it('should not throw if a valid stateless functional component is provided',
        function () {
          expect(function () {
            MountService
                .registerComponent(FunctionalComponent, 'register-test', 0);
          }).not.toThrow();
        }
    );

    it('should not throw if a valid type was provided', function () {
      expect(function () {
        MountService
            .registerComponent(FunctionalComponent, 'register-test', 0);
      }).not.toThrow();
    });

    it('should properly register components', function () {
      MountService.registerComponent(ReactComponent, 'register-test', 0);
      MountService.registerComponent(FunctionalComponent, 'register-test', 0);

      expect(MountService.findComponentsWithType('register-test'))
          .toEqual([ReactComponent, FunctionalComponent]);
    });

    it('should throw if an object instead of a component was provided',
        function () {
          expect(function () {
            MountService.registerComponent({}, 'register-test', 0);
          }).toThrow();
        }
    );

    it('should throw if null instead of a component was provided', function () {
      expect(function () {
        MountService.registerComponent(null, 'register-test', 0);
      }).toThrow();
    });

    it('should throw if component is undefined', function () {
      expect(function () {
        MountService.registerComponent(undefined, 'register-test', 0);
      }).toThrow();
    });

    it('should throw if an object instead of a valid type was provided',
        function () {
          expect(function () {
            MountService.registerComponent(FunctionalComponent, {}, 0);
          }).toThrow();
        }
    );

    it('should throw if null instead of a valid type was provided',
        function () {
          expect(function () {
            MountService.registerComponent(FunctionalComponent, null, 0);
          }).toThrow();
        }
    );

    it('should throw if type is undefined', function () {
      expect(function () {
        MountService.registerComponent(FunctionalComponent, undefined, 0);
      }).toThrow();
    });

    it('should throw if the component/type combination is already registered',
        function () {
          MountService.registerComponent(ReactComponent, 'register-test');

          expect(function () {
            MountService.registerComponent(ReactComponent, 'register-test');
          }).toThrow();
        }
    );

  });

  describe('unregisterComponent', function () {

    beforeEach(function () {
      MountService.registerComponent(ReactComponent, 'unregister-test', 0);
      MountService.registerComponent(FunctionalComponent, 'unregister-test', 0);
    });

    afterEach(function () {
      MountService.unregisterComponent(ReactComponent, 'unregister-test');
      MountService.unregisterComponent(FunctionalComponent, 'unregister-test');
    });

    it('should properly remove matching components', function () {
      MountService.unregisterComponent(FunctionalComponent, 'unregister-test');
      expect(MountService.findComponentsWithType('unregister-test'))
          .toEqual([ReactComponent]);
    });

    it('should do nothing if no matching components was found', function () {
      MountService.unregisterComponent(FunctionalComponent, 'unknown');

      expect(MountService.findComponentsWithType('unregister-test'))
          .toEqual([ReactComponent, FunctionalComponent]);
    });

  });

  describe('findComponentsWithType', function () {
    const FirstComponent = function () {};
    const SecondComponent = function () {};
    const ThirdComponent = function () {};
    const FourthComponent = function () {};

    beforeEach(function () {
      MountService.registerComponent(SecondComponent, 'find-test', 0);
      MountService.registerComponent(ThirdComponent, 'find-test', 0);
      MountService.registerComponent(FirstComponent, 'find-test', 2);
      MountService.registerComponent(FourthComponent, 'find-test', 0);
    });

    afterEach(function () {
      MountService.unregisterComponent(FirstComponent, 'find-test');
      MountService.unregisterComponent(SecondComponent, 'find-test');
      MountService.unregisterComponent(ThirdComponent, 'find-test');
      MountService.unregisterComponent(FourthComponent, 'find-test');
    });

    it('should return list of matching components in proper order',
        function () {
          expect(MountService.findComponentsWithType('find-test'))
              .toEqual([
                FirstComponent,
                SecondComponent,
                ThirdComponent,
                FourthComponent
              ]);
        }
    );

    it('should return empty list if no match was found ', function () {
      expect(MountService.findComponentsWithType('unknown'))
          .toEqual([]);
    });

  });
});
