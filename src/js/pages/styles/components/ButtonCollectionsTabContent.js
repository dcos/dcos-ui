import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class ButtonCollectionsTabContent extends React.Component {

  render() {

    let codeBlockButtonCollection =
`<!-- Button: Collection -->
<div class="button-collection">
  <button class="button button-primary">
    Primary Button
  </button>
  <button class="button">
    Button
  </button>
</div>`;
    let codeBlockButtonCollectionVerticalAlignment =
`<!-- Button Collection: Align Top-->
<div class="button-collection button-collection-align-vertical-top">
  …
</div>

<!-- Button Collection: Align Middle-->
<div class="button-collection button-collection-align-vertical-middle">
  …
</div>

<!-- Button Collection: Align Bottom-->
<div class="button-collection button-collection-align-vertical-bottom">
  …
</div>`;

    return (

      <div>

        <p>

          Buttons render easily as objects inline with other elements.  When you have a group of buttons, use the <code>.button-collection</code> element to wrap a set of buttons.  A button collection defines simple rules governing the space between buttons both horizontally and vertically.

        </p>

        <div className="panel flush-bottom">

          <div className="panel-cell">

            <div className="button-collection flush-bottom">

              <button className="button button-primary">

                Primary Button

              </button>

              <button className="button">

                Button

              </button>

            </div>

          </div>

          <div className="panel-cell panel-cell-light panel-cell-code-block">

            <pre className="prettyprint transparent flush lang-html">

              {codeBlockButtonCollection}

            </pre>

          </div>

        </div>

        <section id="button-collection-vertical-alignment">

          <h2>

            Button Collection Vertical Alignment

          </h2>

          <p>

            When you have buttons of different sizes in the same <code>.button-collection</code>, you can use the button alignment properties <code>.button-collection-align-top</code>, <code>.button-collection-align-middle</code>, and <code>.button-collection-align-bottom</code> to position them along the top, middle, or baseline axis.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="button-collection button-collection-align-vertical-top">

                <button className="button button-jumbo">

                  Jumbo

                </button>

                <button className="button button-large">

                  Large

                </button>

                <button className="button">

                  Default

                </button>

                <button className="button button-small">

                  Small

                </button>

                <button className="button button-mini">

                  Mini

                </button>

              </div>

              <div className="button-collection button-collection-align-vertical-middle">

                <button className="button button-jumbo">

                  Jumbo

                </button>

                <button className="button button-large">

                  Large

                </button>

                <button className="button">

                  Default

                </button>

                <button className="button button-small">

                  Small

                </button>

                <button className="button button-mini">

                  Mini

                </button>

              </div>

              <div className="button-collection button-collection-align-vertical-bottom flush-bottom">

                <button className="button button-jumbo">

                  Jumbo

                </button>

                <button className="button button-large">

                  Large

                </button>

                <button className="button">

                  Default

                </button>

                <button className="button button-small">

                  Small

                </button>

                <button className="button button-mini">

                  Mini

                </button>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockButtonCollectionVerticalAlignment}

              </pre>

            </div>

          </div>

        </section>

      </div>

    );

  }
}

ButtonCollectionsTabContent.contextTypes = {
  router: routerShape
};

ButtonCollectionsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ButtonCollectionsTabContent;
