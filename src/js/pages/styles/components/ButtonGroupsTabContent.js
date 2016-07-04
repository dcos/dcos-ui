import React from 'react';
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

        <div className="example-block flush-bottom">

          <div className="example-block-content">

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

          <div className="example-block-footer example-block-footer-codeblock">

            <pre className="prettyprint lang-html flush-bottom">

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

          <div className="example-block flush-bottom">

            <div className="example-block-content">

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

            <div className="example-block-footer example-block-footer-codeblock">

              <pre className="prettyprint lang-html flush-bottom">

                {codeBlockButtonGroupOutline}

              </pre>

            </div>

          </div>

          <h3>

            Rounded Button Groups

          </h3>

          <div className="example-block flush-bottom">

            <div className="example-block-content">

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

            <div className="example-block-footer example-block-footer-codeblock">

              <pre className="prettyprint lang-html flush-bottom">

                {codeBlockButtonGroupRounded}

              </pre>

            </div>

          </div>

          <h3>

            Combined Style Button Groups

          </h3>

          <div className="example-block flush-bottom">

            <div className="example-block-content">

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

            <div className="example-block-footer example-block-footer-codeblock">

              <pre className="prettyprint lang-html flush-bottom">

                {codeBlockButtonGroupCombined}

              </pre>

            </div>

          </div>

          <h3>

            Inverse Styling

          </h3>

          <div className="example-block inverse flush-bottom">

            <div className="example-block-content">

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

            <div className="example-block-footer example-block-footer-codeblock">

              <pre className="prettyprint lang-html flush-bottom">

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
  router: React.PropTypes.func
};

ButtonGroupsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ButtonGroupsTabContent;
