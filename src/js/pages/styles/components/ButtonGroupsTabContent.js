import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class ButtonGroupsTabContent extends React.Component {

  render() {

    let codeBlockButtonGroup =
`<div class="button-group" role="group">
  <button type="button" class="button button-default">
    Left
  </button>
  <button type="button" class="button button-default">
    Middle
  </button>
  <button type="button" class="button button-default">
    Right
  </button>
</div>`;
    let codeBlockButtonGroupOutline =
`<div class="button-group" role="group">
  <button type="button" class="button button-outline active">
    Left
  </button>
  <button type="button" class="button button-outline">
    Middle
  </button>
  <button type="button" class="button button-outline">
    Right
  </button>
</div>`;
    let codeBlockButtonGroupRounded =
`<div class="button-group" role="group">
  <button type="button" class="button button-rounded active">
    Left
  </button>
  <button type="button" class="button button-rounded">
    Middle
  </button>
  <button type="button" class="button button-rounded">
    Right
  </button>
</div>`;
    let codeBlockButtonGroupCombined =
`<div class="button-group" role="group">
  <button type="button" class="button button-outline button-rounded active">
    Left
  </button>
  <button type="button" class="button button-outline button-rounded">
    Middle
  </button>
  <button type="button" class="button button-outline button-rounded">
    Right
  </button>
</div>`;
    let codeBlockButtonGroupInverse =
`<div class="button-group" role="group">
  <button type="button" class="button button-outline button-inverse">
    Left
  </button>
  <button type="button" class="button button-outline button-inverse">
    Middle
  </button>
  <button type="button" class="button button-outline button-inverse">
    Right
  </button>
</div>`;

    return (

      <div>

        <p>

          Group a series of buttons together on a single line with the button group. Add on optional JavaScript radio and checkbox style behavior with our buttons plugin.

        </p>

        <div className="panel flush-bottom">

          <div className="panel-cell">

            <div className="button-collection">

              <div className="button-group" role="group">

                <button type="button" className="button active">

                  Left

                </button>

                <button type="button" className="button">

                  Middle

                </button>

                <button type="button" className="button">

                  Right

                </button>

              </div>

            </div>

            <div className="button-collection">

              <div className="button-group" role="group">

                <button type="button" className="button button-primary active">

                  Left

                </button>

                <button type="button" className="button button-primary">

                  Middle

                </button>

                <button type="button" className="button button-primary">

                  Right

                </button>

              </div>

            </div>

            <div className="button-collection">

              <div className="button-group" role="group">

                <button type="button" className="button button-success active">

                  Left

                </button>

                <button type="button" className="button button-success">

                  Middle

                </button>

                <button type="button" className="button button-success">

                  Right

                </button>

              </div>

            </div>

            <div className="button-collection">

              <div className="button-group" role="group">

                <button type="button" className="button button-warning active">

                  Left

                </button>

                <button type="button" className="button button-warning">

                  Middle

                </button>

                <button type="button" className="button button-warning">

                  Right

                </button>

              </div>

            </div>

            <div className="button-collection flush-bottom">

              <div className="button-group" role="group">

                <button type="button" className="button button-danger active">

                  Left

                </button>

                <button type="button" className="button button-danger">

                  Middle

                </button>

                <button type="button" className="button button-danger">

                  Right

                </button>

              </div>

            </div>

          </div>

          <div className="panel-cell panel-cell-light panel-cell-code-block">

            <pre className="prettyprint transparent flush lang-html">

              {codeBlockButtonGroup}

            </pre>

          </div>

        </div>

        <section id="button-group-styles">

          <h2>

            Styled Button Groups

          </h2>

          <p>

            Button groups work with all supported button styles.  Add <code>.button-*-outline</code> or any other included button style class to your button element.  You can even combine styles.

          </p>

          <h3>

            Outlined Button Groups

          </h3>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="button-collection">

                <div className="button-group" role="group">

                  <button type="button" className="button button-outline active">

                    Left

                  </button>

                  <button type="button" className="button button-outline">

                    Middle

                  </button>

                  <button type="button" className="button button-outline">

                    Right

                  </button>

                </div>

              </div>

              <div className="button-collection">

                <div className="button-group" role="group">

                  <button type="button" className="button button-primary-outline active">

                    Left

                  </button>

                  <button type="button" className="button button-primary-outline">

                    Middle

                  </button>

                  <button type="button" className="button button-primary-outline">

                    Right

                  </button>

                </div>

              </div>

              <div className="button-collection">

                <div className="button-group" role="group">

                  <button type="button" className="button button-success-outline active">

                    Left

                  </button>

                  <button type="button" className="button button-success-outline">

                    Middle

                  </button>

                  <button type="button" className="button button-success-outline">

                    Right

                  </button>

                </div>

              </div>

              <div className="button-collection">

                <div className="button-group" role="group">

                  <button type="button" className="button button-warning-outline active">

                    Left

                  </button>

                  <button type="button" className="button button-warning-outline">

                    Middle

                  </button>

                  <button type="button" className="button button-warning-outline">

                    Right

                  </button>

                </div>

              </div>

              <div className="button-collection flush-bottom">

                <div className="button-group" role="group">

                  <button type="button" className="button button-danger-outline active">

                    Left

                  </button>

                  <button type="button" className="button button-danger-outline">

                    Middle

                  </button>

                  <button type="button" className="button button-danger-outline">

                    Right

                  </button>

                </div>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockButtonGroupOutline}

              </pre>

            </div>

          </div>

          <h3>

            Rounded Button Groups

          </h3>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="button-group" role="group">

                <button type="button" className="button button-rounded active">

                  Left

                </button>

                <button type="button" className="button button-rounded">

                  Middle

                </button>

                <button type="button" className="button button-rounded">

                  Right

                </button>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockButtonGroupRounded}

              </pre>

            </div>

          </div>

          <h3>

            Combined Style Button Groups

          </h3>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="button-group" role="group">

                <button type="button" className="button button-outline button-rounded active">

                  Left

                </button>

                <button type="button" className="button button-outline button-rounded">

                  Middle

                </button>

                <button type="button" className="button button-outline button-rounded">

                  Right

                </button>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockButtonGroupCombined}

              </pre>

            </div>

          </div>

          <h3>

            Inverse Styling

          </h3>

          <div className="panel panel-inverse flush-bottom">

            <div className="panel-cell panel-cell-inverse">

              <div className="button-collection">

                <div className="button-group" role="group">

                  <button type="button" className="button button-outline button-inverse active">

                    Left

                  </button>

                  <button type="button" className="button button-outline button-inverse">

                    Middle

                  </button>

                  <button type="button" className="button button-outline button-inverse">

                    Right

                  </button>

                </div>

              </div>

              <div className="button-collection">

                <div className="button-group" role="group">

                  <button type="button" className="button button-primary-outline button-inverse active">

                    Left

                  </button>

                  <button type="button" className="button button-primary-outline button-inverse">

                    Middle

                  </button>

                  <button type="button" className="button button-primary-outline button-inverse">

                    Right

                  </button>

                </div>

              </div>

              <div className="button-collection">

                <div className="button-group" role="group">

                  <button type="button" className="button button-success-outline button-inverse active">

                    Left

                  </button>

                  <button type="button" className="button button-success-outline button-inverse">

                    Middle

                  </button>

                  <button type="button" className="button button-success-outline button-inverse">

                    Right

                  </button>

                </div>

              </div>

              <div className="button-collection">

                <div className="button-group" role="group">

                  <button type="button" className="button button-warning-outline button-inverse active">

                    Left

                  </button>

                  <button type="button" className="button button-warning-outline button-inverse">

                    Middle

                  </button>

                  <button type="button" className="button button-warning-outline button-inverse">

                    Right

                  </button>

                </div>

              </div>

              <div className="button-collection flush-bottom">

                <div className="button-group" role="group">

                  <button type="button" className="button button-danger-outline button-inverse active">

                    Left

                  </button>

                  <button type="button" className="button button-danger-outline button-inverse">

                    Middle

                  </button>

                  <button type="button" className="button button-danger-outline button-inverse">

                    Right

                  </button>

                </div>

              </div>

            </div>

            <div className="panel-cell panel-cell-dark panel-cell-inverse panel-cell-code-block">

              <pre className="prettyprint code-block-inverse transparent flush lang-html">

                {codeBlockButtonGroupInverse}

              </pre>

            </div>

          </div>

        </section>

      </div>

    );

  }
}

ButtonGroupsTabContent.contextTypes = {
  router: routerShape
};

ButtonGroupsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ButtonGroupsTabContent;
