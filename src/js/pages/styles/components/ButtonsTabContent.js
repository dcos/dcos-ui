import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class ButtonTabContent extends React.Component {

  render() {
    let codeBlockButton =
`<a href="#" class="button">
  Simple Button
</a>`;
  let codeBlockButtonSizes =
`<!-- Button: Jumbo -->
<a href="#" class="button button-jumbo">
  Jumbo
</a>

<!-- Button: Large -->
<a href="#" class="button button-large">
  Large
</a>

<!-- Button: Default -->
<a href="#" class="button">
  Default
</a>

<!-- Button: Small -->
<a href="#" class="button button-small">
  Small
</a>

<!-- Button: Mini -->
<a href="#" class="button button-mini">
  Mini
</a>`;

    return (
      <div>

        <p>

          Canvas adds support for a range of button states and sizes.  Simply add the <code>.button</code> class to any <code>&lt;a&gt;</code> or <code>&lt;button&gt;</code> to get started.

        </p>

        <div className="example-block flush-bottom">

          <div className="example-block-content">

            <a href="#" className="button">

              Simple Button

            </a>

          </div>

          <div className="example-block-footer example-block-footer-codeblock">

            <pre className="prettyprint lang-html flush-bottom">

              {codeBlockButton}

            </pre>

          </div>

        </div>

        <section id="buttons-sizes">

          <h2>

            Button Sizes

          </h2>

          <p>

            By default, buttons display at a standard size, comparable to that of an input field.  Four additional sizes are available: mini, small, large, and jumbo.  Add classes <code>.button-mini</code>, <code>.button-small</code>, <code>.button-large</code>, and <code>.button-jumbo</code> respectively to each button to adjust it's size.

          </p>

          <div className="example-block flush-bottom">

            <div className="example-block-content">

              <div className="button-collection button-collection-align-middle flush">

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

            <div className="example-block-footer example-block-footer-codeblock">

              <pre className="prettyprint lang-html flush-bottom">

                {codeBlockButtonSizes}

              </pre>

            </div>

          </div>

        </section>

      </div>
    );
  }
}

ButtonTabContent.contextTypes = {
  router: React.PropTypes.func
};

ButtonTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ButtonTabContent;
