import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class DividersTabContent extends React.Component {

  render() {

    let codeBlockDivider =
`<!-- Alternatively, use <hr> -->
<div class="divider">
  …
</div>`;
    let codeBlockDividerInverse =
`<div class="divider-inverse">
  …
</div>`;
    let codeBlockDividerLayoutModifier =
`<div class="divider divider-short">
  …
</div>`;
    let codeBlockDividerDirectionModifier =
`<div class="divider divider-short-top divider-taller-bottom">
  …
</div>`;

    return (

      <div>

        <p className="lead">

          Dividers are a simple way to create separation between content.  CNVS includes a simple divider in both a normal and inverse style.

        </p>

        <p>

          Use either the class <code>.divider</code> or go old-school with the <code>&lt;hr&gt;</code> tag to create a divider.  Dividers fill the width of their parent containers.  By default, dividers have space above and below.

        </p>

        <div className="panel">

          <div className="panel-cell">

            <hr/>

          </div>

          <div className="panel-cell panel-cell-light panel-cell-code-block">

            <pre className="prettyprint transparent flush lang-html">

              {codeBlockDivider}

            </pre>

          </div>

        </div>

        <section id="dividers-inverse-styling">

          <h2>

            Inverse Styling

          </h2>

          <p>

            To invert the styling of a divider use the class <code>.divider-inverse</code>.

          </p>

          <div className="panel panel-inverse">

            <div className="panel-cell panel-cell-inverse">

              <hr className="divider-inverse" />

            </div>

            <div className="panel-cell panel-cell-dark panel-cell-inverse panel-cell-code-block">

              <pre className="prettyprint code-block-inverse transparent flush lang-html">

                {codeBlockDividerInverse}

              </pre>

            </div>

          </div>

        </section>

        <section id="dividers-spacing-modifiers">

          <h2>

            Spacing Modifiers

          </h2>

          <p>

            To adjust the margin size apply one of the available divider-specific size classes.  For example, simply using the class <code>.divider-short</code> will reduce margin evenly above and below the divider.

          </p>

          <table className="table short">

            <thead>

              <tr>

                <th>

                  Class

                </th>

                <th>

                  Description

                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td>

                  <code>

                    .divider-flush

                  </code>

                </td>

                <td>

                  Remove the margin in one or both direction entirely.

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .divider-shorter

                  </code>

                </td>

                <td>

                  Reduce the margin in one or both direction to 25%.

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .divider-short

                  </code>

                </td>

                <td>

                  Reduce the margin in one or both direction to 50%.

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .divider-tall

                  </code>

                </td>

                <td>

                  Increase the margin in one or both direction to 150%.

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .divider-taller

                  </code>

                </td>

                <td>

                  Increase the margin in one or both direction to 200%.

                </td>

              </tr>

            </tbody>

          </table>

          <div className="panel">

            <div className="panel-cell">

              <div className="layout-box dividers-spacing-modifiers">
                <div className="layout-box-item layout-box-item-margin divider divider-short">
                  <div className="layout-box-item layout-box-item-padding">
                    <div className="layout-box-item layout-box-item-content">
                      <div className="divider divider-flush">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockDividerLayoutModifier}

              </pre>

            </div>

          </div>

          <section id="dividers-spacing-direction-modifiers">

            <h3>

              Spacing Direction Modifiers

            </h3>

            <p>

              Add <code>-top</code> or <code>-bottom</code> to the end of the size modifier class to adjust padding only in the direction implied by the direction modifier.

            </p>

            <table className="table short">

              <thead>

                <tr>

                  <th>

                    Class

                  </th>

                  <th>

                    Description

                  </th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>

                    <code>

                      .divider-*-top

                    </code>

                  </td>

                  <td>

                    Adjust padding above the divider.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .divider-*-bottom

                    </code>

                  </td>

                  <td>

                    Adjust padding below the divider.

                  </td>

                </tr>

              </tbody>

            </table>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <div className="layout-box dividers-spacing-direction-modifier">
                  <div className="layout-box-item layout-box-item-margin divider divider-short-top divider-taller-bottom">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content">
                        <div className="divider flush">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockDividerDirectionModifier}

                </pre>

              </div>

            </div>

          </section>

        </section>

      </div>

    );

  }
}

DividersTabContent.contextTypes = {
  router: routerShape
};

DividersTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = DividersTabContent;
