import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class TablesTabContent extends React.Component {

  render() {

    let codeBlockTable =
`<table class="table">

  <!--Table Head-->
  <thead>
    <!--Table Row-->
    <tr>
      <!--Table Head Cell-->
      <th>
      </th>
      …
    </tr>
  </thead>

  <!--Table Body-->
  <tbody>
    <!--Table Row-->
    <tr>
      <!--Table Cell-->
      <td>
      </td>
      …
    </tr>
    …
  </tbody>

</table>`;
    let codeBlockTableHoverRows =
`<table class="table table-hover">
  …
</table>`;
    let codeBlockTableBorderless =
`<table class="table table-borderless-outer table-borderless-inner-columns">
  …
</table>`;
    let codeBlockTableConditionalRowStates =
`<table class="table table-hover">
  …
</table>`;
    let codeBlockTableInverse =
`<table class="table table-inverse table-borderless-outer table-borderless-inner-columns">
  …
</table>`;
    let codeBlockTableSizesSmall =
`<table class="table table-small">
  …
</table>`;
    let codeBlockTableSizesLarge =
`<table class="table table-large">
  …
</table>`;

    return (

      <div>

        <p>

          For truly tabular data, use the <code>&lt;table&gt;</code> tag and add the class <code>.table</code>.  The table element applies basic stying propeties and padding to the default <code>&lt;table&gt;</code> element.

        </p>

        <div className="panel flush-bottom">

          <div className="panel-cell">

            <table className="table flush-bottom">

              <thead>

                <tr>

                  <th>

                    First Name

                  </th>

                  <th>

                    Last Name

                  </th>

                  <th className="active">

                    Email

                  </th>

                  <th>

                    Commits

                  </th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>

                    John

                  </td>

                  <td>

                    Ashenden

                  </td>

                  <td className="active">

                    john.ashenden@domain.com

                  </td>

                  <td>

                    802

                  </td>

                </tr>

                <tr className="">

                  <td>

                    Michael

                  </td>

                  <td>

                    Lunøe

                  </td>

                  <td className="active">

                    michael.lunoe@domain.com

                  </td>

                  <td>

                    2,401

                  </td>

                </tr>

                <tr>

                  <td>

                    Rafael

                  </td>

                  <td>

                    Corral

                  </td>

                  <td className="active">

                    rafael.corral@domain.com

                  </td>

                  <td>

                    1,532

                  </td>

                </tr>

                <tr>

                  <td>

                    Jesse

                  </td>

                  <td>

                    Lash

                  </td>

                  <td className="active">

                    jesse.lash@domain.com

                  </td>

                  <td>

                    104

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

          <div className="panel-cell panel-cell-light panel-cell-code-block">

            <pre className="prettyprint transparent flush lang-html">

              {codeBlockTable}

            </pre>

          </div>

        </div>

        <section id="tables-hover-rows">

          <h2>

            Hover Rows

          </h2>

          <p>

            Add <code>.table-hover</code> to enable a hover state on table rows within a <code>&lt;tbody&gt;</code>.

          </p>

          <div className="panel">

            <div className="panel-cell">

              <table className="table table-hover flush-bottom">

                <thead>

                  <tr>

                    <th>

                      First Name

                    </th>

                    <th>

                      Last Name

                    </th>

                    <th className="active">

                      Email

                    </th>

                    <th>

                      Commits

                    </th>

                  </tr>

                </thead>

                <tbody>

                  <tr>

                    <td>

                      John

                    </td>

                    <td>

                      Ashenden

                    </td>

                    <td className="active">

                      john.ashenden@domain.com

                    </td>

                    <td>

                      802

                    </td>

                  </tr>

                  <tr className="">

                    <td>

                      Michael

                    </td>

                    <td>

                      Lunøe

                    </td>

                    <td className="active">

                      michael.lunoe@domain.com

                    </td>

                    <td>

                      2,401

                    </td>

                  </tr>

                  <tr>

                    <td>

                      Rafael

                    </td>

                    <td>

                      Corral

                    </td>

                    <td className="active">

                      rafael.corral@domain.com

                    </td>

                    <td>

                      1,532

                    </td>

                  </tr>

                  <tr>

                    <td>

                      Jesse

                    </td>

                    <td>

                      Lash

                    </td>

                    <td className="active">

                      jesse.lash@domain.com

                    </td>

                    <td>

                      104

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockTableHoverRows}

              </pre>

            </div>

          </div>

          <p>

            Add <code>.table-row-hover-disabled</code> to any <code>&lt;tr&gt;</code> to disable the row hover behavior and styling.

          </p>

        </section>

        <section id="tables-borderless">

          <h2>

            Borderless Tables

          </h2>

          <p>

            Add <code>.table-borderless</code> to remove the outer borders from the table.

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

                    .table-borderless

                  </code>

                </td>

                <td>

                  Remove all table borders.

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .table-borderless-inner

                  </code>

                </td>

                <td>

                  Remove all table inner borders.

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .table-borderless-inner-columns

                  </code>

                </td>

                <td>

                  Remove all table inner vertical borders.

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .table-borderless-inner-rows

                  </code>

                </td>

                <td>

                  Remove all table inner horizontal borders.

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .table-borderless-outer

                  </code>

                </td>

                <td>

                  Remove all table outer borders.

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .table-borderless-outer-columns

                  </code>

                </td>

                <td>

                  Remove all table outer vertical borders.

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .table-borderless-outer-rows

                  </code>

                </td>

                <td>

                  Remove all table outer horizontal borders.

                </td>

              </tr>

            </tbody>

          </table>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <table className="table table-borderless-outer table-borderless-inner-columns flush-bottom">

                <thead>

                  <tr>

                    <th>

                      First Name

                    </th>

                    <th>

                      Last Name

                    </th>

                    <th className="active">

                      Email

                    </th>

                    <th>

                      Commits

                    </th>

                  </tr>

                </thead>

                <tbody>

                  <tr>

                    <td>

                      John

                    </td>

                    <td>

                      Ashenden

                    </td>

                    <td className="active">

                      john.ashenden@domain.com

                    </td>

                    <td>

                      802

                    </td>

                  </tr>

                  <tr className="">

                    <td>

                      Michael

                    </td>

                    <td>

                      Lunøe

                    </td>

                    <td className="active">

                      michael.lunoe@domain.com

                    </td>

                    <td>

                      2,401

                    </td>

                  </tr>

                  <tr>

                    <td>

                      Rafael

                    </td>

                    <td>

                      Corral

                    </td>

                    <td className="active">

                      rafael.corral@domain.com

                    </td>

                    <td>

                      1,532

                    </td>

                  </tr>

                  <tr>

                    <td>

                      Jesse

                    </td>

                    <td>

                      Lash

                    </td>

                    <td className="active">

                      jesse.lash@domain.com

                    </td>

                    <td>

                      104

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockTableBorderless}

              </pre>

            </div>

          </div>

        </section>

        <section id="tables-conditional-row-states">

          <h2>

            Conditional Row States

          </h2>

          <p>

            Use contextual classes to color table rows or individual cells.

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

                    .selected

                  </code>

                </td>

                <td>

                  Applies the hover color to a particular row or cell

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .success

                  </code>

                </td>

                <td>

                  Indicates a successful or positive action

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .warning

                  </code>

                </td>

                <td>

                  Indicates a warning that might need attention

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .danger

                  </code>

                </td>

                <td>

                  Indicates a dangerous or potentially negative action

                </td>

              </tr>

            </tbody>

          </table>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <table className="table table-hover flush-bottom">

                <thead>

                  <tr>

                    <th>

                      First Name

                    </th>

                    <th>

                      Last Name

                    </th>

                    <th className="active">

                      Email

                    </th>

                    <th>

                      Commits

                    </th>

                  </tr>

                </thead>

                <tbody>

                  <tr>

                    <td>

                      John

                    </td>

                    <td>

                      Ashenden

                    </td>

                    <td className="active">

                      john.ashenden@domain.com

                    </td>

                    <td>

                      802

                    </td>

                  </tr>

                  <tr className="selected">

                    <td>

                      Michael

                    </td>

                    <td>

                      Lunøe

                    </td>

                    <td className="active">

                      michael.lunoe@domain.com

                    </td>

                    <td>

                      2,401

                    </td>

                  </tr>

                  <tr className="">

                    <td>

                      Rafael

                    </td>

                    <td>

                      Corral

                    </td>

                    <td className="active">

                      rafael.corral@domain.com

                    </td>

                    <td>

                      1,532

                    </td>

                  </tr>

                  <tr className="success">

                    <td>

                      Jesse

                    </td>

                    <td>

                      Lash

                    </td>

                    <td className="active">

                      jesse.lash@domain.com

                    </td>

                    <td>

                      104

                    </td>

                  </tr>

                  <tr className="">

                    <td>

                      John

                    </td>

                    <td>

                      Ashenden

                    </td>

                    <td className="active">

                      john.ashenden@domain.com

                    </td>

                    <td>

                      802

                    </td>

                  </tr>

                  <tr className="warning">

                    <td>

                      Michael

                    </td>

                    <td>

                      Lunøe

                    </td>

                    <td className="active">

                      michael.lunoe@domain.com

                    </td>

                    <td>

                      2,401

                    </td>

                  </tr>

                  <tr className="">

                    <td>

                      Rafael

                    </td>

                    <td>

                      Corral

                    </td>

                    <td className="active">

                      rafael.corral@domain.com

                    </td>

                    <td>

                      1,532

                    </td>

                  </tr>

                  <tr className="danger">

                    <td>

                      Jesse

                    </td>

                    <td>

                      Lash

                    </td>

                    <td className="active">

                      jesse.lash@domain.com

                    </td>

                    <td>

                      104

                    </td>

                  </tr>

                    <tr>

                      <td>

                        John

                      </td>

                      <td>

                        Ashenden

                      </td>

                      <td className="active">

                        john.ashenden@domain.com

                      </td>

                      <td>

                        802

                      </td>

                    </tr>

                </tbody>

              </table>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockTableConditionalRowStates}

              </pre>

            </div>

          </div>

        </section>

        <section id="tables-inverse">

          <h2>

            Inverse Styling

          </h2>

          <p>

            Add the class <code>.table-inverse</code> to any <code>.table</code> element to leverage inverse styling.

          </p>

          <div className="panel panel-inverse">

            <div className="panel-cell panel-cell-inverse">

              <table className="table table-inverse table-hover table-borderless-outer table-borderless-inner-columns flush-bottom">

                <thead>

                  <tr>

                    <th>

                      First Name

                    </th>

                    <th>

                      Last Name

                    </th>

                    <th className="active">

                      Email

                    </th>

                    <th>

                      Commits

                    </th>

                  </tr>

                </thead>

                <tbody>

                  <tr>

                    <td>

                      John

                    </td>

                    <td>

                      Ashenden

                    </td>

                    <td className="active">

                      john.ashenden@domain.com

                    </td>

                    <td>

                      802

                    </td>

                  </tr>

                  <tr className="selected">

                    <td>

                      Michael

                    </td>

                    <td>

                      Lunøe

                    </td>

                    <td className="active">

                      michael.lunoe@domain.com

                    </td>

                    <td>

                      2,401

                    </td>

                  </tr>

                  <tr className="">

                    <td>

                      Rafael

                    </td>

                    <td>

                      Corral

                    </td>

                    <td className="active">

                      rafael.corral@domain.com

                    </td>

                    <td>

                      1,532

                    </td>

                  </tr>

                  <tr className="success">

                    <td>

                      Jesse

                    </td>

                    <td>

                      Lash

                    </td>

                    <td className="active">

                      jesse.lash@domain.com

                    </td>

                    <td>

                      104

                    </td>

                  </tr>

                  <tr className="">

                    <td>

                      John

                    </td>

                    <td>

                      Ashenden

                    </td>

                    <td className="active">

                      john.ashenden@domain.com

                    </td>

                    <td>

                      802

                    </td>

                  </tr>

                  <tr className="warning">

                    <td>

                      Michael

                    </td>

                    <td>

                      Lunøe

                    </td>

                    <td className="active">

                      michael.lunoe@domain.com

                    </td>

                    <td>

                      2,401

                    </td>

                  </tr>

                  <tr className="">

                    <td>

                      Rafael

                    </td>

                    <td>

                      Corral

                    </td>

                    <td className="active">

                      rafael.corral@domain.com

                    </td>

                    <td>

                      1,532

                    </td>

                  </tr>

                  <tr className="danger">

                    <td>

                      Jesse

                    </td>

                    <td>

                      Lash

                    </td>

                    <td className="active">

                      jesse.lash@domain.com

                    </td>

                    <td>

                      104

                    </td>

                  </tr>

                    <tr>

                      <td>

                        John

                      </td>

                      <td>

                        Ashenden

                      </td>

                      <td className="active">

                        john.ashenden@domain.com

                      </td>

                      <td>

                        802

                      </td>

                    </tr>

                </tbody>

              </table>

            </div>

            <div className="panel-cell panel-cell-dark panel-cell-inverse panel-cell-code-block">

              <pre className="prettyprint code-block-inverse transparent flush lang-html">

                {codeBlockTableInverse}

              </pre>

            </div>

          </div>

        </section>

        <section id="tables-sizes">

          <h2>

            Table Sizes

          </h2>

          <p>

            By default, tables display at a standard size.  Additional sizes are available: small and large.  Add classes <code>.table-small</code> and <code>.table-large</code> respectively to each table to adjust it's size.

          </p>

          <div className="panel pod pod-short flush-top flush-horizontal">

            <div className="panel-cell">

              <table className="table table-small flush-bottom">

                <thead>

                  <tr>

                    <th>

                      First Name

                    </th>

                    <th>

                      Last Name

                    </th>

                    <th className="active">

                      Email

                    </th>

                    <th>

                      Commits

                    </th>

                  </tr>

                </thead>

                <tbody>

                  <tr>

                    <td>

                      John

                    </td>

                    <td>

                      Ashenden

                    </td>

                    <td className="active">

                      john.ashenden@domain.com

                    </td>

                    <td>

                      802

                    </td>

                  </tr>

                  <tr className="">

                    <td>

                      Michael

                    </td>

                    <td>

                      Lunøe

                    </td>

                    <td className="active">

                      michael.lunoe@domain.com

                    </td>

                    <td>

                      2,401

                    </td>

                  </tr>

                  <tr>

                    <td>

                      Rafael

                    </td>

                    <td>

                      Corral

                    </td>

                    <td className="active">

                      rafael.corral@domain.com

                    </td>

                    <td>

                      1,532

                    </td>

                  </tr>

                  <tr>

                    <td>

                      Jesse

                    </td>

                    <td>

                      Lash

                    </td>

                    <td className="active">

                      jesse.lash@domain.com

                    </td>

                    <td>

                      104

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockTableSizesSmall}

              </pre>

            </div>

          </div>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <table className="table table-large flush-bottom">

                <thead>

                  <tr>

                    <th>

                      First Name

                    </th>

                    <th>

                      Last Name

                    </th>

                    <th className="active">

                      Email

                    </th>

                    <th>

                      Commits

                    </th>

                  </tr>

                </thead>

                <tbody>

                  <tr>

                    <td>

                      John

                    </td>

                    <td>

                      Ashenden

                    </td>

                    <td className="active">

                      john.ashenden@domain.com

                    </td>

                    <td>

                      802

                    </td>

                  </tr>

                  <tr className="">

                    <td>

                      Michael

                    </td>

                    <td>

                      Lunøe

                    </td>

                    <td className="active">

                      michael.lunoe@domain.com

                    </td>

                    <td>

                      2,401

                    </td>

                  </tr>

                  <tr>

                    <td>

                      Rafael

                    </td>

                    <td>

                      Corral

                    </td>

                    <td className="active">

                      rafael.corral@domain.com

                    </td>

                    <td>

                      1,532

                    </td>

                  </tr>

                  <tr>

                    <td>

                      Jesse

                    </td>

                    <td>

                      Lash

                    </td>

                    <td className="active">

                      jesse.lash@domain.com

                    </td>

                    <td>

                      104

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockTableSizesLarge}

              </pre>

            </div>

          </div>

        </section>

      </div>

    );

  }
}

TablesTabContent.contextTypes = {
  router: routerShape
};

TablesTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = TablesTabContent;
