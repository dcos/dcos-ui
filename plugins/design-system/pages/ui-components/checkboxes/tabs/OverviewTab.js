import React, { Component } from "react";
import Do from "../../../../components/do-dont/Do";
import Dont from "../../../../components/do-dont/Dont";
import DoDontPanel from "../../../../components/do-dont/DoDontPanel";

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
        <div className="panel">
          <div className="panel-cell text-align-center">
            <div className="button-collection">
              <button className="button button-primary" type="button">
                Primary Button
              </button>
              <button className="button" type="button">Default Button</button>
              <button className="button" type="button" disabled>
                Primary Button
              </button>
              <button className="button button-primary-link" type="button">
                Link Button
              </button>
              <button className="button button-danger" type="button">
                Danger Button
              </button>
            </div>
          </div>
        </div>
        <h2>Guidelines</h2>
        <table className="table">
          <thead>
            <tr>
              <th width="20%">Button Type</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Primary</th>
              <td>
                Primary call to action button. Should stand out above all other actions. Examples include Save, Deploy.
              </td>
            </tr>
            <tr>
              <th>Secondary</th>
              <td />
            </tr>
            <tr>
              <th>Text</th>
              <td />
            </tr>
            <tr>
              <th>Danger</th>
              <td />
            </tr>
            <tr>
              <th>Button with icon</th>
              <td />
            </tr>
            <tr>
              <th>Icon only button</th>
              <td />
            </tr>
            <tr>
              <th>Set of buttons</th>
              <td />
            </tr>
            <tr>
              <th>Disabled button</th>
              <td />
            </tr>
            <tr>
              <th>Small button</th>
              <td />
            </tr>
          </tbody>
        </table>
        <h2>Best Practices</h2>
        <DoDontPanel>
          <Do
            description={`Here is some content.
            Here is some content.
            Here is some content.
            Here is some content.
            Here is some content.
            Here is some content.`}
          >
            <button className="button button-primary" type="button">
              Primary Button
            </button>
          </Do>
          <p>
            Here we have extra content.
            Here we have extra content.
            Here we have extra content.
            Here we have extra content.
            Here we have extra content.
            Here we have extra content.
          </p>
        </DoDontPanel>
        <DoDontPanel>
          <p>
            Here we have extra content.
            Here we have extra content.
            Here we have extra content.
            Here we have extra content.
            Here we have extra content.
            Here we have extra content.
          </p>
          <Dont description="Hello">
            <button className="button button-primary" type="button">
              Primary Button
            </button>
          </Dont>
        </DoDontPanel>
        <DoDontPanel>
          <Do description="Yes">
            <button className="button button-primary" type="button">
              Primary Button
            </button>
          </Do>
          <Dont description="Hello">
            <button className="button button-primary" type="button">
              Primary Button
            </button>
          </Dont>
        </DoDontPanel>
        <DoDontPanel>
          <Do description="Yes">
            <button className="button button-primary" type="button">
              Primary Button
            </button>
          </Do>
        </DoDontPanel>
        <p>
          Here we have some content.
          Here we have some content.
          Here we have some content.
          Here we have some content.
          Here we have some content.
          Here we have some content.
        </p>
      </div>
    );
  }
}

module.exports = OverviewTab;
