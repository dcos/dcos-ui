jest.dontMock('../MountService');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const MountService = require('../MountService');

describe('MountService', function () {
  class ReactComponent extends React.Component {};
  const FunctionalComponent = function () {};

  beforeEach(function () {
    this.instance = new MountService();
  });

  describe('registerComponent', function () {

    it('should not throw if a valid React.Component is provided', function () {
      expect(() => {
        this.instance.registerComponent(ReactComponent, 'register-test', 0);
      }).not.toThrow();
    });

    it('should not throw if a valid stateless functional component is provided',
        function () {
          expect(() => {
            this.instance
                .registerComponent(FunctionalComponent, 'register-test', 0);
          }).not.toThrow();
        }
    );

    it('should not throw if a valid type was provided', function () {
      expect(() => {
        this.instance
            .registerComponent(FunctionalComponent, 'register-test', 0);
      }).not.toThrow();
    });

    it('should properly register components', function () {
      this.instance.registerComponent(ReactComponent, 'register-test', 0);
      this.instance.registerComponent(FunctionalComponent, 'register-test', 0);

      expect(this.instance.findComponentsWithType('register-test'))
          .toEqual([ReactComponent, FunctionalComponent]);
    });

    it('should throw if an object instead of a component was provided',
        function () {
          expect(() => {
            this.instance.registerComponent({}, 'register-test', 0);
          }).toThrow();
        }
    );

    it('should throw if null instead of a component was provided', function () {
      expect(() => {
        this.instance.registerComponent(null, 'register-test', 0);
      }).toThrow();
    });

    it('should throw if component is undefined', function () {
      expect(() => {
        this.instance.registerComponent(undefined, 'register-test', 0);
      }).toThrow();
    });

    it('should throw if an object instead of a valid type was provided',
        function () {
          expect(() => {
            this.instance.registerComponent(FunctionalComponent, {}, 0);
          }).toThrow();
        }
    );

    it('should throw if null instead of a valid type was provided',
        function () {
          expect(() => {
            this.instance.registerComponent(FunctionalComponent, null, 0);
          }).toThrow();
        }
    );

    it('should throw if type is undefined', function () {
      expect(() => {
        this.instance.registerComponent(FunctionalComponent, undefined, 0);
      }).toThrow();
    });

    it('should throw if the component/type combination is already registered',
        function () {
          this.instance.registerComponent(ReactComponent, 'register-test');

          expect(() => {
            this.instance.registerComponent(ReactComponent, 'register-test');
          }).toThrow();
        }
    );

  });

  describe('unregisterComponent', function () {

    beforeEach(function () {
      this.instance.registerComponent(ReactComponent, 'unregister-test', 0);
      this.instance
          .registerComponent(FunctionalComponent, 'unregister-test', 0);
    });

    afterEach(function () {
      this.instance.unregisterComponent(ReactComponent, 'unregister-test');
      this.instance.unregisterComponent(FunctionalComponent, 'unregister-test');
    });

    it('should properly remove matching components', function () {
      this.instance.unregisterComponent(FunctionalComponent, 'unregister-test');
      expect(this.instance.findComponentsWithType('unregister-test'))
          .toEqual([ReactComponent]);
    });

    it('should do nothing if no matching components was found', function () {
      this.instance.unregisterComponent(FunctionalComponent, 'unknown');

      expect(this.instance.findComponentsWithType('unregister-test'))
          .toEqual([ReactComponent, FunctionalComponent]);
    });

  });

  describe('findComponentsWithType', function () {
    const FirstComponent = function () {};
    const SecondComponent = function () {};
    const ThirdComponent = function () {};
    const FourthComponent = function () {};

    beforeEach(function () {
      this.instance.registerComponent(SecondComponent, 'find-test', 0);
      this.instance.registerComponent(ThirdComponent, 'find-test', 0);
      this.instance.registerComponent(FirstComponent, 'find-test', 2);
      this.instance.registerComponent(FourthComponent, 'find-test', 0);
    });

    it('should return list of matching components in proper order',
        function () {
          expect(this.instance.findComponentsWithType('find-test'))
              .toEqual([
                FirstComponent,
                SecondComponent,
                ThirdComponent,
                FourthComponent
              ]);
        }
    );

    it('should return empty list if no match was found ', function () {
      expect(this.instance.findComponentsWithType('unknown'))
          .toEqual([]);
    });

  });
});
