import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class ColorsTabContent extends React.Component {

  render() {
    let codeBlockColorLighten =
`// Lighten Purple by 50%
color: color-lighten(@purple, 50);

// Darken Purple by 50%
color: color-lighten(@purple, -50);`;

    return (
      <div>

        <p>

          A neutral palette along with a full color palette offer a wide array of color options for your project. By default, purple <code>@purple</code> is used across the Canvas UI kit as the primary color.  You can see this carry across forms, buttons, and other components.

        </p>

        <section id="colors-palettes">

          <h3>

            Neutral Palette

          </h3>

          <div className="row color-swatches">

            <div className="column-small-6 column-medium-4 column-large-3 color-swatch black pod pod-short flush-top flush-horizontal">

              <div className="color-swatch-cell">
              </div>

              <h6 className="color-swatch-cell-label short-top flush-bottom">

                Black

              </h6>

              <p className="color-swatch-cell-variable flush-bottom">

                <code>

                  @black

                </code>

              </p>

            </div>

            <div className="column-small-6 column-medium-4 column-large-3 color-swatch white pod pod-short flush-top flush-horizontal">

              <div className="color-swatch-cell">
              </div>

              <h6 className="color-swatch-cell-label short-top flush-bottom">

                White

              </h6>

              <p className="color-swatch-cell-variable flush-bottom">

                <code>

                  @white

                </code>

              </p>

            </div>

            <div className="column-small-6 column-medium-4 column-large-3 color-swatch neutral pod pod-short flush-top flush-horizontal">

              <div className="color-swatch-cell">
              </div>

              <h6 className="color-swatch-cell-label short-top flush-bottom">

                Neutral

              </h6>

              <p className="color-swatch-cell-variable flush-bottom">

                <code>

                  @neutral

                </code>

              </p>

            </div>

          </div>

          <h3>

            Color Palette

          </h3>

          <div className="row color-swatches">

            <div className="column-small-6 column-medium-4 column-large-3 color-swatch purple pod pod-short flush-top flush-horizontal">

              <div className="color-swatch-cell">
              </div>

              <h6 className="color-swatch-cell-label short-top flush-bottom">

                Purple

              </h6>

              <p className="color-swatch-cell-variable flush-bottom">

                <code>

                  @purple

                </code>

              </p>

            </div>

            <div className="column-small-6 column-medium-4 column-large-3 color-swatch blue pod pod-short flush-top flush-horizontal">

              <div className="color-swatch-cell">
              </div>

              <h6 className="color-swatch-cell-label short-top flush-bottom">

                Blue

              </h6>

              <p className="color-swatch-cell-variable flush-bottom">

                <code>

                  @blue

                </code>

              </p>

            </div>

            <div className="column-small-6 column-medium-4 column-large-3 color-swatch red pod pod-short flush-top flush-horizontal">

              <div className="color-swatch-cell">
              </div>

              <h6 className="color-swatch-cell-label short-top flush-bottom">

                Red

              </h6>

              <p className="color-swatch-cell-variable flush-bottom">

                <code>

                  @red

                </code>

              </p>

            </div>

            <div className="column-small-6 column-medium-4 column-large-3 color-swatch orange pod pod-short flush-top flush-horizontal">

              <div className="color-swatch-cell">
              </div>

              <h6 className="color-swatch-cell-label short-top flush-bottom">

                Orange

              </h6>

              <p className="color-swatch-cell-variable flush-bottom">

                <code>

                  @orange

                </code>

              </p>

            </div>

            <div className="column-small-6 column-medium-4 column-large-3 color-swatch yellow pod pod-short flush-top flush-horizontal">

              <div className="color-swatch-cell">
              </div>

              <h6 className="color-swatch-cell-label short-top flush-bottom">

                Yellow

              </h6>

              <p className="color-swatch-cell-variable flush-bottom">

                <code>

                  @yellow

                </code>

              </p>

            </div>

            <div className="column-small-6 column-medium-4 column-large-3 color-swatch green pod pod-short flush-top flush-horizontal">

              <div className="color-swatch-cell">
              </div>

              <h6 className="color-swatch-cell-label short-top flush-bottom">

                Green

              </h6>

              <p className="color-swatch-cell-variable flush-bottom">

                <code>

                  @green

                </code>

              </p>

            </div>

            <div className="column-small-6 column-medium-4 column-large-3 color-swatch pink pod pod-short flush-top flush-horizontal">

              <div className="color-swatch-cell">
              </div>

              <h6 className="color-swatch-cell-label short-top flush-bottom">

                Pink

              </h6>

              <p className="color-swatch-cell-variable flush-bottom">

                <code>

                  @pink

                </code>

              </p>

            </div>

            <div className="column-small-6 column-medium-4 column-large-3 color-swatch cyan pod pod-short flush-top flush-horizontal">

              <div className="color-swatch-cell">
              </div>

              <h6 className="color-swatch-cell-label short-top flush-bottom">

                Cyan

              </h6>

              <p className="color-swatch-cell-variable flush-bottom">

                <code>

                  @cyan

                </code>

              </p>

            </div>

          </div>

        </section>

        <section id="colors-blending">

          <h2>

            Color Blending

          </h2>

          <p>

            If you are using LESS for your project, a function has been made available to allow you to easily blend white and black with a single color.  This is useful in going lighter or darker with a specific color, while remaining in the same color spectrum.  For example, you may want a purple button to become a slightly darker purple on mouse over.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="color-blend neutral pod flush-horizontal flush-top pod-short-bottom">

                <div className="color-blend-base">
                </div>

                <div className="color-blend-spectrum">

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-5">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-10">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-15">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-20">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-25">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-30">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-35">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-40">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-45">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-50">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-55">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-65">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-70">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-75">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-80">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-85">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-90">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-95">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-100">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-5">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-10">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-15">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-20">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-25">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-30">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-35">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-40">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-45">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-50">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-55">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-65">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-70">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-75">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-80">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-85">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-90">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-95">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-100">
                  </div>

                </div>

              </div>

              <div className="color-blend purple pod flush-horizontal flush-top pod-short-bottom">

                <div className="color-blend-base">
                </div>

                <div className="color-blend-spectrum">

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-5">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-10">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-15">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-20">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-25">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-30">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-35">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-40">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-45">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-50">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-55">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-65">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-70">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-75">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-80">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-85">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-90">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-95">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-100">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-5">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-10">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-15">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-20">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-25">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-30">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-35">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-40">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-45">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-50">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-55">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-65">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-70">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-75">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-80">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-85">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-90">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-95">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-100">
                  </div>

                </div>

              </div>

              <div className="color-blend blue flush-bottom">

                <div className="color-blend-base">
                </div>

                <div className="color-blend-spectrum">

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-5">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-10">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-15">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-20">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-25">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-30">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-35">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-40">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-45">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-50">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-55">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-65">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-70">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-75">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-80">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-85">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-90">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-95">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-lighten color-blend-spectrum-cell-100">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-5">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-10">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-15">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-20">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-25">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-30">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-35">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-40">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-45">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-50">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-55">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-65">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-70">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-75">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-80">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-85">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-90">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-95">
                  </div>

                  <div className="color-blend-spectrum-cell color-blend-spectrum-cell-darken color-blend-spectrum-cell-100">
                  </div>

                </div>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-less">

                {codeBlockColorLighten}

              </pre>

            </div>

          </div>

        </section>

      </div>
    );
  }
}

ColorsTabContent.contextTypes = {
  router: routerShape
};

ColorsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ColorsTabContent;
