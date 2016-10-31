import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';
import Icon from '../../../components/Icon';

class FormTabContent extends React.Component {

  render() {

    let codeBlockFormOverview =
`<form className="form flush-bottom">
  <div className="row">
    <div className="column-small-6">
      <div className="form-group">
        <label>
          First Name
        </label>
        <input type="text" className="form-control" placeholder="" />
      </div>
    </div>
    <div className="column-small-6">
      <div className="form-group">
        <label>
          Last Name
        </label>
        <input type="text" className="form-control" placeholder="" />
      </div>
    </div>
  </div>
  …
  <div className="button-collection flush-bottom">
    <button type="submit" className="button button-primary">
      Submit
    </button>
  </div>
</form>`;

    let codeBlockFormControls =
`<div className="form-group">
  <input type="text" className="form-control" placeholder="Placeholder Text" />
</div>`;

    let codeBlockFormControlsTextArea =
`<div className="form-group">
  <textarea className="form-control" placeholder="Placeholder Text" rows="4"></textarea>
</div>`;

    let codeBlockFormControlsCheckboxes =
`<div className="form-group">
  <div className="checkbox">
    <label>
      <input type="checkbox">
      First Option
    </label>
  </div>
  <div className="checkbox">
    <label>
      <input type="checkbox">
      Second Option
    </label>
  </div>
  …
</div>`;

    let codeBlockFormControlsSelects =
`<div className="form-group">
  <span className="form-control form-control-select">
    <select>
      <option>1</option>
      <option>2</option>
      <option>…</option>
    </select>
  </span>
</div>

<div className="form-group">
  <span className="form-control form-control-select form-control-select-multiple">
    <select multiple>
      <option>1</option>
      <option>2</option>
      <option>…</option>
    </select>
  </span>
</div>`;

    let codeBlockFormControlSizes =
`<input type="text" className="form-control form-control-mini" />
<input type="text" className="form-control form-control-small" />
<input type="text" className="form-control" />
<input type="text" className="form-control form-control-large" />
<input type="text" className="form-control form-control-jumbo" />`;

    let codeBlockFormControlStates =
`<div className="form-group">
  <label>
    Default Input
  </label>
  <input type="text" className="form-control" placeholder="Placeholder" />
  <p className="small flush-bottom">
    Example block-level help text here.
  </p>
</div>

<div className="form-group form-group-success">
  <label>
    Success Input
  </label>
  <input type="text" className="form-control" placeholder="Placeholder" />
  <p className="small flush-bottom">
    Example block-level help text here.
  </p>
</div>

<div className="form-group form-group-danger">
  <label>
    Danger Input
  </label>
  <input type="text" className="form-control" placeholder="Placeholder" />
  <p className="small flush-bottom">
    Example block-level help text here.
  </p>
</div>`;

    let codeBlockFormControlInverse =
`<div className="form-group">
  <label className="inverse">
    …
  </label>
  <input type="text" className="form-control form-control-inverse" />
  <p className="small flush-bottom inverse">
    …
  </p>
</div>`;

    let codeBlockFormHelpBlock =
`<div className="form-group">
  <label>
  Input with help text
  </label>
  <input type="text" className="form-control" placeholder="Placeholder" />
  <p className="small flush-bottom">
    A block of help text that breaks onto a new line and may extend beyond one line.
  </p>
</div>`;

    let codeBlockFormControlGroups =
`<!-- Input With Add On Before -->

<div className="form-control-group">
  <div className="form-control-group-add-on">
    &hellip;
  </div>
  <input type="text" className="form-control" placeholder="Placeholder" />
</div>

<!-- Input With Add On After -->

<div className="form-control-group">
  <input type="text" className="form-control" placeholder="Placeholder" />
  <div className="form-control-group-add-on">
    &hellip;
  </div>
</div>

<!-- Input With Nested Add On Before -->

<div className="form-control-group form-control">
  <span className="form-control-group-add-on form-control-group-add-on-prepend">
    &hellip;
  </span>
  <input type="text" className="form-control" placeholder="Placeholder" />
</div>

<!-- Input With Nested Add On After -->

<div className="form-control-group form-control">
  <input type="text" className="form-control" placeholder="Placeholder" />
  <span className="form-control-group-add-on form-control-group-add-on-append">
    &hellip;
  </span>
</div>

<!-- Input With Nested Add On Before &amp; After -->

<div className="form-control-group form-control">
  <span className="form-control-group-add-on form-control-group-add-on-prepend">
    &hellip;
  </span>
  <input type="text" className="form-control" placeholder="Placeholder" />
  <span className="form-control-group-add-on form-control-group-add-on-append">
    &hellip;
  </span>
</div>`;

    return (
      <div>

        <p>

          Individual form controls automatically receive some global styling. All textual <code>&lt;input&gt;</code>, <code>&lt;textarea&gt;</code>, and <code>&lt;select&gt;</code> elements with <code>.form-control</code> are set to <code>width: 100%;</code> by default. Wrap labels and controls in <code>.form-group</code> for optimum spacing.

        </p>

        <div className="panel flush-bottom">

          <div className="panel-cell">

            <form className="form flush-bottom">

              <div className="row">

                <div className="column-small-6">

                  <div className="form-group">

                    <label>

                      First Name

                    </label>

                    <input type="text" className="form-control" placeholder="" />

                  </div>

                </div>

                <div className="column-small-6">

                  <div className="form-group">

                    <label>

                      Last Name

                    </label>

                    <input type="text" className="form-control" placeholder="" />

                  </div>

                </div>

                <div className="column-small-6">

                  <div className="form-group">

                    <label>

                      Email address

                    </label>

                    <input type="email" className="form-control" placeholder="email@domain.com" />

                    <p className="small flush-bottom">

                      Please provide a valid email.

                    </p>

                  </div>

                </div>

                <div className="column-small-6">

                  <div className="form-group">

                    <label>

                      Password

                    </label>

                    <input type="password" className="form-control" placeholder="" />

                    <p className="small flush-bottom">

                      Must include atleast 1 number and 1 symbol.

                    </p>

                  </div>

                </div>

                <div className="column-small-12">

                  <div className="form-group">

                    <label>

                      About Me

                    </label>

                    <textarea className="form-control" rows="3"></textarea>

                  </div>

                </div>

                <div className="column-small-12">

                  <div className="form-group">

                    <label>

                      I am a...

                    </label>

                    <div className="radio">

                      <label>

                        <input type="radio" name="radio-group-a" checked="checked" />

                        Man

                      </label>

                    </div>

                    <div className="radio">

                      <label>

                        <input type="radio" name="radio-group-a" />

                        Woman

                      </label>

                    </div>

                    <div className="radio">

                      <label>

                        <input type="radio" name="radio-group-a" />

                        Prefer not to say

                      </label>

                    </div>

                  </div>

                </div>

              </div>

              <div className="button-collection flush-bottom">

                <button type="submit" className="button button-primary">

                  Submit

                </button>

              </div>

            </form>

          </div>

          <div className="panel-cell panel-cell-light panel-cell-code-block">

            <pre className="prettyprint transparent flush lang-html">

              {codeBlockFormOverview}

            </pre>

          </div>

        </div>

        <section id="forms-controls">

          <h2>

            Form Controls

          </h2>

          <section id="forms-controls-inputs">

            <h3>

              Inputs

            </h3>

            <p>

              Donec ullamcorper nulla non metus auctor fringilla. Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec id elit non mi porta gravida at eget metus.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <form className="form flush-bottom">

                  <div className="row">

                    <div className="column-small-12">

                      <div className="form-group flush-bottom">

                        <input type="text" className="form-control" placeholder="Placeholder Text" />

                      </div>

                    </div>

                  </div>

                </form>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFormControls}

                </pre>

              </div>

            </div>

          </section>

          <section id="forms-controls-textarea">

            <h3>

              Textarea

            </h3>

            <p>

              Donec ullamcorper nulla non metus auctor fringilla. Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec id elit non mi porta gravida at eget metus.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <form className="form flush-bottom">

                  <div className="row">

                    <div className="column-small-12">

                      <div className="form-group flush-bottom">

                        <textarea className="form-control" placeholder="Placeholder Text" rows="4"></textarea>

                      </div>

                    </div>

                  </div>

                </form>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFormControlsTextArea}

