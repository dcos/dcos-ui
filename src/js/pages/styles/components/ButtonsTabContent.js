import React from 'react';
import SidebarActions from '../../../events/SidebarActions';
import Icon from '../../../components/Icon';

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
    let codeBlockButtonStates =
`<!-- Button: Default -->
<a href="#" class="button">
  Default
</a>

<!-- Button: Primary -->
<a href="#" class="button button-primary">
  Primary
</a>

<!-- Button: Success -->
<a href="#" class="button button-success">
  Success
</a>

<!-- Button: Warning -->
<a href="#" class="button button-warning">
  Warning
</a>

<!-- Button: Danger -->
<a href="#" class="button button-danger">
  Danger
</a>`;
    let codeBlockButtonTypesRounded =
`<!-- Button: Default -->
<a href="#" class="button button-rounded">
  Default
</a>

<!-- Button: Primary -->
<a href="#" class="button button-rounded button-primary">
  Primary
</a>`;
    let codeBlockButtonTypesOutline =
`<!-- Button: Default -->
<a href="#" class="button button-outline">
  Default
</a>

<!-- Button: Primary -->
<a href="#" class="button button-primary-outline">
  Primary
</a>`;
    let codeBlockButtonTypesLink =
`<!-- Button: Default -->
<a href="#" class="button button-link">
  Default
</a>

<!-- Button: Primary -->
<a href="#" class="button button-primary-link">
  Primary
</a>`;
    let codeBlockButtonTypesCombined =
`<!-- Button: Default -->
<a href="#" class="button button-outline button-rounded">
  Default
</a>

<!-- Button: Primary -->
<a href="#" class="button button-primary-outline button-rounded">
  Primary
</a>`;
    let codeBlockButtonInverseStyling =
`<a href="#" class="button button-inverse">
  Default
</a>`;
    let codeBlockButtonWide =
`<a href="#" class="button button-wide">
  Wide Button
</a>`;
    let codeBlockButtonNarrow =
`<a href="#" class="button button-narrow">
  Narrow Button
</a>`;
    let codeBlockButtonBlock =
`<a href="#" class="button button-block">
  Block Button
</a>`;
    let codeBlockButtonBlockResponsive =
`<!-- Block Button: When Smaller than Screen Mini-->
<a href="#" class="button button-block button-block-below-screen-small">
  Block Button (Mini)
</a>

<!-- Block Button: When Smaller than Screen Small-->
<a href="#" class="button button-block button-block-below-screen-medium">
  Block Button (Small)
</a>

<!-- Block Button: When Smaller than Screen Medium-->
<a href="#" class="button button-block button-block-below-screen-large">
  Block Button (Medium)
</a>

<!-- Block Button: When Smaller than Screen Large-->
<a href="#" class="button button-block button-block-below-screen-jumbo">
  Block Button (Large)
</a>`;
    let codeBlockButtonDropdowns =
`<div class="button-group">
  <button type="button" class="button dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
    Toggle Button
  </button>
  <span class="dropdown-menu" role="menu">
    <ul class="dropdown-menu-list">
      <li>
        <a href="#">
          Action
        </a>
      </li>
      <li>
        <a href="#">
          Another action
        </a>
      </li>
      <li>
        <a href="#">
          Something else here
        </a>
      </li>
    </ul>
  </span>
</div>`;
    let codeBlockButtonDropdownsSizes =
`<div class="button-collection">
  <div class="button-group">
    <button type="button" class="button button-jumbo dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
      Jumbo
    </button>
    <span class="dropdown-menu" role="menu">
      &hellip;
    </span>
  </div>

  <div class="button-group">
    <button type="button" class="button button-large dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
      Large
    </button>
    <span class="dropdown-menu" role="menu">
      &hellip;
    </span>
  </div>

  <div class="button-group">
    <button type="button" class="button dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
      Medium
    </button>
    <span class="dropdown-menu" role="menu">
      &hellip;
    </span>
  </div>

  <div class="button-group">
    <button type="button" class="button button-small dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
      Small
    </button>
    <span class="dropdown-menu" role="menu">
      &hellip;
    </span>
  </div>

  <div class="button-group">
    <button type="button" class="button button-mini dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
      Mini
    </button>
    <span class="dropdown-menu" role="menu">
      &hellip;
    </span>
  </div>
</div>`;
    let codeBlockButtonControlsToggles =
