import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class PanelsTabContent extends React.Component {

  render() {

    let codeBlockPanelsOverview =
`<div class="panel">
…
</div>`;

    let codeBlockPanelCells =
`<div class="panel">
  <div class="panel-cell">
    …
  </div>
  <div class="panel-cell">
    …
  </div>
  <div class="panel-cell">
    …
  </div>
</div>`;

    let codeBlockPanelCellsSizeModifiers =
`<div class="panel">
  <div class="panel-cell">
    …
  </div>
  <div class="panel-cell panel-cell-short">
    …
  </div>
</div>`;

    let codeBlockPanelCellsSizeDirectionModifiers =
`<div class="panel">
  <div class="panel-cell panel-cell-taller-bottom panel-cell-wider-right">
    …
  </div>
</div>`;

    let codeBlockPanelStylingInverse =
`<div class="panel panel-inverse">
  …
</div>`;

    let codeBlockPanelCellStyling =
`<div class="panel">
  <div class="panel-cell panel-cell-borderless panel-cell-short-bottom">
    …
  </div>
  <div class="panel-cell flush-top">
    …
  </div>
  <div class="panel-cell panel-cell-dark panel-cell-short">
    …
  </div>
</div>`;

    return (
      <div>

        <section id="panels-overview">

          <p className="lead">

            A panel is a simple, flexible, and customizable content container. In combination with panel cells, panels can be used to create a wide range of layout and content display options.

          </p>

          <p>

            To create a new panel use the <code>.panel</code> class. By itself, a panel is pretty basic - offering nothing more than box styling and outer spacing.  Use one or more nested panel cells (<code>.panel-cell</code>) to create a layout that fits your specific project requirements.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="row">

                <div className="column-12 column-small-8 column-small-offset-2 column-medium-8 column-medium-offset-2 column-large-6 column-large-offset-3 column-jumbo-4 column-jumbo-offset-4">

                  <div className="panel panel-inline">

                    <div className="panel-cell">

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockPanelsOverview}

              </pre>

            </div>

          </div>

        </section>

        <section id="panels-cells">

          <h2>

            Panel Cell

          </h2>

          <p>

            The panel cell (<code>.panel-cell</code>) is the basic building block of panels. Any number of panel cells can be used in a panel.  Panel cells offer a variety of spacing and styling options.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="panel panel-inline">

                <div className="panel-cell panel-header text-align-center">

                  <code>.panel-cell</code>

                </div>

                <div className="panel-cell panel-body text-align-center">

                  <code>.panel-cell</code>

                </div>

                <div className="panel-cell panel-footer text-align-center">

                  <code>.panel-cell</code>

                </div>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockPanelCells}

              </pre>

            </div>

          </div>

          <section id="panels-cells-size-modifiers">

            <h3>

              Size Modifiers

            </h3>

            <p>

              To adjust the inner padding applied to a panel cell, use one of the available panel-specific size classes. For example, simply using the class <code>.panel-cell-short</code> will reduce padding evenly above and below the panel cell.  Use of these modifiers allows you the ability to create unique panel layouts to meet your specific project needs.

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

                      .panel-cell-shorter

                    </code>

                  </td>

                  <td>

                    Reduce the vertical margins to 25%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .panel-cell-short

                    </code>

                  </td>

                  <td>

                    Reduce the vertical margins to 50%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .panel-cell-tall

                    </code>

                  </td>

                  <td>

                    Increase the vertical margins by 150%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .panel-cell-taller

                    </code>

                  </td>

                  <td>

                    Increase the vertical margins by 200%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .panel-cell-narrower

                    </code>

                  </td>

                  <td>

                    Reduce the horizontal margins to 25%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .panel-cell-narrow

                    </code>

                  </td>

                  <td>

                    Reduce the horizontal margins to 50%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .panel-cell-wide

                    </code>

                  </td>

                  <td>

                    Increase the horizontal margins by 150%.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .panel-cell-wider

                    </code>

                  </td>

                  <td>

                    Increase the horizontal margins by 200%.

                  </td>

                </tr>

              </tbody>

            </table>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <div className="row">

                  <div className="column-12 column-small-6 column-medium-6 column-large-5 column-large-offset-1 column-jumbo-4 column-jumbo-offset-2">

                    <div className="panel">

                      <div className="panel-cell">

                        <h4 className="flush-top">

                          Event Name

                        </h4>

                        <p className="flush-bottom">

                          Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna. Duis mollis, est non commodo luctus.

                        </p>

                      </div>

                      <div className="panel-cell panel-cell-short text-align-center">

                        <button className="button button-primary">

                          Learn More &rarr;

                        </button>

                      </div>

                    </div>

                  </div>

                  <div className="column-12 column-small-6 column-medium-6 column-large-5 column-jumbo-4">

                    <div className="panel">

                      <div className="layout-box pods-options-size-direction-modifier">

                        <div className="layout-box-item layout-box-item-margin">

                          <div className="layout-box-item layout-box-item-padding panel-cell">

                            <div className="layout-box-item layout-box-item-content">

                              <h4 className="flush-top">

                                Event Name

                              </h4>

                              <p className="flush-bottom">

                                Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna. Duis mollis, est non commodo luctus.

                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                      <div className="layout-box pods-options-size-direction-modifier">

                        <div className="layout-box-item layout-box-item-margin">

                          <div className="layout-box-item layout-box-item-padding panel-cell panel-cell-short">

                            <div className="layout-box-item layout-box-item-content text-align-center">

                              <button className="button button-primary">

                                Learn More &rarr;

                              </button>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockPanelCellsSizeModifiers}

                </pre>

              </div>

            </div>

          </section>

          <section id="panels-cells-size-direction-modifiers">

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

                      .panel-cell-*-top

                    </code>

                  </td>

                  <td>

                    Adjust margin above the panel-cell.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .panel-cell-*-right

                    </code>

                  </td>

                  <td>

                    Adjust margin to the right of the panel-cell.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .panel-cell-*-bottom

                    </code>

                  </td>

                  <td>

                    Adjust margin below the panel-cell.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .panel-cell-*-left

                    </code>

                  </td>

                  <td>

                    Adjust margin to the left of the panel-cell.

                  </td>

                </tr>

              </tbody>

            </table>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <div className="row">

                  <div className="column-12 column-small-6 column-medium-6 column-large-5 column-large-offset-1 column-jumbo-4 column-jumbo-offset-2">

                    <div className="panel">

                      <div className="panel-cell panel-cell-taller-bottom panel-cell-wider-right">

                        <h4 className="flush-top">

                          Event Name

                        </h4>

                        <p className="flush-bottom">

                          Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna. Duis mollis, est non commodo luctus.

                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="column-12 column-small-6 column-medium-6 column-large-5 column-jumbo-4">

                    <div className="panel">

                      <div className="layout-box pods-options-size-direction-modifier">

                        <div className="layout-box-item layout-box-item-margin">

                          <div className="layout-box-item layout-box-item-padding panel-cell panel-cell-taller-bottom panel-cell-wider-right">

                            <div className="layout-box-item layout-box-item-content">

                              <h4 className="flush-top">

                                Event Name

                              </h4>

                              <p className="flush-bottom">

                                Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna. Duis mollis, est non commodo luctus.

                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockPanelCellsSizeDirectionModifiers}

                </pre>

              </div>

            </div>

          </section>

        </section>

        <section id="panels-styling">

          <h2>

            Panel Styling

          </h2>

          <p>

            Panel support supplied by CNVS is largely limited to layout, leaving much of the styling preference up to the individual or team utilizing panels in their specific project.  However, we have include some basic styling options to make panels immediately useful out-of-the-box.

          </p>

          <section id="panels-styling-inverse">

            <h3>

              Inverse Panels

            </h3>

            <p>

              Panel support supplied by CNVS is largely limited to layout, leaving much of the styling preference up to the individual or team utilizing panels in their specific project.  However, we have include some basic styling options to make panels immediately useful out-of-the-box.

            </p>

            <div className="panel panel-inverse flush-bottom">

              <div className="panel-cell panel-cell-inverse">

                <div className="row">

                  <div className="column-12 column-small-8 column-small-offset-2 column-medium-8 column-medium-offset-2 column-large-6 column-large-offset-3 column-jumbo-4 column-jumbo-offset-4">

                    <div className="panel panel-inverse">

                      <div className="panel-cell">

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              <div className="panel-cell panel-cell-dark panel-cell-inverse panel-cell-code-block">

                <pre className="prettyprint code-block-inverse transparent flush lang-html">

                  {codeBlockPanelStylingInverse}

                </pre>

              </div>

            </div>

          </section>

          <section id="panels-cells-styling">

            <h3>

              Panel Cell Styling

            </h3>

            <p>

              Panel support supplied by CNVS is largely limited to layout, leaving much of the styling preference up to the individual or team utilizing panels in their specific project.  However, we have include some basic styling options to make panels immediately useful out-of-the-box.

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

                      .panel-cell-borderless

                    </code>

                  </td>

                  <td>

                    Remove all borders from panel cell.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .panel-cell-light

                    </code>

                  </td>

                  <td>

                    Add a light background to panel cell.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .panel-cell-dark

                    </code>

                  </td>

                  <td>

                    Add a dark background to panel cell.

                  </td>

                </tr>

              </tbody>

            </table>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <div className="row">

                  <div className="column-12 column-small-8 column-small-offset-2 column-medium-8 column-medium-offset-2 column-large-6 column-large-offset-3 column-jumbo-4 column-jumbo-offset-4">

                    <div className="panel">

                      <div className="panel-cell panel-cell-borderless panel-cell-short-bottom text-align-center">

                        <span className="h5 flush">

                          Frontend Developer

                        </span>

                      </div>

                      <div className="panel-cell flush-top">

                        <p className="text-align-center flush">

                          Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna. Duis mollis, est non commodo vol luctus.

                        </p>

                      </div>

                      <div className="panel-cell panel-cell-light panel-cell-short text-align-center">

                        <button className="button button-success button-rounded">

                          Apply Today &rarr;

                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockPanelCellStyling}

                </pre>

              </div>

            </div>

          </section>

        </section>

      </div>
    );
  }
}

PanelsTabContent.contextTypes = {
  router: routerShape
};

PanelsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = PanelsTabContent;
