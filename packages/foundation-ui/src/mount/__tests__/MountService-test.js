/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const MountService = require("../MountService");

let thisInstance;

describe("MountService", function() {
  const COMPONENT_ERROR_MESSAGE =
    "Provided component must be a " +
    "React.Component constructor or a stateless functional component";
  const TYPE_ERROR_MESSAGE = "Provided type must be a none empty string";
  const REGISTRATION_ERROR_MESSAGE =
    "Provided component/type ReactComponent/type" +
    "combination is already registered";

  class ReactComponent extends React.Component {}
  const FunctionalComponent = function() {};

  beforeEach(function() {
    thisInstance = new MountService();
  });

  describe("registerComponent", function() {
    it("does not throw if a valid React.Component is provided", function() {
      expect(() => {
        thisInstance.registerComponent(ReactComponent, "type", 0);
      }).not.toThrow();
    });

    it("does not throw if a valid stateless functional component is provided", function() {
      expect(() => {
        thisInstance.registerComponent(FunctionalComponent, "type", 0);
      }).not.toThrow();
    });

    it("does not throw if a valid type was provided", function() {
      expect(() => {
        thisInstance.registerComponent(FunctionalComponent, "type", 0);
      }).not.toThrow();
    });

    it("registers components", function() {
      thisInstance.registerComponent(ReactComponent, "type", 0);
      thisInstance.registerComponent(FunctionalComponent, "type", 0);

      expect(thisInstance.findComponentsWithType("type")).toEqual([
        ReactComponent,
        FunctionalComponent
      ]);
    });

    it("throws if an object instead of a component was provided", function() {
      expect(() => {
        thisInstance.registerComponent({}, "type", 0);
      }).toThrowError(COMPONENT_ERROR_MESSAGE);
    });

    it("throws if null instead of a component was provided", function() {
      expect(() => {
        thisInstance.registerComponent(null, "type", 0);
      }).toThrowError(COMPONENT_ERROR_MESSAGE);
    });

    it("throws if component is undefined", function() {
      expect(() => {
        thisInstance.registerComponent(undefined, "type", 0);
      }).toThrowError(COMPONENT_ERROR_MESSAGE);
    });

    it("throws if an object instead of a valid type was provided", function() {
      expect(() => {
        thisInstance.registerComponent(FunctionalComponent, {}, 0);
      }).toThrowError(TYPE_ERROR_MESSAGE);
    });

    it("throws if null instead of a valid type was provided", function() {
      expect(() => {
        thisInstance.registerComponent(FunctionalComponent, null, 0);
      }).toThrowError(TYPE_ERROR_MESSAGE);
    });

    it("throws if type is undefined", function() {
      expect(() => {
        thisInstance.registerComponent(FunctionalComponent, undefined, 0);
      }).toThrowError(TYPE_ERROR_MESSAGE);
    });

    it("throws if the component/type combination is already registered", function() {
      thisInstance.registerComponent(ReactComponent, "type");

      expect(() => {
        thisInstance.registerComponent(ReactComponent, "type");
      }).toThrowError(REGISTRATION_ERROR_MESSAGE);
    });
  });

  describe("unregisterComponent", function() {
    beforeEach(function() {
      thisInstance.registerComponent(ReactComponent, "type", 0);
      thisInstance.registerComponent(FunctionalComponent, "type", 0);
    });

    afterEach(function() {
      thisInstance.unregisterComponent(ReactComponent, "type");
      thisInstance.unregisterComponent(FunctionalComponent, "type");
    });

    it("removes matching components", function() {
      thisInstance.unregisterComponent(FunctionalComponent, "type");
      expect(thisInstance.findComponentsWithType("type")).toEqual([
        ReactComponent
      ]);
    });

    it("does nothing if no matching components was found", function() {
      thisInstance.unregisterComponent(FunctionalComponent, "unknown-type");

      expect(thisInstance.findComponentsWithType("type")).toEqual([
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
      thisInstance.registerComponent(SecondComponent, "type", 0);
      thisInstance.registerComponent(ThirdComponent, "type", 0);
      thisInstance.registerComponent(FirstComponent, "type", 2);
      thisInstance.registerComponent(FourthComponent, "type", 0);
    });

    it("returns array of matching components in proper order", function() {
      expect(thisInstance.findComponentsWithType("type")).toEqual([
        FirstComponent,
        SecondComponent,
        ThirdComponent,
        FourthComponent
      ]);
    });

    it("returns empty list if no match was found ", function() {
      expect(thisInstance.findComponentsWithType("unknown-type")).toEqual([]);
    });
  });
});
