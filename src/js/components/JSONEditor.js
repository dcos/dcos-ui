import AceEditor from 'react-ace';
import React from 'react';
import deepEqual from 'deep-equal';

import {omit} from '../utils/Util';
import JSONUtil from '../utils/JSONUtil';
import JSONEditorUtil from '../utils/JSONEditorUtil';

const METHODS_TO_BIND = [
  'handleBlur',
  'handleChange',
  'handleEditorLoad',
  'handleWindowResize',
  'handleFocus'
];

/**
 * How long to wait before clearing the `isTyping` flag, used internally to
 * prohibit external updates to the editor while the user is typing.
 *
 * @const {number}
 */
const ISTYPING_TIMEOUT = 2000;

/**
 * This is a high-order component on top of `AceEditor` that abstracts the JSON
 * string manipulation and allows object-level access to the underlaying data.
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
    let initialText = JSON.stringify(this.props.value || {}, null, 2);
    let initialValue = JSON.parse(initialText);

    // We are using the react-way of updating the component **only** when we
    // need to define a new text to work upon (ex. when the owner component has
    // updated the value).
    //
    // Updating the AceEditor on every render cycle seems to cause some trouble
    // to it's internals, that I couldn't pinpoint yet.
    this.state = {
      initialText
    };

    //
    // The following properties are part of the `internal`, non-react state
    // and is synchronized with the react through `componentWillReceiveProps`
    //
    this.externalErrors = (this.props.errors || []).slice();
    this.jsonError = null;
    this.jsonMeta = [];
    this.jsonText = '{}';
    this.jsonValue = {};

    //
    // The following properties are flags and references used for other purposes
    //
    this.aceEditor = null;
    this.isFocused = false;
    this.isTyping = false;
    this.timerIsTyping = null;

    // Initial state synchronisation
    this.updateLocalJsonState(initialValue);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * @override
   */
  componentWillReceiveProps(nextProps) {
    // Synchronise error updates
    if (!deepEqual(this.externalErrors, nextProps.errors)) {
      this.externalErrors = (nextProps.errors || []).slice();
      this.updateEditorState();
    }

    // Ignore invalid values
    if (typeof nextProps.value !== 'object') {
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
    let value = JSONEditorUtil.sortObjectKeys(this.jsonValue,
      nextProps.value);
    let composedText = JSON.stringify(value, null, 2);

    // Update local state with the new, computed text
    this.updateLocalJsonState(composedText);
    this.setState({initialText: composedText});
  }

  /**
   * Since ACEEditor component does not behave nicely when we update the text
   * as a response to an `onChange` event, we must be very careful never to
   * render the ACEeditor when the user types.
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
    if (!deepEqual(nextProps.editorProps, this.props.editorProps) ||
        (nextProps.height !== this.props.height) ||
        (nextProps.width !== this.props.width)) {
      return true;
    }

    // Otherwise update ONLY when initial value changes in state
    return nextState.initialText !== this.state.initialText;
  }

  /**
   * @override
   */
  componentDidUpdate() {
    this.updateEditorState();
  }

  // -- BEGIN HACK -------------------------------------------------------------
  //
  // This tries to undo an issue caused by a `transform` attribute in the CSS
  // chain, that makes Ace editor miscalculate the viewport origin and
  // therefore render the tooltip outside the viewable region.
  //
  // TODO: Properly solve this in CSS
  //
  /**
   * @override
   */
  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
  }

  /**
   * @override
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize() {
    if (!this.aceEditor) {
      return;
    }

    let editorRect = this.aceEditor.container.getBoundingClientRect();
    let tooltip = this.aceEditor.container.querySelector('.ace_tooltip');
    if (!tooltip) {
      return;
    }

    tooltip.style.transform =
      tooltip.style.webkitTransform =
      tooltip.style.mozTransform =
      tooltip.style.msTransform =
      `translateX(-${editorRect.left}px) translateY(-${editorRect.top}px)`;
  }
  // -- END HACK ---------------------------------------------------------------

  handleEditorLoad(editor) {
    this.aceEditor = editor;

    // Disable syntax highlighing worker, since we are responsible for feeding
    // the correct syntax error + provided error markers
    let editorSession = editor.getSession();
    editorSession.setUseWorker(false);

    // Enable soft tabs and set tab space to 2
    editorSession.setTabSize(2);

    // Synchronise editor state
    this.updateEditorState();

    // -- BEGIN HACK -----------------------------------------------------------
    //
    // This tries to undo an issue caused by a `transform` attribute in the CSS
    // chain, that makes Ace editor miscalculate the viewport origin and
    // therefore render the tooltip outside the viewable region.
    //
    // TODO: Properly solve this in CSS
    //
    let MutationObserver = window.MutationObserver
      || window.mozMutationObserver
      || window.webkitMutationObserver
      || window.msMutationObserver;
    let observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (!mutation.addedNodes) {
          return;
        }
        // Wait until we the tooltip DOM element is injected and position it
        // accordingly
        mutation.addedNodes.forEach((node) => {
          if (node.classList.contains('ace_tooltip')) {
            this.handleWindowResize();
            observer.disconnect();
          }
        });
      });
    });
    observer.observe(this.aceEditor.container, {childList: true});
    //
    // -- END HACK -------------------------------------------------------------

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
    let lastValue = this.jsonValue;
    let lastError = this.jsonError;

    // Calculate what the next state is going to be
    this.updateLocalJsonState(jsonText);

    // Handle errors
    if (lastError !== this.jsonError) {
      this.props.onErrorStateChange(this.jsonError);
    }

    // Update the `isTyping` flag
    this.isTyping = true;
    this.scheduleIsTypingReset(ISTYPING_TIMEOUT);

    // If we have errors don't continue with updating the local structures
    if (this.jsonError) {
      return;
    }

    // Calculate differences in the JSON and trigger `onPropertyChange`
    // event for every property that changed in the JSON
    let diff = JSONEditorUtil.deepObjectDiff(lastValue, this.jsonValue);
    diff.forEach(({path, value}) => {
      this.props.onPropertyChange(path, value, this.jsonValue);
    });

    // Trigger change with the latest json object
    this.props.onChange(this.jsonValue);
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

    // Merge current annotations with the annotations we are going to show
    this.aceEditor.getSession().setAnnotations(this.getErrorMarkers());
  }

  /**
   * This function assigns the local state of the JSON text, outside the React
   * state, since this does not nesseceraly trigger an update.
   *
   * This is useful in order to have the latest available metainformation when
   * the user changes the text (on the `handleChange` handler), but we don't
   * want to re-do the processing when this will eventually trigger an update
   * to the `value` property with the same data.
   *
   * @param {String} jsonText - The JSON buffer to extract metadata from
   */
  updateLocalJsonState(jsonText) {
    // Do not perform heavyweight calculations, such as `getObjectInformation`
    // if the json text hasn't really changed.
    if (this.jsonText === jsonText) {
      return;
    }

    // Reset some properties
    this.jsonText = jsonText;
    this.jsonError = null;

    // Try to parse and extract metadata
    try {
      this.jsonValue = JSON.parse(jsonText);
      this.jsonMeta = JSONUtil.getObjectInformation(jsonText);
    } catch (e) {
      // Prettify the error message by resolving the line/column instead of
      // just keeping the offset in the string
      let errorStr = e.toString();
      this.jsonError = errorStr.replace(/at position (\d+)/g,
        (match, offset) => {
          let cursor = JSONEditorUtil.cursorFromOffset(
            parseInt(offset),
            jsonText
          );

          return `at line ${cursor.row}:${cursor.column}`;
        }
      );
    }

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
      let errorMsg = this.jsonError.replace(/at line ([\d:]+)/g, (m, line) => {
        errorLine = parseInt(line.split(':')[0]);

        return '';
      });

      // Return error marker
      return [{
        row: errorLine,
        text: errorMsg,
        type: 'error'
      }];
    }

    // Append annotation markers from external errors
    return this.externalErrors.reduce((memo, error) => {
      let errorPath = error.path.join('.');
      let token = this.jsonMeta.find(function (token) {
        return token.path.join('.') === errorPath;
      });

      // Root errors go to line 0
      if (errorPath === '') {
        memo.push({
          row: 0,
          text: error.message,
          type: 'error'
        });
        return memo;
      }

      // Errors with invalid path also go to root, but gets
      // prefixed with their path
      if (!token) {
        memo.push({
          row: 0,
          text: `${errorPath}: ${error.message}`,
          type: 'error'
        });
        return memo;
      }

      // Otherwise errors get to the appropriate line
      memo.push({
        row: token.line - 1,
        text: error.message,
        type: 'error'
      });

      return memo;
    }, []);
  }

  /**
   * @override
   */
  render() {
    let {width, height, editorProps} = this.props;
    let {initialText} = this.state;

    let omitKeys = [].concat(Object.keys(JSONEditor.propTypes), 'mode');

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
        value={initialText} />
    );
  }
};

JSONEditor.defaultProps = {
  errors: [],
  editorProps: {$blockScrolling: Infinity},
  height: '100%',
  onBlur() {},
  onChange() {},
  onErrorStateChange() {},
  onFocus() {},
  onPropertyChange() {},
  value: {},
  width: '100%'
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
