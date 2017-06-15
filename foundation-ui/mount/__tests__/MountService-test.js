jest.dontMock("../MountService");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const MountService = require("../MountService");

describe("MountService", function() {
  const COMPONENT_ERROR_MESSAGE =
    "Provided component must be a " +
    "React.Component constructor or a stateless functional component";
  const TYPE_ERROR_MESSAGE = "Provided type must be a none empty string";
  const REGISTRATION_ERROR_MESSAGE =
    "Provided component/type combination is already registered";

  class ReactComponent extends React.Component {}
  const FunctionalComponent = function() {};

  beforeEach(function() {
    this.instance = new MountService();
  });

  describe("registerComponent", function() {
    it("should not throw if a valid React.Component is provided", function() {
      expect(() => {
        this.instance.registerComponent(ReactComponent, "type", 0);
      }).not.toThrow();
    });

    it("should not throw if a valid stateless functional component is provided", function() {
      expect(() => {
        this.instance.registerComponent(FunctionalComponent, "type", 0);
      }).not.toThrow();
    });

    it("should not throw if a valid type was provided", function() {
      expect(() => {
        this.instance.registerComponent(FunctionalComponent, "type", 0);
      }).not.toThrow();
    });

    it("should properly register components", function() {
      this.instance.registerComponent(ReactComponent, "type", 0);
      this.instance.registerComponent(FunctionalComponent, "type", 0);

      expect(this.instance.findComponentsWithType("type")).toEqual([
        ReactComponent,
        FunctionalComponent
      ]);
    });

    it("should throw if an object instead of a component was provided", function() {
      expect(() => {
        this.instance.registerComponent({}, "type", 0);
      }).toThrowError(COMPONENT_ERROR_MESSAGE);
    });

    it("should throw if null instead of a component was provided", function() {
      expect(() => {
        this.instance.registerComponent(null, "type", 0);
      }).toThrowError(COMPONENT_ERROR_MESSAGE);
    });

    it("should throw if component is undefined", function() {
      expect(() => {
        this.instance.registerComponent(undefined, "type", 0);
      }).toThrowError(COMPONENT_ERROR_MESSAGE);
    });

    it("should throw if an object instead of a valid type was provided", function() {
      expect(() => {
        this.instance.registerComponent(FunctionalComponent, {}, 0);
      }).toThrowError(TYPE_ERROR_MESSAGE);
    });

    it("should throw if null instead of a valid type was provided", function() {
      expect(() => {
        this.instance.registerComponent(FunctionalComponent, null, 0);
      }).toThrowError(TYPE_ERROR_MESSAGE);
    });

    it("should throw if type is undefined", function() {
      expect(() => {
        this.instance.registerComponent(FunctionalComponent, undefined, 0);
      }).toThrowError(TYPE_ERROR_MESSAGE);
    });

    it("should throw if the component/type combination is already registered", function() {
      this.instance.registerComponent(ReactComponent, "type");

      expect(() => {
        this.instance.registerComponent(ReactComponent, "type");
      }).toThrowError(REGISTRATION_ERROR_MESSAGE);
    });
  });

  describe("unregisterComponent", function() {
    beforeEach(function() {
      this.instance.registerComponent(ReactComponent, "type", 0);
      this.instance.registerComponent(FunctionalComponent, "type", 0);
    });

    afterEach(function() {
      this.instance.unregisterComponent(ReactComponent, "type");
      this.instance.unregisterComponent(FunctionalComponent, "type");
    });

    it("should properly remove matching components", function() {
      this.instance.unregisterComponent(FunctionalComponent, "type");
      expect(this.instance.findComponentsWithType("type")).toEqual([
        ReactComponent
      ]);
    });

    it("should do nothing if no matching components was found", function() {
      this.instance.unregisterComponent(FunctionalComponent, "unknown-type");

      expect(this.instance.findComponentsWithType("type")).toEqual([
        ReactComponent,
        FunctionalComponent
      ]);
    });
  });

  describe("findComponentsWithType", function() {
    const FirstComponent = function() {};
    const SecondComponent = function() {};
    const ThirdComponent = function() {};
    const FourthComponent = function() {};

    beforeEach(function() {
      this.instance.registerComponent(SecondComponent, "type", 0);
      this.instance.registerComponent(ThirdComponent, "type", 0);
      this.instance.registerComponent(FirstComponent, "type", 2);
      this.instance.registerComponent(FourthComponent, "type", 0);
    });

    it("should return array of matching components in proper order", function() {
      expect(this.instance.findComponentsWithType("type")).toEqual([
        FirstComponent,
        SecondComponent,
        ThirdComponent,
        FourthComponent
      ]);
    });

    it("should return empty list if no match was found ", function() {
      expect(this.instance.findComponentsWithType("unknown-type")).toEqual([]);
    });
  });
});
