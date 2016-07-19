import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

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

    let codeBlockFormControlsSizes =
`<input type="text" class="form-control form-control-mini" />
<input type="text" class="form-control form-control-small" />
<input type="text" class="form-control" />
<input type="text" class="form-control form-control-large" />
<input type="text" class="form-control form-control-jumbo" />`;

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

                {codeBlockFormControlsSizes}

              </pre>

            </div>

          </div>

        </section>

      </div>

    );
  }
}

FormTabContent.contextTypes = {
  router: React.PropTypes.func
};

FormTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = FormTabContent;