                </pre>

              </div>

            </div>

          </section>

          <section id="forms-controls-checkboxes-and-radios">

            <h3>

              Checkboxes &amp; Radios

            </h3>

            <p>

              Donec ullamcorper nulla non metus auctor fringilla. Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec id elit non mi porta gravida at eget metus.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <form className="form flush-bottom">

                  <div className="row">

                    <div className="column-small-12">

                      <div className="form-group">

                        <div className="checkbox">

                          <label>

                            <input type="checkbox" />

                            First Option

                          </label>

                        </div>

                        <div className="checkbox">

                          <label>

                            <input type="checkbox" />

                            Second Option

                          </label>

                        </div>

                        <div className="checkbox disabled">

                          <label>

                            <input type="checkbox" disabled="" />

                            Third Option (Disabled)

                          </label>

                        </div>

                      </div>

                      <div className="form-group flush-bottom">

                        <div className="radio">

                          <label>

                            <input type="radio" name="sample-radio-group" checked="" />

                            First Option

                          </label>

                        </div>

                        <div className="radio">

                          <label>

                            <input type="radio" name="sample-radio-group" />

                            Second Option

                          </label>

                        </div>

                        <div className="radio disabled">

                          <label>

                            <input type="radio" name="sample-radio-group" disabled="" />

