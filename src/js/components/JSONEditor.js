import AceEditor from "react-ace";
import React from "react";
import deepEqual from "deep-equal";

import { omit } from "../utils/Util";
import JSONUtil from "../utils/JSONUtil";
import JSONEditorUtil from "../utils/JSONEditorUtil";

const METHODS_TO_BIND = [
  "handleBlur",
  "handleChange",
  "handleEditorLoad",
  "handleFocus"
];

/**
 * How long to wait before clearing the `isTyping` flag, used internally to
 * prohibit external updates to the editor while the user is typing.
 *
 * @const {number}
 */
const IS_TYPING_TIMEOUT = 2000;

/**
 * This is a high-order component on top of `AceEditor` that abstracts the JSON
 * string manipulation and allows object-level access to the underlying data.
 *
 * It's features are:
 *
 * - Solve some bugs and peculiarities of AceEditor component
 * - Maintain visual coherence between object updates
 * - Callback on per-property updates as the user types
 * - Receive errors through properties and show them in the gutter
 *
 * @example <caption>How to use the JSONEditor</caption>
 *
 * handleChange(newObject) {
 *   console.log('New object:', newObject);
 * }
 *
 * handlePropertyChange(path, value) {
 *   console.log('Property /'+path.join('/'), 'changed to', value);
 * }
 *
 * render() {
 *   let value = {
 *     some: {value: 'object'}
 *   };
 *   let errors = [
 *     {path: ['some'], message: 'An error on object `some`'}
 *   ];
 *
 *   return (
 *     <JSONEditor
 *       value={value}
 *       errors={errors}
 *       onChange={this.handleChange}
 *       onPropertyChange={this.handlePropertyChange}
 *       />
 *   );
 * };
 *
 */
