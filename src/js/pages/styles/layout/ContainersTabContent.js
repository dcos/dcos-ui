import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class ContainersTabContent extends React.Component {

  render() {
    let codeBlockContainersFixed =
`<div class="container">
  <!-- Container content goes here -->
</div>`;
    let codeBlockContainersFluid =
`<div class="pod flush-top flush-bottom">
  <!-- Container content goes here -->
</div>`;

    return (
      <div>

        <section id="containers">

          <p className="lead">

            Containers provide basic layout functionality. The term "container" has been borrowed from Twitter's Bootstrap, and is meant to imply an element that wraps or "contains" content.

          </p>

          <p>

            In Canvas, containers can be used independent of the <a href="/layout/grid">Grid System</a>. Properties such as a width and margin for the container vary depending on both the class and screen resolution. Choose from a responsive, fixed-width container (meaning its max-width changes at each breakpoint) or fluid-width (meaning it’s 100% wide all the time).

          </p>

        </section>

        <section id="containers-fixed">

          <h2>

            Fixed-Width Containers

          </h2>

          <p>

            A container can be fixed or fluid.  A fixed container is one where the width of the container is fixed value. That value may change based on the screen resolution to take advantage of additional horizontal screen space. Use the class <code>.container</code> to create a fixed with container.  By default a fixed width container has no margin or padding.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="layout-box containers-fixed">
                <div className="layout-box-item layout-box-item-margin container">
                  <div className="layout-box-item layout-box-item-padding">
                    <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockContainersFixed}

              </pre>

            </div>

          </div>

        </section>

        <section id="containers-fluid">

          <h2>

            Fluid-Width Containers

          </h2>

          <p>

            In previous versions of CNVS, <code>.container-fluid</code> was used to encapsulated content that should fill the width of it's parent.  A fluid container applied outerward spacing to the left and right of the Container and was a quick way to create a header, banner, or other full-width components.  With the introduction of the <code>.pod</code> layout component (see: <a href="/layout/pods"><em>Pods</em></a>) we Containers have been generalized to be used only for bounding content by width.  To create the previously seen by <code>.container-fluid</code> it is now suggested that you wrap content in a <code>.pod</code>.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="layout-box containers-fluid">
                <div className="layout-box-item layout-box-item-margin pod flush-top flush-bottom">
                  <div className="layout-box-item layout-box-item-padding">
                    <div className="layout-box-item layout-box-item-content layout-box-item-content-fixed-height">
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockContainersFluid}

              </pre>

            </div>

          </div>

        </section>

      </div>
    );
  }
}

ContainersTabContent.contextTypes = {
  router: routerShape
};

ContainersTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ContainersTabContent;
