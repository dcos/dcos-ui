import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class PodsTabContent extends React.Component {

  render() {

    let codeBlockPod =
`<div class="pod">
  …
</div>`;
    let codeBlockPodOptionsSizeModifiers =
`<div class="pod pod-short pod-wider">
  …
</div>`;
    let codeBlockPodOptionsDirectionModifiers =
`<div class="pod pod-short-top pod-taller-bottom pod-wide-left pod-narrower-right">
  …
</div>`;

    return (

      <div>

        <section id="pods-overview">

          <p className="lead">

            Pods are simple and convient way to adding space around your content.  With provided classes, you can quickly define layout rules that fit the requirements of your project.

          </p>

          <p>

            Use the class <code>.pod</code> to apply vertical and horizontal margin to any component. By default, margin is applied evenly to all sides of the pod. However, with the provided classes you can override this to behave differently &mdash; taller, shorter, narower, wider, or no padding at all.

          </p>

          <div className="panel">

            <div className="panel-cell">

              <div className="layout-box pods-overview">
                <div className="layout-box-item layout-box-item-margin pod">
                  <div className="layout-box-item layout-box-item-padding">
                    <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockPod}

              </pre>

            </div>

          </div>

        </section>

        <section id="pods-options">

          <h2>

            Pod Options

          </h2>

          <p>

            By default, margin is applied evenly to sides of the pod (top, bottom, left, right).  You can easily adjust this behavior by adding a size modifier to the base <code>.pod</code>class. For example <code>.pod-short</code> will decrease the margin and <code>.pod-tall</code> will increase the margin. Furthermore, if you are seeking to change the margin in only a single direction, you can add an additional direction modifier. For example, <code>.pod-tall-top</code> increase the margin above the pod.

          </p>

          <section id="pods-options-size-modifier">

            <h3>

              Size Modifiers

            </h3>

            <p>

              To adjust padding size apply one of the available pod-specific size classes.  For example, simply using the class <code>.pod-short</code> will reduce padding evenly above and below the pod.

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

                      .pod-flush

                    </code>

                  </td>

                  <td>

                    Remove the margins entirely.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .pod-shorter

                    </code>

                  </td>

                  <td>

                    Reduce the vertical margins to 25%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .pod-short

                    </code>

                  </td>

                  <td>

                    Reduce the vertical margins to 50%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .pod-tall

                    </code>

                  </td>

                  <td>

                    Increase the vertical margins by 150%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .pod-taller

                    </code>

                  </td>

                  <td>

                    Increase the vertical margins by 200%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .pod-narrower

                    </code>

                  </td>

                  <td>

                    Reduce the horizontal margins to 25%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .pod-narrow

                    </code>

                  </td>

                  <td>

                    Reduce the horizontal margins to 50%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .pod-wide

                    </code>

                  </td>

                  <td>

                    Increase the horizontal margins by 150%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .pod-wider

                    </code>

                  </td>

                  <td>

                    Increase the horizontal margins by 200%.

                  </td>

                </tr>

              </tbody>

            </table>

            <div className="panel">

              <div className="panel-cell">

                <div className="layout-box pods-options-size-modifier">
                  <div className="layout-box-item layout-box-item-margin pod pod-short pod-wider">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockPodOptionsSizeModifiers}

                </pre>

              </div>

            </div>

          </section>

          <section id="pods-options-size-direction-modifier">

            <h3>

              Size Direction Modifiers

            </h3>

            <p>

              Add <code>-top</code>, <code>-right</code>, <code>-bottom</code>, or <code>-left</code> to the end of the size modifier class to adjust margin only in the direction implied by the direction modifier.

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

                      .pod-*-top

                    </code>

                  </td>

                  <td>

                    Adjust margin above the pod.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .pod-*-right

                    </code>

                  </td>

                  <td>

                    Adjust margin to the right of the pod.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .pod-*-bottom

                    </code>

                  </td>

                  <td>

                    Adjust margin below the pod.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .pod-*-left

                    </code>

                  </td>

                  <td>

                    Adjust margin to the left of the pod.

                  </td>

                </tr>

              </tbody>

            </table>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <div className="layout-box pods-options-size-direction-modifier">
                  <div className="layout-box-item layout-box-item-margin pod pod-short-top pod-taller-bottom pod-wide-left pod-narrower-right">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockPodOptionsDirectionModifiers}

                </pre>

              </div>

            </div>

          </section>

        </section>

      </div>

    );

  }
}

PodsTabContent.contextTypes = {
  router: routerShape
};

PodsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = PodsTabContent;
