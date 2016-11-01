import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class ResponsiveUtilitiesTabContent extends React.Component {

  render() {

    return (

      <div>

        <section id="responsive-utilities">

          <p className="lead">

            Most content and components in CNVS support responsive behavior for scaling either size or spacing.  However, you'll often want to hide and show specific elements of your project based on a given screen resolution.  Similarly, when optimizing your project for printing, you may wish to hide or show components.  Use these useful pre-defined classes to trigger responsive behavior.

          </p>

        </section>

        <section id="responsive-utilities-responsive-options">

          <h2>

            Responsive Options

          </h2>

          <p>

            the <code>.hidden-*</code> class is useful for hiding a given element at a specific screen size.  Replacing the <code>-*</code> modifier witd a screen size value (<code>-mini</code>, <code>-small</code>, <code>-medium</code>, <code>-large</code>, <code>-jumbo</code>) will hide the element at tdat screen-size.  Additionally, appending <code>-up</code> and <code>-down</code> to the <code>.hidden-*-</code> class, will hide a given element up or down respectively at the specified screen-size.

          </p>

          <table className="table">

            <thead>

              <tr>

                <td>

                  Class

                </td>

                <td>

                  Description

                </td>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td>

                  <code>

                    .hidden-*

                  </code>

                </td>

                <td>

                  Hide the element at the screen size specified by the <code>-*</code> modifier.

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .hidden-*-down

                  </code>

                </td>

                <td>

                  Hide the element at and below the screen size specified by the <code>-*</code> modifier.

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .hidden-*-up

                  </code>

                </td>

                <td>

                  Hide the element at and below the screen size specified by the <code>-*</code> modifier.

                </td>

              </tr>

            </tbody>

          </table>

          <h3>

            Available Classes

          </h3>

          <table className="table table-responsive-utilities-classes">
            <thead>
              <tr>
                <th></th>
                <th className="text-align-center">
                  Mini devices<br/>
                  <small>Portrait phones (&lt; 480px)</small>
                </th>
                <th className="text-align-center">
                  Small devices<br/>
                  <small>Landscape phones (≥ 480px)</small>
                </th>
                <th className="text-align-center">
                  Medium devices<br/>
                  <small>Tablets (≥ 768px)</small>
                </th>
                <th className="text-align-center">
                  Large devices<br/>
                  <small>Desktops (≥ 992px)</small>
                </th>
                <th className="text-align-center">
                  Jumbo devices<br/>
                  <small>Desktops (≥ 1400px)</small>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>.hidden-mini-down</code></td>
                <td className="is-hidden">Hidden</td>
                <td className="is-visible">Visible</td>
                <td className="is-visible">Visible</td>
                <td className="is-visible">Visible</td>
                <td className="is-visible">Visible</td>
              </tr>
              <tr>
                <td><code>.hidden-small-down</code></td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-visible">Visible</td>
                <td className="is-visible">Visible</td>
                <td className="is-visible">Visible</td>
              </tr>
              <tr>
                <td><code>.hidden-medium-down</code></td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-visible">Visible</td>
                <td className="is-visible">Visible</td>
              </tr>
              <tr>
                <td><code>.hidden-large-down</code></td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-visible">Visible</td>
              </tr>
              <tr>
                <td><code>.hidden-jumbo-down</code></td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
              </tr>
              <tr>
                <td><code>.hidden-mini-up</code></td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
              </tr>
              <tr>
                <td><code>.hidden-small-up</code></td>
                <td className="is-visible">Visible</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
              </tr>
              <tr>
                <td><code>.hidden-medium-up</code></td>
                <td className="is-visible">Visible</td>
                <td className="is-visible">Visible</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
              </tr>
              <tr>
                <td><code>.hidden-large-up</code></td>
                <td className="is-visible">Visible</td>
                <td className="is-visible">Visible</td>
                <td className="is-visible">Visible</td>
                <td className="is-hidden">Hidden</td>
                <td className="is-hidden">Hidden</td>
              </tr>
              <tr>
                <td><code>.hidden-jumbo-up</code></td>
                <td className="is-visible">Visible</td>
                <td className="is-visible">Visible</td>
                <td className="is-visible">Visible</td>
                <td className="is-visible">Visible</td>
                <td className="is-hidden">Hidden</td>
              </tr>
            </tbody>
          </table>

        </section>

        <section id="responsive-utilities-print-options">

          <h2>

            Print Options

          </h2>

          <p>

            Like the responsive class options, there are similar class options for toggling an elements visibility for print. Use the <code>.visible-print-*</code> option to make and element visible when the page is printed.  The <code>-*</code> modifier is used to specify the display type.  For example, <code>.visible-print-inline</code> displays an element as <code>inline</code> only when printed.

          </p>

          <table className="table table-bordered table-striped responsive-utilitie flush-bottom">
            <thead>
              <tr>
                <th>Class</th>
                <th className="text-align-center">Browser</th>
                <th className="text-align-center">Print</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>.visible-print-block</code></td>
                <td className="is-hidden">Hidden</td>
                <td className="is-visible">Visible</td>
              </tr>
              <tr>
                <td><code>.visible-print-inline</code></td>
                <td className="is-hidden">Hidden</td>
                <td className="is-visible">Visible</td>
              </tr>
              <tr>
                <td><code>.visible-print-inline-block</code></td>
                <td className="is-hidden">Hidden</td>
                <td className="is-visible">Visible</td>
              </tr>
              <tr>
                <td><code>.hidden-print</code></td>
                <td className="is-visible">Visible</td>
                <td className="is-hidden">Hidden</td>
              </tr>
            </tbody>
          </table>

        </section>

      </div>

    );

  }
}

ResponsiveUtilitiesTabContent.contextTypes = {
  router: routerShape
};

ResponsiveUtilitiesTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ResponsiveUtilitiesTabContent;
