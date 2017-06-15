jest.dontMock("../JSONEditor");

const React = require("react");
const ReactDOM = require("react-dom");
const JSONEditor = require("../JSONEditor");

describe("JSONEditor", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#shouldComponentUpdate", function() {
    const initialValue = {
      id: "/",
      instances: 1,
      cpus: 1,
      mem: 128
    };
    const updatedValue = {
      id: "/test",
      instances: 1,
      cpus: 1,
      mem: 128,
      cmd: "while true; do sleep 10; done"
    };

    it("should prevent unnecessary component updates", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={initialValue} />,
        this.container
      );

      const nextProps = Object.assign({}, instance.props, {
        value: updatedValue
      });
      const nextState = instance.state;

      instance.handleChange(JSON.stringify(updatedValue));

      expect(instance.shouldComponentUpdate(nextProps, nextState)).toBe(false);
    });

    it("should update the component if the internal data has changed", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={initialValue} />,
        this.container
      );

      const nextProps = instance.props;
      const nextState = instance.state;

      instance.handleChange(JSON.stringify(updatedValue));
      instance.componentWillReceiveProps(nextProps);

      expect(instance.shouldComponentUpdate(nextProps, nextState)).toBe(true);
    });
  });

  describe("#handleChange", function() {
    const initialJSONText = `{
          "id": "/",
          "instances": 1,
          "cpus": 1,
          "mem": 128
        }`;
    const invalidJsonText = "{INVALID JSON}";
    const validJSONText = `{
          "id": "/test",
          "instances": 1,
          "cpus": 1,
          "mem": 128,
          "cmd": "while true; do sleep 10; done"
        }`;

    it("should call on change handler with new value", function() {
      const onChangeHandler = jest.fn();
      const instance = ReactDOM.render(
        <JSONEditor onChange={onChangeHandler} />,
        this.container
      );

      instance.handleChange(validJSONText);

      expect(onChangeHandler).toBeCalledWith(JSON.parse(validJSONText));
    });

    it("should not call on change handler with invalid value", function() {
      const onChangeHandler = jest.fn();
      const instance = ReactDOM.render(
        <JSONEditor onChange={onChangeHandler} />,
        this.container
      );
      instance.handleChange(invalidJsonText);

      expect(onChangeHandler).not.toBeCalled();
    });

    it("should call on change handler with new value after error was resolved", function() {
      const onChangeHandler = jest.fn();
      const instance = ReactDOM.render(
        <JSONEditor onChange={onChangeHandler} />,
        this.container
      );

      instance.handleChange(invalidJsonText);
      instance.handleChange(validJSONText);

      expect(onChangeHandler).toBeCalledWith(JSON.parse(validJSONText));
    });

    it("should call error state change handler if new error was detected", function() {
      const onErrorStateChangeHandler = jest.fn();
      const instance = ReactDOM.render(
        <JSONEditor onErrorStateChange={onErrorStateChangeHandler} />,
        this.container
      );

      instance.handleChange(invalidJsonText);

      expect(onErrorStateChangeHandler).toBeCalled();
    });

    it("should call error state change handler if error was resolved", function() {
      const onChangeHandler = jest.fn();
      const onErrorStateChangeHandler = jest.fn();
      const instance = ReactDOM.render(
        <JSONEditor
          onChange={onChangeHandler}
          onErrorStateChange={onErrorStateChangeHandler}
        />,
        this.container
      );

      instance.handleChange(invalidJsonText);
      instance.handleChange(validJSONText);

      expect(onErrorStateChangeHandler.mock.calls.length).toEqual(2);
    });

    it("should properly handle JSON change even with interfering prop updates", function() {
      jest.useFakeTimers();

      let instance = null;

      const onChangeHandler = jest.fn();
      const onErrorStateChangeHandler = jest.fn(function() {
        // Run all pending timers to reset internal `isTyping` state
        jest.runOnlyPendingTimers();

        instance.componentWillReceiveProps({
          value: JSON.parse(initialJSONText)
        });
      });

      instance = ReactDOM.render(
        <JSONEditor
          onChange={onChangeHandler}
          onErrorStateChange={onErrorStateChangeHandler}
        />,
        this.container
      );

      instance.handleChange(initialJSONText);
      instance.handleChange(invalidJsonText);
      instance.handleChange(validJSONText);

      expect(onChangeHandler).toBeCalledWith(JSON.parse(validJSONText));
    });
  });

  describe("#updateLocalJsonState", function() {
    it("should accept `null` as an argument", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={{}} />,
        this.container
      );

      instance.updateLocalJsonState(null);

      expect(instance.jsonText).toEqual("{}");
      expect(instance.jsonValue).toEqual({});
      expect(instance.jsonMeta).toEqual([]);
      expect(instance.jsonError).toEqual(null);
    });

    it("should update all properties as given", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={{}} />,
        this.container
      );

      instance.updateLocalJsonState({
        jsonText: "[]",
        jsonError: [{ path: "id", message: "Required" }],
        jsonValue: [],
        jsonMeta: [{ path: "id", line: 1 }]
      });

      expect(instance.jsonText).toEqual("[]");
      expect(instance.jsonValue).toEqual([]);
      expect(instance.jsonMeta).toEqual([{ path: "id", line: 1 }]);
      expect(instance.jsonError).toEqual([{ path: "id", message: "Required" }]);
    });
  });

  describe("#getNewJsonState", function() {
    it("should return `null` if the text has not changed", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={{}} />,
        this.container
      );

      expect(instance.getNewJsonState("{}")).toEqual(null);
    });

    it("should return errors if JSON is invalid", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={{}} />,
        this.container
      );

      expect(instance.getNewJsonState("{")).toEqual({
        jsonError: "SyntaxError: Unexpected end of input",
        jsonMeta: [],
        jsonText: "{",
        jsonValue: {}
      });
    });

    it("should return the correct state on new JSON", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={{}} />,
        this.container
      );

      expect(instance.getNewJsonState('[\n"foo"\n]')).toEqual({
        jsonError: null,
        jsonMeta: [
          {
            line: 2,
            path: [0],
            position: [2, 7],
            type: "literal",
            value: "foo"
          }
        ],
        jsonText: '[\n"foo"\n]',
        jsonValue: ["foo"]
      });
    });
  });
});
