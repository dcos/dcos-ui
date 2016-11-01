import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class GridTabContent extends React.Component {

  render() {

    let codeBlockGrid =
`<div class="row">
  <div class="column-*">
  </div>
  …
</div>`;

    return (

      <div>

        <p className="lead">

          Canvas supports a responsive mobile-first grid system.  By default, the grid system is based on a 12 column layout, but can be easily modified to enable any column count.  With simple class name additions, the column count can be changed based on the users viewport.  This allows for rich layouts that adjust to best fit the device.

        </p>

        <div className="panel pod pod-short flush-top flush-horizontal">

          <div className="panel-cell">

            <div className="row">
              <div className="column-1">
                <div className="layout-box">
                  <div className="layout-box-item layout-box-item-margin">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column-1">
                <div className="layout-box">
                  <div className="layout-box-item layout-box-item-margin">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column-1">
                <div className="layout-box">
                  <div className="layout-box-item layout-box-item-margin">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column-1">
                <div className="layout-box">
                  <div className="layout-box-item layout-box-item-margin">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column-1">
                <div className="layout-box">
                  <div className="layout-box-item layout-box-item-margin">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column-1">
                <div className="layout-box">
                  <div className="layout-box-item layout-box-item-margin">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column-1">
                <div className="layout-box">
                  <div className="layout-box-item layout-box-item-margin">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column-1">
                <div className="layout-box">
                  <div className="layout-box-item layout-box-item-margin">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column-1">
                <div className="layout-box">
                  <div className="layout-box-item layout-box-item-margin">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column-1">
                <div className="layout-box">
                  <div className="layout-box-item layout-box-item-margin">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column-1">
                <div className="layout-box">
                  <div className="layout-box-item layout-box-item-margin">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column-1">
                <div className="layout-box">
                  <div className="layout-box-item layout-box-item-margin">
                    <div className="layout-box-item layout-box-item-padding">
                      <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="panel-cell panel-cell-light panel-cell-code-block">

            <pre className="prettyprint transparent flush lang-html">

              {codeBlockGrid}

            </pre>

          </div>

        </div>

        <p>

          At first, the grid can seem complicated.  However, when you distill it down to the basic primitives and rules, it becomes quite simple.  Here's a quick overview of what you need to know:

        </p>

        <ul>

          <li>

            There are two primitives that are required in defining a grid: Rows (<code>.row</code>) and Columns (<code>.column-*</code>).

          </li>

          <li>

            Rows (<code>.row</code>) is a simple wrapping element around columns.  They ensure columns are aligned appropriately.

          </li>

          <li>

            Content should be placed within columns, and only columns may be immediate children of rows.

          </li>

          <li>

            Column classes indicate the number of columns you’d like to use out of the possible <em>n</em> per row (<code>default=12</code>). So, for a 12 column grid, <code>.column-4</code> will consumer the total with of 4 columns.

          </li>

          <li>

            Column widths are set in percentages, so they’re always fluid and sized relative to their parent element.

          </li>

          <li>

            Columns have horizontal padding to create the gutters between individual columns. Gutter width is defined as a fixed pixel width.

          </li>

          <li>

            There are five grid tiers, one for each responsive breakpoint: <code>mini</code> (assumed mobile devices), <code>small</code>, <code>medium</code>, <code>large</code>, and <code>jumbo</code>.

          </li>

          <li>

            Grid tiers are based on minimum widths, meaning they apply to that one tier and all those above it (e.g., <code>.column-large-4</code> applies to medium, and large devices, but not small or smaller devices).

          </li>

        </ul>

        <section id="grid-options">

          <h2>

            Grid Options

          </h2>

          <p>

            The column width and position can change based on both screen resolution and class name.  The column count and gutter width are easily modified using Canvas variables.  The grid itself is size independent, the grid column width is defined based on the element wrapping the row.  The only constant size in a grid is the gutter width &mdash; which itself varies based on the width of the viewport.

          </p>

          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th></th>
                <th className="text-align-center">
                  Mini<br/>
                  <small>Portrait phones (&lt; 480px)</small>
                </th>
                <th className="text-align-center">
                  Small<br/>
                  <small>Landscape phones (≥ 480px)</small>
                </th>
                <th className="text-align-center">
                  Medium<br/>
                  <small>Tablets (≥ 768px)</small>
                </th>
                <th className="text-align-center">
                  Large<br/>
                  <small>Desktops (≥ 992px)</small>
                </th>
                <th className="text-align-center">
                  Jumbo<br/>
                  <small>Desktops (≥ 1400px)</small>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="text-nowrap" scope="row">Grid behavior</th>
                <td>Horizontal at all times</td>
                <td colSpan="4">Collapsed to start, horizontal above breakpoints</td>
              </tr>
              <tr>
                <th className="text-nowrap" scope="row">Class prefix</th>
                <td><code>.column-</code></td>
                <td><code>.column-small-</code></td>
                <td><code>.column-medium-</code></td>
                <td><code>.column-large-</code></td>
                <td><code>.column-jumbo-</code></td>
              </tr>
              <tr>
                <th className="text-nowrap" scope="row"># of columns</th>
                <td colSpan="5">12 (default)</td>
              </tr>
              <tr>
                <th className="text-nowrap" scope="row">Gutter width</th>
                <td>12px</td>
                <td>12px</td>
                <td>24px</td>
                <td>32px</td>
                <td>36px</td>
              </tr>
              <tr>
                <th className="text-nowrap" scope="row">Nestable</th>
                <td colSpan="5">Yes</td>
              </tr>
              <tr>
                <th className="text-nowrap" scope="row">Offsets</th>
                <td colSpan="5">Yes</td>
              </tr>
              <tr>
                <th className="text-nowrap" scope="row">Column ordering</th>
                <td colSpan="5">Yes</td>
              </tr>
            </tbody>
          </table>

        </section>

      </div>

    );

  }
}

GridTabContent.contextTypes = {
  router: routerShape
};

GridTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = GridTabContent;
