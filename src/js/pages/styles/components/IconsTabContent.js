import React from 'react';
import {routerShape} from 'react-router';

// import IconAdd from '../../../../img/icons/icon-add.svg?name=IconAdd';
import SidebarActions from '../../../events/SidebarActions';
import Icon from '../../../components/Icon';

class IconsTabContent extends React.Component {

  render() {

    let codeBlockIcons =
`<i class='icon icon-medium'>
</i>`;

    return (
      <div>

        <section className="fill" id="icons">

          <p>

            A simple and easy to use icon class is available in Canvas.  The icon class <code>.icon</code> assumes very little about the actual icon itself, but instead serves as an easily modifiable container in which you can define or place your icon -- whether that icon is an SVG, font, or bitmap.  Canvas does not include icon glyphs or fonts by default, relying on the user to specify how these should be configured.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <Icon id="user" size="medium" family="medium" className="icon-black" />

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockIcons}

              </pre>

            </div>

          </div>

        </section>

        <section id="icons-sizes">

          <h2>

            Icon Sizes

          </h2>

          <p>

            Think of the <code>.icon</code> elements as a bounding box in which you can place &mdash; either inside or directly as a background &mdash; any image, SVG, or font.  The bounding box is rectangular, but by default, they are defined as square (1:1).  Canvas provides 5 unique icon sizes (defined below).  The sizes can be easily changed.  Furthermore, these sizes are consider responsive, with the dimensions changing as defined by the user, with changes in screen size.

          </p>

          <table className="table short">

            <thead>

              <tr>

                <th>

                  Class

                </th>

                <th>

                  Base Size

                </th>

                <th>

                  Example

                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td>

                  <code>

                    .icon-mini

                  </code>

                </td>

                <td>

                  16x16

                </td>

                <td>

                  <Icon id="user" size="mini" family="mini" className="icon-purple" />

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .icon-small

                  </code>

                </td>

                <td>

                  24x24

                </td>

                <td>

                  <Icon id="user" size="small" family="small" className="icon-purple" />

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .icon-medium

                  </code>

                </td>

                <td>

                  32x32

                </td>

                <td>

                  <Icon id="user" size="medium" family="medium" className="icon-purple" />

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .icon-large

                  </code>

                </td>

                <td>

                  48x48

                </td>

                <td>

                  <Icon id="user" size="large" family="medium" className="icon-purple" />

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .icon-jumbo

                  </code>

                </td>

                <td>

                  64x64

                </td>

                <td>

                  <Icon id="user" size="jumbo" family="medium" className="icon-purple" />

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .icon-huge

                  </code>

                </td>

                <td>

                  96x96

                </td>

                <td>

                  <Icon id="user" size="huge" family="medium" className="icon-purple" />

                </td>

              </tr>

            </tbody>

          </table>

        </section>

        <section id="icons-styles">

          <h2>

            Icon Styles

          </h2>

          <p>

            Like with sizes, Canvas also provides a number of built in styles to apply to your icons.  These styles modify only the <code>color</code> and <code>fill</code> properties, which means they work with SVG and Font defined icons, not bitmap icons.  For bitmap images, you will need to introdue an alternate means (e.g. sprite sheet) for dynamically switching between image styles.

          </p>

          <table className="table short">

            <thead>

              <tr>

                <th>

                  Class

                </th>

                <th>

                  Example

                </th>

                <th>

                  Class

                </th>

                <th>

                  Example

                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td>

                  <code>

                    .icon-black

                  </code>

                </td>

                <td>

                  <Icon id="user" size="medium" family="medium" className="icon-black" />

                </td>

                  <td>

                    <code>

                      .icon-white

                    </code>

                  </td>

                  <td>

                    <Icon id="user" size="medium" family="medium" className="icon-white" />

                  </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .icon-blue

                  </code>

                </td>

                <td>

                  <Icon id="user" size="medium" family="medium" className="icon-blue" />

                </td>

                  <td>

                    <code>

                      .icon-red

                    </code>

                  </td>

                  <td>

                    <Icon id="user" size="medium" family="medium" className="icon-red" />

                  </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .icon-orange

                  </code>

                </td>

                <td>

                  <Icon id="user" size="medium" family="medium" className="icon-orange" />

                </td>

                  <td>

                    <code>

                      .icon-yellow

                    </code>

                  </td>

                  <td>

                    <Icon id="user" size="medium" family="medium" className="icon-yellow" />

                  </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .icon-green

                  </code>

                </td>

                <td>

                  <Icon id="user" size="medium" family="medium" className="icon-green" />

                </td>

                  <td>

                    <code>

                      .icon-purple

                    </code>

                  </td>

                  <td>

                    <Icon id="user" size="medium" family="medium" className="icon-purple" />

                  </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .icon-pink

                  </code>

                </td>

                <td>

                  <Icon id="user" size="medium" family="medium" className="icon-pink" />

                </td>

                  <td>

                    <code>

                      .icon-gold

                    </code>

                  </td>

                  <td>

                    <Icon id="user" size="medium" family="medium" className="icon-gold" />

                  </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .icon-cyan

                  </code>

                </td>

                <td>

                  <Icon id="user" size="medium" family="medium" className="icon-cyan" />

                </td>

                  <td>

                    <code>

                      .icon-orchid

                    </code>

                  </td>

                  <td>

                    <Icon id="user" size="medium" family="medium" className="icon-orchid" />

                  </td>

              </tr>

            </tbody>

          </table>

        </section>

      </div>

    );
  }
}

IconsTabContent.contextTypes = {
  router: routerShape
};

IconsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = IconsTabContent;