                            Third Option (Disabled)

                          </label>

                        </div>

                      </div>

                    </div>

                  </div>

                </form>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFormControlsCheckboxes}

                </pre>

              </div>

            </div>

          </section>

          <section id="forms-controls-selects">

            <h3>

              Selects

            </h3>

            <p>

              Default styling for <code>select</code> elements are available, or mirror custom control styling by wrapping any select in <code>.form-control</code> class and add the additional class <code>.form-control-select</code>.  For selects of type <code>multiple</code> add the class <code>.form-control-select-multiple</code>.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <form className="form flush-bottom">

                  <div className="row">

                    <div className="column-small-12">

                      <div className="form-group">

                        <span className="form-control form-control-select">

                          <select>

                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>

                          </select>

                        </span>

                      </div>

                      <div className="form-group flush-bottom">

                        <span className="form-control form-control-select form-control-select-multiple">

                          <select multiple>

                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>

                          </select>

                        </span>

                      </div>

                    </div>

                  </div>

                </form>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFormControlsSelects}

                </pre>

              </div>

            </div>

          </section>

        </section>

        <section id="forms-controls-sizes">

          <h2>

            Control Sizes

          </h2>

          <p>

            Donec ullamcorper nulla non metus auctor fringilla. Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec id elit non mi porta gravida at eget metus.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <form className="form flush-bottom">

                <div className="form-group">

                  <label>

                    Mini

                  </label>

                  <input type="text" className="form-control form-control-mini" placeholder="Input (Mini)" />

                </div>

                <div className="form-group">

                  <label>

                    Small

                  </label>

                  <input type="text" className="form-control form-control-small" placeholder="Input (Small)" />

                </div>

                <div className="form-group">

                  <label>

                    Default

                  </label>

                  <input type="text" className="form-control" placeholder="Input (Default)" />

                </div>

                <div className="form-group">

                  <label>

                    Large

                  </label>

                  <input type="text" className="form-control form-control-large" placeholder="Input (Large)" />

                </div>

                <div className="form-group flush-bottom">

                  <label>

                    Jumbo

                  </label>

                  <input type="text" className="form-control form-control-jumbo" placeholder="Input (Jumbo)" />

                </div>

              </form>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockFormControlSizes}

              </pre>

            </div>

          </div>

        </section>

        <section id="forms-controls-states">

          <h2>

            Control States

          </h2>

          <section id="forms-controls-states-focus">

            <h3>

              Focus

            </h3>

            <p>

              For form controls, we remove the default <code>outline</code> style added by most browsers.  On <code>:focus</code> we apply user-defined styling.  Similar styling attributes can be defined for the <code>:hover</code> state.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <form className="form flush-bottom">

                  <div className="row">

                    <div className="column-small-12">

                      <div className="form-group flush-bottom">

                        <input type="text" className="form-control focus" id="form-control-focus" placeholder="Placeholder Text" />

                      </div>

                    </div>

                  </div>

                </form>

              </div>

            </div>

          </section>

          <section id="forms-controls-states-disabled">

            <h3>

              Disabled

            </h3>

            <p>

              Add the <code>disabled</code> boolean attribute on an input to prevent user input and trigger a slightly different look.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <form className="form flush-bottom">

                  <div className="row">

                    <div className="column-small-12">

                      <div className="form-group flush-bottom">

                        <input type="text" className="form-control" placeholder="Placeholder Text" disabled />

                      </div>

                    </div>

                  </div>

                </form>

              </div>

            </div>

          </section>

          <section id="forms-controls-states-validation">

            <h3>

              Validation

            </h3>

            <p>

              Canvas includes validation states for success and error states for all form elements including <code>.form-control</code>, <code>checkbox</code>, and <code>label</code>.  Simply add class <code>.form-group-success</code> or <code>.form-group-error</code> to any <code>.form-group</code> and all components inside will reflect the appropriate state styling.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <form className="form flush-bottom">

                  <div className="row">

                    <div className="column-small-6">

                      <div className="form-group">

                        <label>

                          Default Input

                        </label>

                        <input type="text" className="form-control" placeholder="Placeholder" />

                        <p className="small flush-bottom">

                          Example block-level help text here.

                        </p>

                      </div>

                    </div>

                    <div className="column-small-6">

                      <div className="form-group">

                        <label>

                          Default Select

                        </label>

                        <span className="form-control form-control-select">

                          <select>

                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>

                          </select>

                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="row">

                    <div className="column-small-6">

                      <div className="form-group form-group-success">

                        <label>

                          Success Input

                        </label>

                        <input type="text" className="form-control form-control-success" placeholder="Placeholder" />

                        <p className="small flush-bottom">

                          Example block-level help text here.

                        </p>

                      </div>

                    </div>

                    <div className="column-small-6">

                      <div className="form-group form-group-success">

                        <label>

                          Success Select

                        </label>

                        <span className="form-control form-control-success form-control-select">

                          <select>

                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>

                          </select>

                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="row">

                    <div className="column-small-6">

                      <div className="form-group form-group-error">

                        <label>

                          Error Input

                        </label>

                        <input type="text" className="form-control form-control-error" placeholder="Input (Error)" />

                        <p className="small flush-bottom">

                          Example block-level help text here.

                        </p>

                      </div>

                    </div>

                    <div className="column-small-6">

                      <div className="form-group form-group-error">

                        <label>

                          Error Select

                        </label>

                        <span className="form-control form-control-error form-control-select">

                          <select>

                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>

                          </select>

                        </span>

                      </div>

                    </div>

                  </div>

                </form>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFormControlStates}

                </pre>

              </div>

            </div>

          </section>

        </section>

        <section id="forms-controls-inverse-styling">

          <h2>

            Inverse Styling

          </h2>

          <p>

            Donec ullamcorper nulla non metus auctor fringilla. Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec id elit non mi porta gravida at eget metus.

          </p>

          <div className="panel panel-inverse">

            <div className="panel-cell panel-cell-inverse">

              <form className="form flush-bottom">

                <div className="row">

                  <div className="column-small-6">

                    <div className="form-group">

                      <label className="inverse">

                        First Name

                      </label>

                      <input type="text" className="form-control form-control-inverse" placeholder="" />

                    </div>

                  </div>

                  <div className="column-small-6">

                    <div className="form-group">

                      <label className="inverse">

                        Last Name

                      </label>

                      <input type="text" className="form-control form-control-inverse" placeholder="" />

                    </div>

                  </div>

                </div>

                <div className="row">

                  <div className="column-small-6">

                    <div className="form-group">

                      <label className="inverse">

                        Email address

                      </label>

                      <input type="email" className="form-control form-control-inverse" placeholder="email@domain.com" />

                      <p className="small flush-bottom inverse">

                        Please provide a valid email.

                      </p>

                    </div>

                  </div>

                  <div className="column-small-6">

                    <div className="form-group">

                      <label className="inverse">

                        Password

                      </label>

                      <input type="password" className="form-control form-control-inverse" placeholder="" />

                      <p className="small flush-bottom inverse">

                        Must include atleast 1 number and 1 symbol.

                      </p>

                    </div>

                  </div>

                </div>

                <div className="row">

                  <div className="column-small-12">

                    <div className="form-group">

                      <label className="inverse">

                        About Me

                      </label>

                      <textarea className="form-control form-control-inverse"></textarea>

                    </div>

                  </div>

                </div>

                <div className="button-collection flush-bottom">

                  <button type="submit" className="button button-primary button-stroke button-inverse">

                    Submit

                  </button>

                </div>

              </form>

            </div>

            <div className="panel-cell panel-cell-dark panel-cell-inverse panel-cell-code-block">

              <pre className="prettyprint code-block-inverse transparent flush lang-html">

                {codeBlockFormControlInverse}

              </pre>

            </div>

          </div>

        </section>

        <section id="forms-help-block">

          <h2>

            Help Block

          </h2>

          <p>

            Block level help text or hint text for form controls.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <form className="form flush-bottom">

                <div className="form-group flush-bottom">

                  <label>

                    Input with help text

                  </label>

                  <input type="text" className="form-control" placeholder="Placeholder" />

                  <p className="small flush-bottom">

                    A block of help text that breaks onto a new line and may extend beyond one line.

                  </p>

                </div>

              </form>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockFormHelpBlock}

              </pre>

            </div>

          </div>

        </section>

        <section id="forms-form-control-groups">

          <h2>

            Form Control Groups

          </h2>

          <p>

            Align elements alongside or inside <code>.form-control</code> elements by wrapping them in a <code>.form-control-group</code> element. Use the <code>.form-control-group-add-on</code> element to position elements.  If you add <code>.form-control</code> to the wrapping <code>.form-control-group</code> the <code>.form-control-group-add-on</code> will live inside the <code>.form-control</code> rather than outside it.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <form className="form flush-bottom">

                <div className="form-group">

                  <label>

                    Input With Add On (Before)

                  </label>

                  <div className="form-control-group">

                    <div className="form-control-group-add-on">

                      <button className="button">

                        Test

                      </button>

                    </div>

                    <input type="text" className="form-control" placeholder="Placeholder" />

                  </div>

                </div>

                <div className="form-group">

                  <label>

                    Input With Add On (After)

                  </label>

                  <div className="form-control-group">

                    <input type="text" className="form-control" placeholder="Placeholder" />

                    <div className="form-control-group-add-on">

                      <button className="button">

                        Test

                      </button>

                    </div>

                  </div>

                </div>

                <div className="form-group">

                  <label>

                    Input With Nested Add On (Before)

                  </label>

                  <div className="form-control-group form-control">

                    <span className="form-control-group-add-on form-control-group-add-on-prepend">

                      <Icon id="arrow-right" size="mini" family="mini" />

                    </span>

                    <input type="text" className="form-control" placeholder="Placeholder" />

                  </div>

                </div>

                <div className="form-group">

                  <label>

                    Input With Nested Add On (After)

                  </label>

                  <div className="form-control-group form-control">

                    <input type="text" className="form-control" placeholder="Placeholder" />

                    <span className="form-control-group-add-on form-control-group-add-on-append">

                      <Icon id="arrow-right" size="mini" family="mini" />

                    </span>

                  </div>

                </div>

                <div className="form-group flush-bottom">

                  <label>

                    Input With Nested Add On (Before & After)

                  </label>

                  <div className="form-control-group form-control">

                    <span className="form-control-group-add-on form-control-group-add-on-prepend">

                      <Icon id="arrow-right" size="mini" family="mini" />

                    </span>

                    <input type="text" className="form-control" placeholder="Placeholder" />

                    <span className="form-control-group-add-on form-control-group-add-on-append">

                      <Icon id="arrow-right" size="mini" family="mini" />

                    </span>

                  </div>

                </div>

              </form>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockFormControlGroups}

              </pre>

            </div>

          </div>

        </section>

      </div>

    );
  }
}

FormTabContent.contextTypes = {
  router: routerShape
};

FormTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = FormTabContent;
