import React, { Component } from "react";

class OverviewTab extends Component {
  render() {
    return (
      <div className="container">
        <p className="lead">
          Buttons are used primarily on action items. Some examples include Add, Save, Delete, Deploy.
        </p>
        <p>
          Do not use Buttons as navigational elements. Instead, use Links because it takes the user to a new page and is not associated with an action. Each page will likely have one primary button. Any remaining calls-to-action are represented as default buttons.
        </p>
        <h2>Guidelines</h2>
        <table className="table">
          <thead>
            <tr>
              <th width="20%">Button Type</th>
              <th>Purpose</th>
              <th width="20%">Preview</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Primary</th>
              <td>
                Primary call to action button. Should stand out above all other actions. Examples include Save, Deploy.
              </td>
              <td>
                <button className="button-primary" type="button">
                  Primary
                </button>
              </td>
            </tr>
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
              <th>Link</th>
              <td>
                Link buttons are available to use if we want the action to not stand out as much e.g. "Cancel".
              </td>
              <td>
                <button className="button button-link" type="button">
                  Link
                </button>
              </td>
            </tr>
            <tr>
              <th>Outline</th>
              <td>
                Outline buttons are available to use when ...
              </td>
              <td>
                <button className="button button-outline" type="button">
                  Outline
                </button>
              </td>
            </tr>
            <tr>
              <th>Danger</th>
              <td>
                Danger buttons are used to highlight something destructive e.g. "Delete"
              </td>
              <td>
                <button className="button button-danger" type="button">
                  Danger
                </button>
              </td>
            </tr>
            <tr>
              <th>Disabled button</th>
              <td>
                Disable a button when the action is not applicable but we want to show the user that it may be possible. Disabled buttons should have a tooltip.
              </td>
              <td>
                <button className="button button-disabled" type="button">
                  Disabled
                </button>
              </td>
            </tr>
            <tr>
              <th>Small button</th>
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
        <h2>Labels</h2>
        <p>
          Button labels tell users what will happen when they click the button.
        </p>
        <p>
          Use verbs that describe the action. Acceptable labels include:
        </p>
        <ul>
          <li>Create Object</li>
          <li>Edit Object</li>
          <li>Save Object</li>
          <li>Delete Object</li>
          <li>Deploy, Scale, Restart</li>
        </ul>
        <p>
          Use sentence-style capitalization (only the first word in a phrase and any proper nouns capitalized) and no more than three words for button labels.
        </p>
        <p>
          For Sets of Buttons, use specific labels, such as Save or Cancel, instead of using Yes and No. This is particularly helpful when the user is confirming an action.
        </p>
        <h2>Usage</h2>
        <h2>Attribute Breakdown</h2>
        <h2>Format</h2>
        <h2>Interaction/Behavior</h2>
      </div>
    );
  }
}

module.exports = OverviewTab;
