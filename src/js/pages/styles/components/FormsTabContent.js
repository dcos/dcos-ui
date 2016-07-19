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
        <input type="text" className="form-control" placeholder="">
      </div>
    </div>
    <div className="column-small-6">
      <div className="form-group">
        <label>
          Last Name
        </label>
        <input type="text" className="form-control" placeholder="">
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
