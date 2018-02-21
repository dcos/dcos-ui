const React = require("react");
const ReactDOM = require("react-dom");
const JSONEditor = require("../JSONEditor");

let thisContainer;

describe("JSONEditor", function() {
  beforeEach(function() {
    thisContainer = global.document.createElement("div");
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
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

    it("prevents unnecessary component updates", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={initialValue} />,
        thisContainer
      );

      const nextProps = Object.assign({}, instance.props, {
        value: updatedValue
      });
      const nextState = instance.state;

      instance.handleChange(JSON.stringify(updatedValue));

      expect(instance.shouldComponentUpdate(nextProps, nextState)).toBe(false);
    });

    it("updates the component if the internal data has changed", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={initialValue} />,
        thisContainer
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

    it("calls on change handler with new value", function() {
      const onChangeHandler = jest.fn();
      const instance = ReactDOM.render(
        <JSONEditor onChange={onChangeHandler} />,
        thisContainer
      );

      instance.handleChange(validJSONText);

      expect(onChangeHandler).toBeCalledWith(JSON.parse(validJSONText));
    });

    it("does not call on change handler with invalid value", function() {
      const onChangeHandler = jest.fn();
      const instance = ReactDOM.render(
        <JSONEditor onChange={onChangeHandler} />,
        thisContainer
      );
      instance.handleChange(invalidJsonText);

      expect(onChangeHandler).not.toBeCalled();
    });

    it("calls on change handler with new value after error was resolved", function() {
      const onChangeHandler = jest.fn();
      const instance = ReactDOM.render(
        <JSONEditor onChange={onChangeHandler} />,
        thisContainer
      );

      instance.handleChange(invalidJsonText);
      instance.handleChange(validJSONText);

      expect(onChangeHandler).toBeCalledWith(JSON.parse(validJSONText));
    });

    it("calls error state change handler if new error was detected", function() {
      const onErrorStateChangeHandler = jest.fn();
      const instance = ReactDOM.render(
        <JSONEditor onErrorStateChange={onErrorStateChangeHandler} />,
        thisContainer
      );

      instance.handleChange(invalidJsonText);

      expect(onErrorStateChangeHandler).toBeCalled();
    });

    it("calls error state change handler if error was resolved", function() {
      const onChangeHandler = jest.fn();
      const onErrorStateChangeHandler = jest.fn();
      const instance = ReactDOM.render(
        <JSONEditor
          onChange={onChangeHandler}
          onErrorStateChange={onErrorStateChangeHandler}
        />,
        thisContainer
      );

      instance.handleChange(invalidJsonText);
      instance.handleChange(validJSONText);

      expect(onErrorStateChangeHandler.mock.calls.length).toEqual(2);
    });

    it("handles JSON change even with interfering prop updates", function() {
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
        thisContainer
      );

      instance.handleChange(initialJSONText);
      instance.handleChange(invalidJsonText);
      instance.handleChange(validJSONText);

      expect(onChangeHandler).toBeCalledWith(JSON.parse(validJSONText));
    });
  });

  describe("#updateLocalJsonState", function() {
    it("accepts `null` as an argument", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={{}} />,
        thisContainer
      );

      instance.updateLocalJsonState(null);

      expect(instance.jsonText).toEqual("{}");
      expect(instance.jsonValue).toEqual({});
      expect(instance.jsonMeta).toEqual([]);
      expect(instance.jsonError).toEqual(null);
    });

    it("updates all properties as given", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={{}} />,
        thisContainer
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
    it("returns `null` if the text has not changed", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={{}} />,
        thisContainer
      );

      expect(instance.getNewJsonState("{}")).toEqual(null);
    });

    it("returns errors if JSON is invalid", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={{}} />,
        thisContainer
      );

      expect(instance.getNewJsonState("{")).toEqual({
        jsonError: "SyntaxError: Unexpected end of JSON input",
        jsonMeta: [],
        jsonText: "{",
        jsonValue: {}
      });
    });

    it("returns the correct state on new JSON", function() {
      const instance = ReactDOM.render(
        <JSONEditor value={{}} />,
        thisContainer
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