`<button type="button" class="button button-primary" data-toggle="button" aria-pressed="false" autocomplete="off">
  Toggle Button
</button>`;
    let codeBlockButtonControlsButtonGroupsCheckboxes =
`<div class="button-group" data-toggle="buttons">
  <label class="button button-primary active">
    <input type="checkbox" autocomplete="off" checked> Checkbox 1
  </label>
  <label class="button button-primary">
    <input type="checkbox" autocomplete="off"> Checkbox 2
  </label>
  <label class="button button-primary">
    <input type="checkbox" autocomplete="off"> Checkbox 3
  </label>
</div>`;
    let codeBlockButtonControlsButtonGroupsRadios =
`<div class="button-group" data-toggle="buttons">
  <label class="button button-primary active">
    <input type="radio" name="options" id="option1" autocomplete="off" checked> Radio 1
  </label>
  <label class="button button-primary">
    <input type="radio" name="options" id="option1" autocomplete="off"> Radio 2
  </label>
  <label class="button button-primary">
    <input type="radio" name="options" id="option1" autocomplete="off"> Radio 3
  </label>
</div>`;
    let codeBlockButtonContent =
`<!-- Button: Default -->
<a href="#" class="button">
  <i class="icon icon-mini"></i>
  <span>Button</span>
</a>`;

    return (

      <div>

        <p>

          Canvas adds support for a range of button states and sizes.  Simply add the <code>.button</code> class to any <code>&lt;a&gt;</code> or <code>&lt;button&gt;</code> to get started.

        </p>

        <div className="panel flush-bottom">

          <div className="panel-cell">

            <a href="#" className="button">

              Simple Button

            </a>

          </div>

          <div className="panel-cell panel-cell-light">

            <pre className="prettyprint transparent flush lang-html">

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

          <div className="panel flush-bottom">

            <div className="panel-cell">

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

            <div className="panel-cell">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockButtonSizes}

              </pre>

            </div>

          </div>

        </section>

        <section id="buttons-states">

          <h2>

            Button States

          </h2>

          <p>

            You may wish to display more than the single button type, either to create separation in the importance of various actions or to communicate the state of an action or form.  Button states make this super easy.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="button-collection flush-bottom">

                <a href="#" className="button">

                  Default

                </a>

                <a href="#" className="button button-primary">

                  Primary

                </a>

                <a href="#" className="button button-success">

                  Success

                </a>

                <a href="#" className="button button-warning">

                  Warning

                </a>

                <a href="#" className="button button-danger">

                  Danger

                </a>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockButtonStates}

              </pre>

            </div>

          </div>

        </section>

        <section id="buttons-types">

          <h2>

            Button Types

          </h2>

          <p>

            We realize that one button shape and style, even with it's available states, may not be enough for the unique needs of your project.  This is why we've include a number of additional button types: rounded, outlined, link.

          </p>

          <section id="buttons-types-rounded">

            <h3>

              Rounded Button

            </h3>

            <p>

              Add the class <code>.button-rounded</code> to any <code>.button</code> element to display it with rounded caps.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <div className="button-collection flush-bottom">

                  <a href="#" className="button button-rounded">

                    Default

                  </a>

                  <a href="#" className="button button-rounded button-primary">

                    Primary

                  </a>

                  <a href="#" className="button button-rounded button-success">

                    Success

                  </a>

                  <a href="#" className="button button-rounded button-warning">

                    Warning

                  </a>

                  <a href="#" className="button button-rounded button-danger">

                    Danger

                  </a>

                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockButtonTypesRounded}

                </pre>

              </div>

            </div>

          </section>

          <section id="buttons-types-outline">

            <h3>

              Outline Button

            </h3>

            <p>

              Add the class <code>.button-*-outline</code> to any <code>.button</code> element to display it with a thin outline.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <div className="button-collection flush-bottom">

                  <a href="#" className="button button-outline">

                    Default

                  </a>

                  <a href="#" className="button button-primary-outline">

                    Primary

                  </a>

                  <a href="#" className="button button-success-outline">

                    Success

                  </a>

                  <a href="#" className="button button-warning-outline">

                    Warning

                  </a>

                  <a href="#" className="button button-danger-outline">

                    Danger

                  </a>

                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockButtonTypesOutline}

                </pre>

              </div>

            </div>

          </section>

          <section id="buttons-types-link">

            <h3>

              Link Button

            </h3>

            <p>

              Add the class <code>.button-*-link</code> to any <code>.button</code> element to display it as "text-only", while retaining the exact size attributes of it's normal button counterpart.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <div className="button-collection flush-bottom">

                  <a href="#" className="button button-link">

                    Default

                  </a>

                  <a href="#" className="button button-primary-link">

                    Primary

                  </a>

                  <a href="#" className="button button-success-link">

                    Success

                  </a>

                  <a href="#" className="button button-warning-link">

                    Warning

                  </a>

                  <a href="#" className="button button-danger-link">

                    Danger

                  </a>

                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockButtonTypesLink}

                </pre>

              </div>

            </div>

          </section>

          <section id="buttons-types-combine">

            <h3>

              Combine Button Types

            </h3>

            <p>

              Want an outlined button that has rounded caps?  Go ahead and combine button classes to yield interesting display combinations.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <div className="button-collection flush-bottom">

                  <a href="#" className="button button-outline button-rounded">

                    Default

                  </a>

                  <a href="#" className="button button-primary-outline button-rounded">

                    Primary

                  </a>

                  <a href="#" className="button button-success-outline button-rounded">

                    Success

                  </a>

                  <a href="#" className="button button-warning-outline button-rounded">

                    Warning

                  </a>

                  <a href="#" className="button button-danger-outline button-rounded">

                    Danger

                  </a>

                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockButtonTypesCombined}

                </pre>

              </div>

            </div>

          </section>

        </section>

        <section id="buttons-inverse-styling">

          <h2>

            Inverse Styling

          </h2>

          <p>

            Add the class <code>.button-inverse</code> to any <code>.button</code> element to leverage inverse styling.

          </p>

          <div className="panel panel-inverse">

            <div className="panel-cell panel-cell-inverse">

              <div className="button-collection">

                <a href="#" className="button button-inverse">

                  Default

                </a>

                <a href="#" className="button button-primary button-inverse">

                  Primary

                </a>

                <a href="#" className="button button-success button-inverse">

                  Success

                </a>

                <a href="#" className="button button-warning button-inverse">

                  Warning

                </a>

                <a href="#" className="button button-danger button-inverse">

                  Danger

                </a>

              </div>

              <div className="button-collection">

                <a href="#" className="button button-outline button-inverse">

                  Default

                </a>

                <a href="#" className="button button-primary-outline button-inverse">

                  Primary

                </a>

                <a href="#" className="button button-success-outline button-inverse">

                  Success

                </a>

                <a href="#" className="button button-warning-outline button-inverse">

                  Warning

                </a>

                <a href="#" className="button button-danger-outline button-inverse">

                  Danger

                </a>

              </div>

              <div className="button-collection flush-bottom">

                <a href="#" className="button button-link button-inverse">

                  Default

                </a>

                <a href="#" className="button button-primary-link button-inverse">

                  Primary

                </a>

                <a href="#" className="button button-success-link button-inverse">

                  Success

                </a>

                <a href="#" className="button button-warning-link button-inverse">

                  Warning

                </a>

                <a href="#" className="button button-danger-link button-inverse">

                  Danger

                </a>

              </div>

            </div>

            <div className="panel-cell panel-cell-inverse panel-cell-dark panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html code-block-inverse">

                {codeBlockButtonInverseStyling}

              </pre>

            </div>

          </div>

        </section>

        <section id="buttons-wide">

          <h2>

            Wide Buttons

          </h2>

          <p>

            Use the class <code>.button-wide</code> to increase the horizontal padding within a button.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="button-collection button-collection-align-middle flush-bottom">

                <a href="#" className="button button-wide">

                  Wide Button

                </a>

                <a href="#" className="button button-primary button-wide">

                  Wide Button

                </a>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockButtonWide}

              </pre>

            </div>

          </div>

        </section>

        <section id="buttons-narrow">

          <h2>

            Narrow Buttons

          </h2>

          <p>

            Use the class <code>.button-narrow</code> to decrease the horizontal padding within a button.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="button-collection button-collection-align-middle flush-bottom">

                <a href="#" className="button button-narrow">

                  Narrow Button

                </a>

                <a href="#" className="button button-primary button-narrow">

                  Narrow Button

                </a>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockButtonNarrow}

              </pre>

            </div>

          </div>

        </section>

        <section id="buttons-block">

          <h2>

            Block Buttons

          </h2>

          <p>

            Use the class <code>.button-block</code> when you need a button to fill the entire width of it's parent container.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="button-collection button-collection-align-middle flush-bottom">

                <a href="#" className="button button-block">

                  Block Button

                </a>

                <a href="#" className="button button-primary button-block">

                  Block Button

                </a>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockButtonBlock}

              </pre>

            </div>

          </div>

          <section id="buttons-block-responsive">

            <h3>

              Responsive Block Buttons

            </h3>

            <p>

              Optional classes are available when you need a button to fill it's parent container only below a specific screen size.  Add <code>.button-block-below-screen-*</code>, replacing <code>*</code> with <code>-mini</code>, <code>-small</code>, <code>-medium</code>, or <code>-large</code>.  Try it out.  Resize this browser window and observe when the buttons below switch to their Block view.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <div className="button-collection button-collection-align-middle flush-bottom">

                  <a href="#" className="button button-block button-block-below-screen-small">

                    Block Button (Mini)

                  </a>

                  <a href="#" className="button button-block button-block-below-screen-medium">

                    Block Button (Small)

                  </a>

                  <a href="#" className="button button-block button-block-below-screen-large">

                    Block Button (Medium)

                  </a>

                  <a href="#" className="button button-block button-block-below-screen-jumbo">

                    Block Button (Large)

                  </a>

                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockButtonBlockResponsive}

                </pre>

              </div>

            </div>

          </section>

        </section>

        <section id="buttons-dropdowns">

          <h2>

            Button Dropdowns

          </h2>

          <p>

            Use any button to trigger a dropdown menu by placing it within a <code>.btn-group</code> and providing the proper menu markup.

          </p>

          <section id="buttons-dropdowns-single-button">

            <h3>

              Single Button Dropdowns

            </h3>

            <p>

              Turn a button into a dropdown toggle with some basic markup changes.

            </p>

            <div className="panel panel-overflow">

              <div className="panel-cell">

                <div className="button-group">

                  <button type="button" className="button dropdown-toggle" data-toggle="dropdown" aria-expanded="false">

                    Toggle Button

                  </button>

                  <span className="dropdown-menu" role="menu">

                    <ul className="dropdown-menu-list">

                      <li>

                        <a href="#">

                          Action

                        </a>

                      </li>

                      <li>

                        <a href="#">

                          Another action

                        </a>

                      </li>

                      <li>

                        <a href="#">

                          Something else here

                        </a>

                      </li>

                    </ul>

                  </span>

                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockButtonDropdowns}

                </pre>

              </div>

            </div>

          </section>

          <section id="buttons-dropdowns-sizing">

            <h3>

              Button Dropdown Sizes

            </h3>

            <p>

              Button dropdowns work with buttons of all sizes.

            </p>

            <div className="panel panel-overflow">

              <div className="panel-cell">

                <div className="button-collection button-collection-align-vertical-center flush-bottom">

                  <div className="button-group">

                    <button type="button" className="button button-jumbo dropdown-toggle" data-toggle="dropdown" aria-expanded="false">

                      Jumbo

                    </button>

                    <span className="dropdown-menu" role="menu">

                      <ul className="dropdown-menu-list">

                        <li>

                          <a href="#">

                            Action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Another action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Something else here

                          </a>

                        </li>

                      </ul>

                    </span>

                  </div>

                  <div className="button-group">

                    <button type="button" className="button button-large dropdown-toggle" data-toggle="dropdown" aria-expanded="false">

                      Large

                    </button>

                    <span className="dropdown-menu" role="menu">

                      <ul className="dropdown-menu-list">

                        <li>

                          <a href="#">

                            Action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Another action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Something else here

                          </a>

                        </li>

                      </ul>

                    </span>

                  </div>

                  <div className="button-group">

                    <button type="button" className="button dropdown-toggle" data-toggle="dropdown" aria-expanded="false">

                      Medium

                    </button>

                    <span className="dropdown-menu" role="menu">

                      <ul className="dropdown-menu-list">

                        <li>

                          <a href="#">

                            Action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Another action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Something else here

                          </a>

                        </li>

                      </ul>

                    </span>

                  </div>

                  <div className="button-group">

                    <button type="button" className="button button-small dropdown-toggle" data-toggle="dropdown" aria-expanded="false">

                      Small

                    </button>

                    <span className="dropdown-menu" role="menu">

                      <ul className="dropdown-menu-list">

                        <li>

                          <a href="#">

                            Action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Another action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Something else here

                          </a>

                        </li>

                      </ul>

                    </span>

                  </div>

                  <div className="button-group">

                    <button type="button" className="button button-mini dropdown-toggle" data-toggle="dropdown" aria-expanded="false">

                      Mini

                    </button>

                    <span className="dropdown-menu" role="menu">

                      <ul className="dropdown-menu-list">

                        <li>

                          <a href="#">

                            Action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Another action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Something else here

                          </a>

                        </li>

                      </ul>

                    </span>

                  </div>

                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockButtonDropdownsSizes}

                </pre>

              </div>

            </div>

          </section>

          <section id="buttons-dropdowns-styled">

            <h3>

              Styled Button Dropdown

            </h3>

            <p>

              Button dropdowns work with all supported button styles. Add .button-stroke or any other included button style class to your button dropdown element. You can even combine styles.

            </p>

            <div className="panel panel-overflow">

              <div className="panel-cell">

                <div className="button-collection button-collection-align-vertical-center flush-bottom">

                  <div className="button-group">

                    <button type="button" className="button dropdown-toggle" data-toggle="dropdown" aria-expanded="false">

                      Button

                    </button>

                    <span className="dropdown-menu" role="menu">

                      <ul className="dropdown-menu-list">

                        <li>

                          <a href="#">

                            Action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Another action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Something else here

                          </a>

                        </li>

                      </ul>

                    </span>

                  </div>

                  <div className="button-group">

                    <button type="button" className="button button-stroke dropdown-toggle" data-toggle="dropdown" aria-expanded="false">

                      Button

                    </button>

                    <span className="dropdown-menu" role="menu">

                      <ul className="dropdown-menu-list">

                        <li>

                          <a href="#">

                            Action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Another action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Something else here

                          </a>

                        </li>

                      </ul>

                    </span>

                  </div>

                  <div className="button-group">

                    <button type="button" className="button button-rounded dropdown-toggle" data-toggle="dropdown" aria-expanded="false">

                      Button

                    </button>

                    <span className="dropdown-menu" role="menu">

                      <ul className="dropdown-menu-list">

                        <li>

                          <a href="#">

                            Action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Another action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Something else here

                          </a>

                        </li>

                      </ul>

                    </span>

                  </div>

                  <div className="button-group">

                    <button type="button" className="button button-stroke button-rounded dropdown-toggle" data-toggle="dropdown" aria-expanded="false">

                      Button

                    </button>

                    <span className="dropdown-menu" role="menu">

                      <ul className="dropdown-menu-list">

                        <li>

                          <a href="#">

                            Action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Another action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Something else here

                          </a>

                        </li>

                      </ul>

                    </span>

                  </div>

                  <div className="button-group">

                    <button type="button" className="button button-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="false">

                      Button

                    </button>

                    <span className="dropdown-menu" role="menu">

                      <ul className="dropdown-menu-list">

                        <li>

                          <a href="#">

                            Action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Another action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Something else here

                          </a>

                        </li>

                      </ul>

                    </span>

                  </div>

                  <div className="button-group">

                    <button type="button" className="button button-success button-rounded dropdown-toggle" data-toggle="dropdown" aria-expanded="false">

                      Button

                    </button>

                    <span className="dropdown-menu" role="menu">

                      <ul className="dropdown-menu-list">

                        <li>

                          <a href="#">

                            Action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Another action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Something else here

                          </a>

                        </li>

                      </ul>

                    </span>

                  </div>

                  <div className="button-group">

                    <button type="button" className="button button-danger button-rounded button-stroke dropdown-toggle" data-toggle="dropdown" aria-expanded="false">

                      Button

                    </button>

                    <span className="dropdown-menu" role="menu">

                      <ul className="dropdown-menu-list">

                        <li>

                          <a href="#">

                            Action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Another action

                          </a>

                        </li>

                        <li>

                          <a href="#">

                            Something else here

                          </a>

                        </li>

                      </ul>

                    </span>

                  </div>

                </div>

              </div>

            </div>

          </section>

        </section>

        <section id="buttons-controls">

          <h2>

            Button Controls

          </h2>

          <p>

            Group a series of buttons together on a single line with the button group. Add on optional JavaScript radio and checkbox style behavior with our buttons plugin.

          </p>

          <section id="buttons-controls-toggle">

            <h3>

              Toggle Buttons

            </h3>

            <p>

              Add <code>data-toggle="button"</code> to activate toggling on a single button.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <button type="button" className="button button-primary" data-toggle="button" aria-pressed="false" autocomplete="off">

                  Toggle Button

                </button>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockButtonControlsToggles}

                </pre>

              </div>

            </div>

          </section>

          <section id="buttons-controls-button-groups">

            <h3>

              Checkbox &amp; Radio Button Groups

            </h3>

            <p>

              Add <code>data-toggle="buttons"</code> to a <code>.btn-group</code> containing checkbox or radio inputs to enable toggling in their respective styles.

            </p>

            <h4>

              Checkbox Button Groups

            </h4>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <div className="button-group" data-toggle="buttons">

                  <label className="button button-primary active">

                    <input type="checkbox" autocomplete="off" checked /> Checkbox 1

                  </label>

                  <label className="button button-primary">

                    <input type="checkbox" autocomplete="off" /> Checkbox 2

                  </label>

                  <label className="button button-primary">

                    <input type="checkbox" autocomplete="off" /> Checkbox 3

                  </label>

                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockButtonControlsButtonGroupsCheckboxes}

                </pre>

              </div>

            </div>

            <h4>

              Radio Button Groups

            </h4>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <div className="button-group" data-toggle="buttons">

                  <label className="button button-primary active">

                    <input type="radio" name="options" id="option1" autocomplete="off" checked /> Radio 1

                  </label>

                  <label className="button button-primary">

                    <input type="radio" name="options" id="option1" autocomplete="off" /> Radio 2

                  </label>

                  <label className="button button-primary">

                    <input type="radio" name="options" id="option1" autocomplete="off" /> Radio 3

                  </label>

                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockButtonControlsButtonGroupsRadios}

                </pre>

              </div>

            </div>

          </section>

        </section>

        <section id="buttons-content">

          <h2>

            Button Content

          </h2>

          <p>

            By default, buttons are defined so that all content will display vertically centered inside the button.  However, it may be necessary to place more than just text inside of a button.  For example, you may want a small icon next to the button label.  Space will be applied between child elements of a button automatically.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="button-collection flush-bottom">

                <a href="#" className="button">

                  <Icon id="plus" size="mini" family="mini" />

                  <span>

                    Button

                  </span>

                </a>

                <a href="#" className="button">

                  <span>

                    Button

                  </span>

                  <Icon id="arrow-right" size="mini" family="mini" />

                </a>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockButtonContent}

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
