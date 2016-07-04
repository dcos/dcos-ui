import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class ButtonCollectionsTabContent extends React.Component {

  render() {

    let codeBlockButtonCollection =
`<!-- Button: Collection -->
<div class="button-collection">
  <a href="#" class="button button-primary">
    Primary Button
  </a>
  <a href="#" class="button">
    Button
  </a>
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

              <a href="#" className="button button-primary">

                Primary Button

              </a>

              <a href="#" className="button">

                Button

              </a>

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

                <a href="#" className="button button-jumbo">

                  Jumbo

                </a>

                <a href="#" className="button button-large">

                  Large

                </a>

                <a href="#" className="button">

                  Default

                </a>

                <a href="#" className="button button-small">

                  Small

                </a>

                <a href="#" className="button button-mini">

                  Mini

                </a>

              </div>

              <div className="button-collection button-collection-align-vertical-middle">

                <a href="#" className="button button-jumbo">

                  Jumbo

                </a>

                <a href="#" className="button button-large">

                  Large

                </a>

                <a href="#" className="button">

                  Default

                </a>

                <a href="#" className="button button-small">

                  Small

                </a>

                <a href="#" className="button button-mini">

                  Mini

                </a>

              </div>

              <div className="button-collection button-collection-align-vertical-bottom flush-bottom">

                <a href="#" className="button button-jumbo">

                  Jumbo

                </a>

                <a href="#" className="button button-large">

                  Large

                </a>

                <a href="#" className="button">

                  Default

                </a>

                <a href="#" className="button button-small">

                  Small

                </a>

                <a href="#" className="button button-mini">

                  Mini

                </a>

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
  router: React.PropTypes.func
};

ButtonCollectionsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ButtonCollectionsTabContent;
