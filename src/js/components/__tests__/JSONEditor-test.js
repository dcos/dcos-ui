jest.dontMock('../JSONEditor');

const React = require('react');
const ReactDOM = require('react-dom');
const JSONEditor = require('../JSONEditor');

describe('JSONEditor', function () {

  beforeEach(function () {
    this.container = global.document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#handleChange', function () {
    const initialJSONText = `{
          "id": "/",
          "instances": 1,
          "cpus": 1,
          "mem": 128
        }`;
    const invalidJsonText = '{INVALID JSON}';
    const validJSONText = `{
          "id": "/test",
          "instances": 1,
          "cpus": 1,
          "mem": 128,
          "cmd": "while true; do sleep 10; done"
        }`;

    it('should call on change handler with new value', function () {
      const onChangeHandler = jest.fn();
      const instance = ReactDOM.render((
        <JSONEditor
          onChange={onChangeHandler} />
      ), this.container);

      instance.handleChange(validJSONText);

      expect(onChangeHandler).toBeCalledWith(JSON.parse(validJSONText));
    });

    it('should not call on change handler with invalid value', function () {
      const onChangeHandler = jest.fn();
      const instance = ReactDOM.render((
        <JSONEditor
          onChange={onChangeHandler} />
      ), this.container);
      instance.handleChange(invalidJsonText);

      expect(onChangeHandler).not.toBeCalled();
    });

    it('should call on change handler with new value after error was resolved',
      function () {
        const onChangeHandler = jest.fn();
        const instance = ReactDOM.render((
          <JSONEditor
            onChange={onChangeHandler} />
        ), this.container);

        instance.handleChange(invalidJsonText);
        instance.handleChange(validJSONText);

        expect(onChangeHandler).toBeCalledWith(JSON.parse(validJSONText));
      }
    );

    it('should call error state change handler if new error was detected',
      function () {
        const onErrorStateChangeHandler = jest.fn();
        const instance = ReactDOM.render((
          <JSONEditor
            onErrorStateChange={onErrorStateChangeHandler} />
        ), this.container);

        instance.handleChange(invalidJsonText);

        expect(onErrorStateChangeHandler).toBeCalled();
      }
    );

    it('should call error state change handler if error was resolved',
      function () {
        const onChangeHandler = jest.fn();
        const onErrorStateChangeHandler = jest.fn();
        const instance = ReactDOM.render((
          <JSONEditor
            onChange={onChangeHandler}
            onErrorStateChange={onErrorStateChangeHandler} />
        ), this.container);

        instance.handleChange(invalidJsonText);
        instance.handleChange(validJSONText);

        expect(onErrorStateChangeHandler.mock.calls.length).toEqual(2);
      }
    );

    it('should properly handle JSON change even with interfering prop updates',
      function () {
        jest.useFakeTimers();

        let instance = null;

        const onChangeHandler = jest.fn();
        const onErrorStateChangeHandler = jest.fn(function () {
          // Run all pending timers to reset internal `isTyping` state
          jest.runOnlyPendingTimers();

          instance
            .componentWillReceiveProps({value: JSON.parse(initialJSONText)});
        });

        instance = ReactDOM.render((
          <JSONEditor
            onChange={onChangeHandler}
            onErrorStateChange={onErrorStateChangeHandler} />
        ), this.container);

        instance.handleChange(initialJSONText);
        instance.handleChange(invalidJsonText);
        instance.handleChange(validJSONText);

        expect(onChangeHandler).toBeCalledWith(JSON.parse(validJSONText));
      }
    );

  });

});