class JSONEditor extends React.Component {
  constructor() {
    super(...arguments);
    // Clone the given initial value
    const jsonText = JSON.stringify(this.props.value || {}, null, 2);

    // We are using the react-way of updating the component **only** when we
    // need to define a new text to work upon (ex. when the owner component has
    // updated the value).
    //
    // Updating the AceEditor on every render cycle seems to cause some trouble
    // to it's internals, that I couldn't pinpoint yet.
    this.state = {
      aceEditorState: {
        jsonText
      }
    };

    //
    // The following properties are part of the `internal`, non-react state
    // and is synchronized with the react through `componentWillReceiveProps`
    //
    this.externalErrors = (this.props.errors || []).slice();
    this.jsonError = null;
    this.jsonMeta = [];
    this.jsonText = null;
    this.jsonValue = {};

    //
    // The following properties are flags and references used for other purposes
    //
    this.aceEditor = null;
    this.isFocused = false;
    this.isTyping = false;
    this.timerIsTyping = null;

    // Initial state synchronization
    this.updateLocalJsonState(this.getNewJsonState(jsonText));

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * @override
   */
  componentWillReceiveProps(nextProps) {
    // Synchronize error updates
    if (!deepEqual(this.externalErrors, nextProps.errors)) {
      this.externalErrors = (nextProps.errors || []).slice();
      this.updateEditorState();
    }

    // Ignore invalid values
    if (typeof nextProps.value !== "object") {
      return;
    }

    // Ignore property changes if the user is currently using the editor field
    if (this.isTyping && this.isFocused) {
      return;
    }

    // If this update originates from an onChange -> prop={value} loop, the
    // object defined in the `internalValue` property should be equal to the
    // `value` property we just received. In this case, don't update anything.
    if (deepEqual(this.jsonValue, nextProps.value)) {
      return;
    }

    // If we reached this point, the owning component has actually sent us a new
    // json object that we must display. For visual coherence we must try our
    // best to properly display the new values without breaking the JSON text
    // arrangement.

    // Align the order the properties appear & calculate new JSON text
    const value = JSONEditorUtil.sortObjectKeys(
      this.jsonValue,
      nextProps.value
    );
    const jsonText = JSON.stringify(value, null, 2);

    // Update local state with the new, computed text
    this.updateLocalJsonState(this.getNewJsonState(jsonText));
    this.setState({ aceEditorState: { jsonText } });
  }

  /**
   * Since ACEEditor component does not behave nicely when we update the text
   * as a response to an `onChange` event, we must be very careful never to
   * render the ACEEditor when the user types.
   *
   * This way, the component is updated *only* when:
   *
   * - Editor-related properties change (ex. editorProps, width, height)
   * - The text in the editor has to be replaced due to an external value change
   *
   * @override
   */
  shouldComponentUpdate(nextProps, nextState) {
    // Update if ACE editor properties are changed
    if (
      !deepEqual(nextProps.editorProps, this.props.editorProps) ||
      nextProps.height !== this.props.height ||
      nextProps.width !== this.props.width
    ) {
      return true;
    }

    // Otherwise update ONLY when initial value changes in state
    return nextState.aceEditorState !== this.state.aceEditorState;
  }

  /**
   * @override
   */
  componentDidUpdate() {
    this.updateEditorState();
  }

  handleEditorLoad(editor) {
    this.aceEditor = editor;

    // Disable tab index for JSON editor
    this.aceEditor.renderer.textarea.setAttribute("tabIndex", -1);

    // Disable syntax highlighting worker, since we are responsible for feeding
    // the correct syntax error + provided error markers
    const editorSession = editor.getSession();
    editorSession.setUseWorker(false);

    // Enable soft tabs and set tab space to 2
    editorSession.setTabSize(2);

    // Synchronize editor state
    this.updateEditorState();
  }

  /**
   * `onBlur` handler for the AceEditor
   *
   * @param {DOMEvent} event - The event object
   */
  handleBlur(event) {
    this.props.onBlur(event, this.jsonValue);
    this.isFocused = false;
  }

  /**
   * `onChange` handler for the AceEditor
   *
   * @param {string} jsonText - The new JSON string
   */
  handleChange(jsonText) {
    const lastValue = this.jsonValue;
    const lastError = this.jsonError;

    // Calculate what the next state is going to be
    const { jsonValue, jsonMeta, jsonError } = this.getNewJsonState(jsonText);

    // Update the `isTyping` flag
    this.isTyping = true;
    this.scheduleIsTypingReset(IS_TYPING_TIMEOUT);

    // Handle errors
    if (lastError !== jsonError) {
      this.props.onErrorStateChange(jsonError);
    }

    // If we have errors don't continue with updating the local structures
    if (!jsonError) {
      // Calculate differences in the JSON and trigger `onPropertyChange`
      // event for every property that changed in the JSON
      const diff = JSONEditorUtil.deepObjectDiff(lastValue, jsonValue);

      diff.forEach(({ path, value }) => {
        this.props.onPropertyChange(path, value, jsonValue);
      });

      // Trigger change with the latest json object
      this.props.onChange(jsonValue);
    }

    // Update local json state
    this.updateLocalJsonState({ jsonValue, jsonMeta, jsonError, jsonText });
  }

  /**
   * `onFocus` handler for the AceEditor
   *
   * @param {DOMEvent} event - The event object
   */
  handleFocus(event) {
    this.props.onFocus(event, this.jsonValue);
    this.isFocused = true;
  }

  /**
   * Apply pending state updates to the ACE editor instance.
   *
   * This function operates purely on the `aceEditor` instance, created by the
   * `AceEditor` composed and exposed through the `onLoad` event. Since the
   * `AceEditor` component does a pretty bad job updating only what's needed,
   * we had to use this approach and avoid re-rendering the component as much
   * as possible.
   */
  updateEditorState() {
    if (!this.aceEditor) {
      return;
    }

    // Defer the annotation update, since for some reason ACE editor
    // does not get updated if the update comes from the same stack call
    // that set it's state.
    setTimeout(() => {
      this.aceEditor.getSession().setAnnotations(this.getErrorMarkers());
    }, 1);
  }

  /**
   * Get new JSON state (parsed value and meta data) from json text.
   *
   * @param {String} jsonText - The JSON buffer to extract metadata from
   * @return {null | {
   *      jsonValue:object,
   *      jsonText:string,
   *      jsonMeta:object,
   *      jsonError:string
   *    }} jsonState - JSON state including parsed value and meta data
   */
  getNewJsonState(jsonText) {
    // Do not perform heavyweight calculations, such as `getObjectInformation`
    // if the json text hasn't really changed.
    if (this.jsonText === jsonText) {
      return null;
    }

    // Reset some properties
    let { jsonValue, jsonMeta, jsonError } = this;

    // Try to parse and extract metadata
    try {
      jsonError = null;
      jsonValue = JSON.parse(jsonText);
      jsonMeta = JSONUtil.getObjectInformation(jsonText);
    } catch (e) {
      // Prettify the error message by resolving the line/column instead of
      // just keeping the offset in the string
      const errorStr = e.toString();
      jsonError = errorStr.replace(/at position (\d+)/g, function(
        match,
        offset
      ) {
        const cursor = JSONEditorUtil.cursorFromOffset(
          parseInt(offset, 10),
          jsonText
        );

        return `at line ${cursor.row}:${cursor.column}`;
      });
    }

    return { jsonValue, jsonText, jsonMeta, jsonError };
  }

  /**
   * This function assigns the local JSON state (parsed value and meta data),
   * outside the React state, since this does not necessarily trigger an update.
   *
   * This is useful in order to have the latest available metainformation when
   * the user changes the text (on the `handleChange` handler), but we don't
   * want to re-do the processing when this will eventually trigger an update
   * to the `value` property with the same data.
   *
   * @param {object|null} jsonState
   * @param {object} jsonState.jsonValue
   * @param {string} jsonState.jsonText
   * @param {object} jsonState.jsonMeta
   * @param {string} jsonState.jsonError
   */
  updateLocalJsonState(jsonState) {
    if (jsonState == null) {
      return;
    }

    this.jsonText = jsonState.jsonText;
    this.jsonError = jsonState.jsonError;
    this.jsonValue = jsonState.jsonValue;
    this.jsonMeta = jsonState.jsonMeta;

    // Sync editor without a render cycle
    this.updateEditorState();
  }

  /**
   * Schedule the `isTyping` state property to set back to `false` if this
   * function is not called within the given timeout.
   *
   * @param {number} timeout - The timeout (in millisecond) on which to clear
   *                 the flag
   */
  scheduleIsTypingReset(timeout) {
    if (this.timerIsTyping) {
      clearTimeout(this.timerIsTyping);
    }

    this.timerIsTyping = setTimeout(() => {
      this.isTyping = false;
    }, timeout);
  }

  /**
   * Collects error markers to set on the Ace Editor
   * @return {Array<({
   *   row:Number,
   *   text:String,
   *   type:String
   * })>} An array of errors to show in the Ace Editor
   */
  getErrorMarkers() {
    // Extract syntax errors, or other errors that refer to line
    if (this.jsonError) {
      // Strip out the 'at line xxx' message, and keep track of that line
      let errorLine = 0;
      const errorMsg = this.jsonError.replace(/at line ([\d:]+)/g, function(
        m,
        line
      ) {
        errorLine = parseInt(line.split(":")[0], 10);

        return "";
      });

      // Return error marker
      return [
        {
          row: errorLine,
          text: errorMsg,
          type: "error"
        }
      ];
    }

    return this.externalErrors.map(error => {
      const { path, message } = error;

      // All errors with empty paths go to line 0
      if (path.length === 0) {
        return {
          row: 0,
          text: message,
          type: "error"
        };
      }

      // Check if there is a token that matches the path completely
      const errorPath = error.path.join(".");
      const token = this.jsonMeta.find(function(token) {
        return token.path.join(".") === errorPath;
      });

      if (token) {
        return {
          row: token.line - 1,
          text: message,
          type: "error"
        };
      }

      // When we are not able to find an exact match we are going to gradually
      // increase the error scope until we find a token that exists.
      //
      // If nothing is found, default to root ([])
      //
      const candidates = this.jsonMeta.reduce(
        function(memo, token) {
          const isMatch = token.path.every(function(component, i) {
            return path[i] === component;
          });

          if (isMatch) {
            memo.push({
              path: token.path,
              row: token.line - 1
            });
          }

          return memo;
        },
        [{ path: [], row: 0 }]
      );

      // Find the most specific token line
      const candidate = candidates.sort(function(a, b) {
        return b.path.length - a.path.length;
      })[0];

      // Keep the difference between the original and the new path and display
      // it as prefix in the error message:
      const prefixPath = path.slice(candidate.path.length).join(".");

      return {
        row: candidate.row,
        text: `${prefixPath}: ${message}`,
        type: "error"
      };
    });
  }

  /**
   * @override
   */
  render() {
    const { width, height, editorProps } = this.props;
    const { aceEditorState } = this.state;

    const omitKeys = [].concat(Object.keys(JSONEditor.propTypes), "mode");

    return (
      <AceEditor
        {...omit(this.props, omitKeys)}
        width={width}
        height={height}
        editorProps={editorProps}
        mode="json"
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onLoad={this.handleEditorLoad}
        value={aceEditorState.jsonText}
      />
    );
  }
}

JSONEditor.defaultProps = {
  errors: [],
  editorProps: { $blockScrolling: Infinity },
  height: "100%",
  onBlur() {},
  onChange() {},
  onErrorStateChange() {},
  onFocus() {},
  onPropertyChange() {},
  value: {},
  width: "100%"
};

JSONEditor.propTypes = {
  errors: React.PropTypes.array,
  editorProps: React.PropTypes.object,
  height: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]),
  onBlur: React.PropTypes.func,
  onChange: React.PropTypes.func,
  onErrorStateChange: React.PropTypes.func,
  onFocus: React.PropTypes.func,
  onPropertyChange: React.PropTypes.func,
  value: React.PropTypes.object,
  width: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ])
};

module.exports = JSONEditor;
