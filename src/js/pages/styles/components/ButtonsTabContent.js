import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';
import Icon from '../../../components/Icon';

class ButtonTabContent extends React.Component {

  render() {

    let codeBlockButton =
`<button class="button">
  Simple Button
</button>`;
    let codeBlockButtonSizes =
`<!-- Button: Jumbo -->
<button class="button button-jumbo">
  Jumbo
</button>

<!-- Button: Large -->
<button class="button button-large">
  Large
</button>

<!-- Button: Default -->
<button class="button">
  Default
</button>

<!-- Button: Small -->
<button class="button button-small">
  Small
</button>

<!-- Button: Mini -->
<button class="button button-mini">
  Mini
</button>`;
    let codeBlockButtonStates =
`<!-- Button: Default -->
<button class="button">
  Default
</button>

<!-- Button: Primary -->
<button class="button button-primary">
  Primary
</button>

<!-- Button: Success -->
<button class="button button-success">
  Success
</button>

<!-- Button: Warning -->
<button class="button button-warning">
  Warning
</button>

<!-- Button: Danger -->
<button class="button button-danger">
  Danger
</button>`;
    let codeBlockButtonTypesRounded =
`<!-- Button: Default -->
<button class="button button-rounded">
  Default
</button>

<!-- Button: Primary -->
<button class="button button-rounded button-primary">
  Primary
</button>`;
    let codeBlockButtonTypesOutline =
`<!-- Button: Default -->
<button class="button button-outline">
  Default
</button>

<!-- Button: Primary -->
<button class="button button-primary-outline">
  Primary
</button>`;
    let codeBlockButtonTypesLink =
`<!-- Button: Default -->
<button class="button button-link">
  Default
</button>

<!-- Button: Primary -->
<button class="button button-primary-link">
  Primary
</button>`;
    let codeBlockButtonTypesCombined =
`<!-- Button: Default -->
<button class="button button-outline button-rounded">
  Default
</button>

<!-- Button: Primary -->
<button class="button button-primary-outline button-rounded">
  Primary
</button>`;
    let codeBlockButtonInverseStyling =
`<button class="button button-inverse">
  Default
</button>`;
    let codeBlockButtonWide =
`<button class="button button-wide">
  Wide Button
</button>`;
    let codeBlockButtonNarrow =
`<button class="button button-narrow">
  Narrow Button
</button>`;
    let codeBlockButtonBlock =
`<button class="button button-block">
  Block Button
</button>`;
    let codeBlockButtonBlockResponsive =
`<!-- Block Button: When Smaller than Screen Mini-->
<button class="button button-block button-block-below-screen-small">
  Block Button (Mini)
</button>

<!-- Block Button: When Smaller than Screen Small-->
<button class="button button-block button-block-below-screen-medium">
  Block Button (Small)
</button>

<!-- Block Button: When Smaller than Screen Medium-->
<button class="button button-block button-block-below-screen-large">
  Block Button (Medium)
</button>

<!-- Block Button: When Smaller than Screen Large-->
<button class="button button-block button-block-below-screen-jumbo">
  Block Button (Large)
</button>`;
    let codeBlockButtonDropdowns =
`<div class="button-group">
  <button type="button" class="button dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
    Toggle Button
  </button>
  <span class="dropdown-menu" role="menu">
    <ul class="dropdown-menu-list">
      <li>
        <button>
          Action
        </button>
      </li>
      <li>
        <button>
          Another action
        </button>
      </li>
      <li>
        <button>
          Something else here
        </button>
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
      …
    </span>
  </div>

  <div class="button-group">
    <button type="button" class="button button-large dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
      Large
    </button>
    <span class="dropdown-menu" role="menu">
      …
    </span>
  </div>

  <div class="button-group">
    <button type="button" class="button dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
      Medium
    </button>
    <span class="dropdown-menu" role="menu">
      …
    </span>
  </div>

  <div class="button-group">
    <button type="button" class="button button-small dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
      Small
    </button>
    <span class="dropdown-menu" role="menu">
      …
    </span>
  </div>

  <div class="button-group">
    <button type="button" class="button button-mini dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
      Mini
    </button>
    <span class="dropdown-menu" role="menu">
      …
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
<button class="button">
  <i class="icon icon-mini"></i>
  <span>Button</span>
</button>`;

    return (

      <div>

        <p>

          Canvas adds support for a range of button states and sizes.  Simply add the <code>.button</code> class to any <code>&lt;a&gt;</code> or <code>&lt;button&gt;</code> to get started.

        </p>

        <div className="panel flush-bottom">

          <div className="panel-cell">

            <button className="button">

              Simple Button

            </button>

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

            <div className="panel-cell panel-cell-light">

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

                <button className="button">

                  Default

                </button>

                <button className="button button-primary">

                  Primary

                </button>

                <button className="button button-success">

                  Success

                </button>

                <button className="button button-warning">

                  Warning

                </button>

                <button className="button button-danger">

                  Danger

                </button>

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

                  <button className="button button-rounded">

                    Default

                  </button>

                  <button className="button button-rounded button-primary">

                    Primary

                  </button>

                  <button className="button button-rounded button-success">

                    Success

                  </button>

                  <button className="button button-rounded button-warning">

                    Warning

                  </button>

                  <button className="button button-rounded button-danger">

                    Danger

                  </button>

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

                  <button className="button button-outline">

                    Default

                  </button>

                  <button className="button button-primary-outline">

                    Primary

                  </button>

                  <button className="button button-success-outline">

                    Success

                  </button>

                  <button className="button button-warning-outline">

                    Warning

                  </button>

                  <button className="button button-danger-outline">

                    Danger

                  </button>

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

                  <button className="button button-link">

                    Default

                  </button>

                  <button className="button button-primary-link">

                    Primary

                  </button>

                  <button className="button button-success-link">

                    Success

                  </button>

                  <button className="button button-warning-link">

                    Warning

                  </button>

                  <button className="button button-danger-link">

                    Danger

                  </button>

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

                  <button className="button button-outline button-rounded">

                    Default

                  </button>

                  <button className="button button-primary-outline button-rounded">

                    Primary

                  </button>

                  <button className="button button-success-outline button-rounded">

                    Success

                  </button>

                  <button className="button button-warning-outline button-rounded">

                    Warning

                  </button>

                  <button className="button button-danger-outline button-rounded">

                    Danger

                  </button>

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

                <button className="button button-inverse">

                  Default

                </button>

                <button className="button button-primary button-inverse">

                  Primary

                </button>

                <button className="button button-success button-inverse">

                  Success

                </button>

                <button className="button button-warning button-inverse">

                  Warning

                </button>

                <button className="button button-danger button-inverse">

                  Danger

                </button>

              </div>

              <div className="button-collection">

                <button className="button button-outline button-inverse">

                  Default

                </button>

                <button className="button button-primary-outline button-inverse">

                  Primary

                </button>

                <button className="button button-success-outline button-inverse">

                  Success

                </button>

                <button className="button button-warning-outline button-inverse">

                  Warning

                </button>

                <button className="button button-danger-outline button-inverse">

                  Danger

                </button>

              </div>

              <div className="button-collection flush-bottom">

                <button className="button button-link button-inverse">

                  Default

                </button>

                <button className="button button-primary-link button-inverse">

                  Primary

                </button>

                <button className="button button-success-link button-inverse">

                  Success

                </button>

                <button className="button button-warning-link button-inverse">

                  Warning

                </button>

                <button className="button button-danger-link button-inverse">

                  Danger

                </button>

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

                <button className="button button-wide">

                  Wide Button

                </button>

                <button className="button button-primary button-wide">

                  Wide Button

                </button>

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

                <button className="button button-narrow">

                  Narrow Button

                </button>

                <button className="button button-primary button-narrow">

                  Narrow Button

                </button>

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

                <button className="button button-block">

                  Block Button

                </button>

                <button className="button button-primary button-block">

                  Block Button

                </button>

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

                  <button className="button button-block button-block-below-screen-small">

                    Block Button (Mini)

                  </button>

                  <button className="button button-block button-block-below-screen-medium">

                    Block Button (Small)

                  </button>

                  <button className="button button-block button-block-below-screen-large">

                    Block Button (Medium)

                  </button>

                  <button className="button button-block button-block-below-screen-jumbo">

                    Block Button (Large)

                  </button>

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

                        <button>

                          Action

                        </button>

                      </li>

                      <li>

                        <button>

                          Another action

                        </button>

                      </li>

                      <li>

                        <button>

                          Something else here

                        </button>

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

                          <button>

                            Action

                          </button>

                        </li>

                        <li>

                          <button>

                            Another action

                          </button>

                        </li>

                        <li>

                          <button>

                            Something else here

                          </button>

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

                          <button>

                            Action

                          </button>

                        </li>

                        <li>

                          <button>

                            Another action

                          </button>

                        </li>

                        <li>

                          <button>

                            Something else here

                          </button>

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

                          <button>

                            Action

                          </button>

                        </li>

                        <li>

                          <button>

                            Another action

                          </button>

                        </li>

                        <li>

                          <button>

                            Something else here

                          </button>

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

                          <button>

                            Action

                          </button>

                        </li>

                        <li>

                          <button>

                            Another action

                          </button>

                        </li>

                        <li>

                          <button>

                            Something else here

                          </button>

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

                          <button>

                            Action

                          </button>

                        </li>

                        <li>

                          <button>

                            Another action

                          </button>

                        </li>

                        <li>

                          <button>

                            Something else here

                          </button>

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

                          <button>

                            Action

                          </button>

                        </li>

                        <li>

                          <button>

                            Another action

                          </button>

                        </li>

                        <li>

                          <button>

                            Something else here

                          </button>

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

                          <button>

                            Action

                          </button>

                        </li>

                        <li>

                          <button>

                            Another action

                          </button>

                        </li>

                        <li>

                          <button>

                            Something else here

                          </button>

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

                          <button>

                            Action

                          </button>

                        </li>

                        <li>

                          <button>

                            Another action

                          </button>

                        </li>

                        <li>

                          <button>

                            Something else here

                          </button>

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

                          <button>

                            Action

                          </button>

                        </li>

                        <li>

                          <button>

                            Another action

                          </button>

                        </li>

                        <li>

                          <button>

                            Something else here

                          </button>

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

                          <button>

                            Action

                          </button>

                        </li>

                        <li>

                          <button>

                            Another action

                          </button>

                        </li>

                        <li>

                          <button>

                            Something else here

                          </button>

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

                          <button>

                            Action

                          </button>

                        </li>

                        <li>

                          <button>

                            Another action

                          </button>

                        </li>

                        <li>

                          <button>

                            Something else here

                          </button>

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

                          <button>

                            Action

                          </button>

                        </li>

                        <li>

                          <button>

                            Another action

                          </button>

                        </li>

                        <li>

                          <button>

                            Something else here

                          </button>

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

                <button type="button" className="button button-primary" data-toggle="button" aria-pressed="false" autoComplete="off">

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

                    <input type="checkbox" autoComplete="off" checked /> Checkbox 1

                  </label>

                  <label className="button button-primary">

                    <input type="checkbox" autoComplete="off" /> Checkbox 2

                  </label>

                  <label className="button button-primary">

                    <input type="checkbox" autoComplete="off" /> Checkbox 3

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

                    <input type="radio" name="options" id="option1" autoComplete="off" checked /> Radio 1

                  </label>

                  <label className="button button-primary">

                    <input type="radio" name="options" id="option1" autoComplete="off" /> Radio 2

                  </label>

                  <label className="button button-primary">

                    <input type="radio" name="options" id="option1" autoComplete="off" /> Radio 3

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

                <button className="button">

                  <Icon id="plus" size="mini" family="mini" />

                  <span>

                    Button

                  </span>

                </button>

                <button className="button">

                  <span>

                    Button

                  </span>

                  <Icon id="arrow-right" size="mini" family="mini" />

                </button>

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
  router: routerShape
};

ButtonTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ButtonTabContent;
