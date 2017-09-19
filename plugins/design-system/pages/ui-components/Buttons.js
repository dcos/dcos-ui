import React, { Component } from "react";
import { Tooltip } from "reactjs-components";

import ComponentPage from "../ComponentPage";
import imageButtonTooltip from "../../img/button-tooltip.gif";

class Buttons extends Component {
  render() {
    const { title, pathName } = this.props.route.options;

    return (
      <ComponentPage title={title} pathName={pathName}>
        <div className="container">
          <p className="lead">
            Buttons are used primarily on action items. Some examples include Add, Save, Delete, Deploy.
          </p>
          <p>
            Buttons make it obvious to the user that they can take an action. Do not use
            {" "}
            <code>&lt;button&gt;</code>
            {" "}
            as navigational elements. Instead, use
            {" "}
            <code>&lt;a&gt;</code>
            {" "}
            because it takes the user to a new page and is not associated with an action. Each page will likely have one primary button. Any remaining calls-to-action are represented as default buttons.
          </p>
          <h2>Guidelines</h2>
          <h3>Button States</h3>
          <p>States help visually distinguish one button from another.</p>
          <table className="table">
            <thead>
              <tr>
                <th width="20%">State</th>
                <th>Purpose</th>
                <th width="20%">Preview</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Default</th>
                <td>
                  Most buttons on a page are likely default.
                </td>
                <td>
                  <button className="button" type="button">
                    Default
                  </button>
                </td>
              </tr>
              <tr>
                <th>Primary</th>
                <td>
                  Primary call to action button. Should stand out above all other actions. Examples include Save, Deploy.
                </td>
                <td>
                  <button className="button button-primary" type="button">
                    Primary
                  </button>
                </td>
              </tr>
              <tr>
                <th>Destructive</th>
                <td>
                  Destructive buttons are used to highlight something dangerous that can't be undone e.g. "Delete".
                </td>
                <td>
                  <button className="button button-danger" type="button">
                    Destructive
                  </button>
                </td>
              </tr>
              <tr>
                <th>Disabled</th>
                <td>
                  Disable a button when the action is not applicable but we want to show the user that it may be possible. Disabled buttons often have a tooltip.
                </td>
                <td>
                  <Tooltip content="test">
                    <button
                      className="button button-disabled"
                      type="button"
                      disabled
                    >
                      Disabled
                    </button>
                  </Tooltip>
                </td>
              </tr>
            </tbody>
          </table>
          <h3>Button Types</h3>
          <p>
            Different button types are available depending on the use case and placement.
          </p>
          <table className="table">
            <thead>
              <tr>
                <th width="20%">Type</th>
                <th>Purpose</th>
                <th width="20%">Preview</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Filled</th>
                <td>
                  Buttons are filled by default.{" "}
                </td>
                <td>
                  <button className="button" type="button">
                    Filled
                  </button>
                </td>
              </tr>
              <tr>
                <th>Outline</th>
                <td>
                  An outlined may be applicable next to a filled button if we don't want it to draw as much attention, but visually want to align the buttons.
                </td>
                <td>
                  <button className="button button-outline" type="button">
                    Outline
                  </button>
                </td>
              </tr>
              <tr>
                <th>Link</th>
                <td>
                  Link buttons are available to use if we want the action to not stand out as much e.g. "Cancel", or used when we want icons only.
                </td>
                <td>
                  <button className="button button-link" type="button">
                    Link
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <h3>Button Sizes</h3>
          <p>
            By default, buttons display at a standard size, comparable to that of an input field. One additional size is available: small.
          </p>
          <table className="table">
            <thead>
              <tr>
                <th width="20%">Size</th>
                <th>Purpose</th>
                <th width="20%">Preview</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Default</th>
                <td>
                  Standard button size.
                </td>
                <td>
                  <button className="button" type="button">
                    Default
                  </button>
                </td>
              </tr>
              <tr>
                <th>Small</th>
                <td>
                  Use when in confined spaces.
                </td>
                <td>
                  <button className="button button-small" type="button">
                    Small
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <h3>Button with Icons</h3>
          <table className="table">
            <thead>
              <tr>
                <th width="20%">Style</th>
                <th>Purpose</th>
                <th width="20%">Preview</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Icon Only</th>
                <td>
                  Use when an icon is enough to represent the action e.g. "Create a Service". Should be accompanied by a tooltip.
                </td>
                <td>
                  <button className="button button-link" type="button">
                    <svg className="icon icon-mini">
                      <use xlinkHref="#icon-system--plus" />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr>
                <th>Icon with Label</th>
                <td>
                  If there is space and we feel an icon by itself is not obvious enough e.g. "Kill Task".
                </td>
                <td>
                  <button className="button button-primary" type="button">
                    <svg className="icon icon-mini">
                      <use xlinkHref="#icon-system--plus" />
                    </svg> Action
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <h2>Usage Examples</h2>
          <div className="panel">
            <div className="panel-cell">
              <div className="row">
                <div className="column-6">
                  <p className="ds-do">Do</p>
                  <p>Use descriptive action verbs.</p>
                  <button className="button button-primary" type="button">
                    Deploy service
                  </button>
                </div>
                <div className="column-6">
                  <p className="ds-dont">Don't</p>
                  <p>Use ambiguous labels.</p>
                  <button className="button button-primary" type="button">
                    OK
                  </button>
                </div>
              </div>
            </div>
            <div className="panel-cell">
              <div className="row">
                <div className="column-6">
                  <p className="ds-do">Do</p>
                  <p>Prioritize important actions.</p>
                  <div className="button-collection">
                    <button className="button button-outline" type="button">
                      Cancel
                    </button>
                    <button className="button button-primary" type="button">
                      Save changes
                    </button>
                  </div>
                </div>
                <div className="column-6">
                  <p className="ds-dont">Don't</p>
                  <p>Have two primary CTAs next to each other.</p>
                  <div className="button-collection">
                    <button className="button button-primary" type="button">
                      Cancel
                    </button>
                    <button className="button button-primary" type="button">
                      Save changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h2>Content</h2>
          <p>
            Button labels tell users what will happen when they click the button. Use verbs that describe the action. Acceptable labels include:
          </p>
          <ul>
            <li>Create $object</li>
            <li>Edit $object</li>
            <li>Save $object</li>
            <li>Delete $object</li>
            <li>Deploy, Scale, Restart</li>
          </ul>
          <p>
            Use sentence-style capitalization (only the first word in a phrase and any proper nouns capitalized) and no more than three words for button labels.
          </p>
          <p>
            For Sets of Buttons, use specific labels, such as Save or Cancel, instead of using Yes and No. This is particularly helpful when the user is confirming an action.
          </p>
          <h2>Feedback</h2>
          <p>Buttons should have hover, active, focus states by default.</p>
          <p>
            When a user interacts with a button, either via click or tap, and an action is being completed, e.g. an API call, the button should change to disabled and provide feedback via the label to the user that it received the interaction and is busy performing the action.
          </p>
          <p>
            <button className="button button-primary" type="button" disabled>
              Saving changes…
            </button>
          </p>
          <h2>Tooltips</h2>
          <p>
            Buttons may or may not require tooltips to help communicate their intent.
          </p>
          <p>
            Icon buttons that do not have labels should always have a tooltip so the user knows what will happen when they click it.
          </p>
          <p>
            Disabled buttons should always have a tooltip to explain why it is disabled so the user is aware.
          </p>
          <img src={imageButtonTooltip} width="150" />
          <p className="lead">
            Buttons express what action will occur when the user clicks or touches it. Buttons are used to initialize an action, either in the background or foreground of an experience.
          </p>
          <h2>Default Button</h2>
          <div className="panel">
            <div className="panel-cell">
              <div className="button-collection">
                <button className="button" type="button">
                  Default Button
                </button>
                <button className="button" type="button" disabled>
                  Default Button
                </button>
                <button className="button" type="button">
                  <svg className="icon icon-mini">
                    <use xlinkHref="#icon-system--plus" />
                  </svg>
                  Default
                </button>
                <button className="button button-small" type="button">
                  Default
                </button>
                <button className="button" type="button">
                  <svg className="icon icon-mini">
                    <use xlinkHref="#icon-system--plus" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="panel-cell flush-top flush-bottom flush-left flush-right">
              <pre className="flush-bottom">
                &lt;button className="button" type="button"&gt;
                Default Button
                &lt;/button&gt;<br />
                &lt;button className="button" type="button" disabled&gt;
                Default Button
                &lt;/button&gt;<br />
                &lt;button className="button" type="button"&gt;
                &lt;svg className="icon icon-mini"&gt;
                &lt;use xlinkHref="#icon-system--plus"&gt;&lt;/use&gt;
                &lt;/svg&gt;
                Default
                &lt;/button&gt;<br />
                &lt;button className="button button-small" type="button"&gt;
                Default
                &lt;/button&gt;<br />
                &lt;button className="button" type="button"&gt;
                &lt;svg className="icon icon-mini"&gt;
                &lt;use xlinkHref="#icon-system--plus"&gt;&lt;/use&gt;
                &lt;/svg&gt;
                &lt;/button&gt;<br />
              </pre>
            </div>
          </div>
          <h2>Primary Button</h2>
          <div className="panel">
            <div className="panel-cell">
              <div className="button-collection">
                <button className="button button-primary" type="button">
                  Primary Button
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  disabled
                >
                  Primary Button
                </button>
                <button className="button button-primary" type="button">
                  <svg className="icon icon-mini">
                    <use xlinkHref="#icon-system--plus" />
                  </svg>
                  Primary
                </button>
                <button
                  className="button button-primary button-small"
                  type="button"
                >
                  Primary
                </button>
                <button className="button button-primary" type="button">
                  <svg className="icon icon-mini">
                    <use xlinkHref="#icon-system--plus" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="panel-cell flush-top flush-bottom flush-left flush-right">
              <pre className="flush-bottom">
                &lt;button className="button button-primary" type="button"&gt;
                Primary Button
                &lt;/button&gt;<br />
                &lt;button className="button button-primary" type="button" disabled&gt;
                Primary Button
                &lt;/button&gt;<br />
                &lt;button className="button button-primary" type="button"&gt;
                &lt;svg className="icon icon-mini"&gt;
                &lt;use xlinkHref="#icon-system--plus"&gt;&lt;/use&gt;
                &lt;/svg&gt;
                Primary
                &lt;/button&gt;<br />
                &lt;button className="button button-primary button-small" type="button"&gt;
                Primary
                &lt;/button&gt;<br />
                &lt;button className="button button-primary" type="button"&gt;
                &lt;svg className="icon icon-mini"&gt;
                &lt;use xlinkHref="#icon-system--plus"&gt;&lt;/use&gt;
                &lt;/svg&gt;
                &lt;/button&gt;<br />
              </pre>
            </div>
          </div>
          <h2>Modifiers</h2>
          <p>Use these modifiers with <code>.button</code> class.</p>
          <table className="table">
            <thead>
              <tr>
                <th width="40%">Selector</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>.button-primary</td>
                <td>
                  Apply primary button styles.
                </td>
              </tr>
              <tr>
                <td>.button-danger</td>
                <td>
                  Apply destructive button styles.
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            Ideally we don't hard code values here otherwise they will be out of date very quickly.
          </p>
          <p>
            Documenting how we do hover/active/focus styles and colors would be useful.
          </p>
          <h2>Color</h2>
          <h2>Type</h2>
          <h2>Spacing</h2>
        </div>
      </ComponentPage>
    );
  }
}

module.exports = Buttons;
