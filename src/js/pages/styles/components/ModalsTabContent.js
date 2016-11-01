import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class ModalsTabContent extends React.Component {

  render() {

    let codeBlockModalExample =
`<button className="button" data-toggle="modal" data-target="#myModal">Show Modal</button>

<div className="modal fade" id="myModal">
  …
</div>`;

    let codeBlockModalStructure =
`<div className="modal">
  <div className="modal-header">
    …
  </div>
  <div className="modal-body">
    …
  </div>
  <div className="modal-footer">
    …
  </div>
</div>`;

    let codeBlockModalSizesSmall =
`<div className="modal modal-small modal-inline">
  …
</div>`;

    let codeBlockModalSizesLarge =
`<div className="modal modal-large modal-inline">
  …
</div>`;

    return (

      <div>

        <section id="modals-overview">

          <p className="lead">

            Modals are streamlined, but flexible, dialog prompts with the minimum required functionality and smart defaults.

          </p>

          <p>

            Use the class <code>.modal</code> in combination with one or more nested layout components to quickly create a new modal.  Below is an example of simple modal with a header, body, and footer.

          </p>

          <div className="panel panel-inverse flush-bottom">

            <div className="panel-cell panel-cell-inverse">

              <div className="modal modal-inline">

                <div className="modal-header">

                  <h5 className="modal-header-title flush">

                    Join Our Mailing List

                  </h5>

                </div>

                <div className="modal-body">

                  <p>

                    Stay updated on the latest news and releases from CNVS. Join our mailing list today. We hate spam too.

                  </p>

                  <div className="form flush-bottom">

                    <div className="row">

                      <div className="column-small-6">

                        <div className="form-group flush-bottom-screen-small">

                          <label>

                            Full Name

                          </label>

                          <input className="form-control" type="text" />

                        </div>

                      </div>

                      <div className="column-small-6">

                        <div className="form-group flush-bottom-screen-small">

                          <label>

                            Email

                          </label>

                          <input className="form-control" type="email" />

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                <div className="modal-footer">

                  <div className="button-collection flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small flex-justify-items-space-between-screen-medium">

                    <button className="button button-primary flex-item-order-1-screen-small flex-item-grow-1-screen-small flex-item-basis-none-screen-small flex-item-align-end-screen-medium flex-item-grow-0-screen-medium flex-item-basis-auto-screen-medium">

                      Submit

                    </button>

                    <button className="button flex-item-order-0-screen-small flex-item-grow-1-screen-small flex-item-basis-none-screen-small flex-item-align-start-screen-medium flex-item-grow-0-screen-medium flex-item-basis-auto-screen-medium">

                      Close

                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        <section id="modals-example">

          <h2>

            Example

          </h2>

          <p>

            Use a button or link to trigger the display of a modal.  CNVS uses the class <code>.fade</code> to hide the modal.  Adding the class <code>.in</code> to <code>.fade</code> will display the modal in.  You can easily override these class styles to create unique keyframe sequences for your project.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <button className="button" data-toggle="modal" data-target="#myModal">Show Modal</button>

              <div className="modal fade" id="myModal">

                <div className="modal-header">

                  <h5 className="modal-header-title flush">

                    Join Our Mailing List

                  </h5>

                </div>

                <div className="modal-body">

                  <p>

                    Stay updated on the latest news and releases from CNVS. Join our mailing list today. We hate spam too.

                  </p>

                  <div className="form flush-bottom">

                    <div className="row">

                      <div className="column-small-6">

                        <div className="form-group flush-bottom-screen-small">

                          <label>

                            Full Name

                          </label>

                          <input className="form-control" type="text" />

                        </div>

                      </div>

                      <div className="column-small-6">

                        <div className="form-group flush-bottom-screen-small">

                          <label>

                            Email

                          </label>

                          <input className="form-control" type="email" />

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                <div className="modal-footer">

                  <div className="button-collection flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small flex-justify-items-space-between-screen-medium">

                    <button className="button button-primary flex-item-order-1-screen-small flex-item-grow-1-screen-small flex-item-basis-none-screen-small flex-item-align-end-screen-medium flex-item-grow-0-screen-medium flex-item-basis-auto-screen-medium">

                      Submit

                    </button>

                    <button className="button flex-item-order-0-screen-small flex-item-grow-1-screen-small flex-item-basis-none-screen-small flex-item-align-start-screen-medium flex-item-grow-0-screen-medium flex-item-basis-auto-screen-medium" data-dismiss="modal">

                      Close

                    </button>

                  </div>

                </div>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockModalExample}

              </pre>

            </div>

          </div>

        </section>

        <section id="modals-structure">

          <h2>

            Modal Structure

          </h2>

          <p>

            To create a new modal use the <code>.modal</code> class. A modal is composed of 3 primary sections, all of which are optional and can be used interchangeably -- <code>.modal-header</code>, <code>.modal-body</code>, and <code>.modal-footer</code>.  Looking for just the body and footer? It's as simple as not including <code>.modal-header</code> in your modal.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="modal modal-inline">

                <div className="modal-header text-align-center">

                  <code>.modal-header</code>

                </div>

                <div className="modal-body text-align-center">

                  <code>.modal-body</code>

                </div>

                <div className="modal-footer text-align-center">

                  <code>.modal-footer</code>

                </div>

              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockModalStructure}

              </pre>

            </div>

          </div>

        </section>

        <section id="modals-sizes">

          <h2>

            Modal Sizes

          </h2>

          <p>

            Two additional modal sizes are provided by CNVS using the class modifiers <code>.modal-small</code> and <code>.modal-large</code>.  The class modifiers only impact the width of the modal and, if defined in CNVS, the inner padding of the header, body, and footer.

          </p>

          <section id="modals-sizes-small">

            <h3>

              Small Modal

            </h3>

            <p>

              Use the class modifier <code>.modal-small</code> to reduce the width of your modal.

            </p>

            <div className="panel panel-inverse flush-bottom">

              <div className="panel-cell panel-cell-inverse">

                <div className="modal modal-small modal-inline">

                  <div className="modal-content">

                    <div className="modal-header">

                      <h5 className="modal-header-title text-align-center flush">

                        Modal Header Title

                      </h5>

                    </div>

                    <div className="modal-body">

                      <p className="text-align-center flush">

                        Maecenas faucibus mollis interdum. Donec sed odio dui. Aenean lacinia bibendum nulla sed consectetur. Curabitur blandit tempus porttitor.

                      </p>

                    </div>

                    <div className="modal-footer">

                      <div className="button-collection flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small">

                        <button className="button flex-item-align-start-screen-medium flex-item-grow-1-screen-small flex-item-basis-none-screen-small">

                          Close

                        </button>

                        <button className="button button-primary flex-item-align-end-screen-medium flex-item-grow-1-screen-small flex-item-basis-none-screen-small">

                          Submit

                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              <div className="panel-cell panel-cell-dark panel-cell-inverse panel-cell-code-block">

                <pre className="prettyprint code-block-inverse transparent flush lang-html">

                  {codeBlockModalSizesSmall}

                </pre>

              </div>

            </div>

          </section>

          <section id="modals-sizes-large">

            <h3>

              Large Modal

            </h3>

            <p>

              Use the class modifier <code>.modal-large</code> to increase the width of your modal.

            </p>

            <div className="panel panel-inverse flush-bottom">

              <div className="panel-cell panel-cell-inverse">

                <div className="modal modal-large modal-inline">

                  <div className="modal-content">

                    <div className="modal-header">

                      <h5 className="modal-header-title flush">

                        Modal Header Title

                      </h5>

                    </div>

                    <div className="modal-body">

                      <p className="flush">

                        Maecenas faucibus mollis interdum. Donec sed odio dui. Aenean lacinia bibendum nulla sed consectetur. Curabitur blandit tempus porttitor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.

                      </p>

                    </div>

                    <div className="modal-footer">

                      <div className="button-collection flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small flex-justify-items-space-between-screen-medium">

                        <button className="button flex-item-align-start-screen-medium flex-item-grow-1-screen-small flex-item-basis-none-screen-small flex-item-grow-0-screen-medium flex-item-basis-auto-screen-medium">

                          Close

                        </button>

                        <button className="button button-primary flex-item-align-end-screen-medium flex-item-grow-1-screen-small flex-item-basis-none-screen-small flex-item-grow-0-screen-medium flex-item-basis-auto-screen-medium">

                          Submit

                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              <div className="panel-cell panel-cell-dark panel-cell-inverse panel-cell-code-block">

                <pre className="prettyprint code-block-inverse transparent flush lang-html">

                  {codeBlockModalSizesLarge}

                </pre>

              </div>

            </div>

          </section>

        </section>

      </div>

    );
  }
}

ModalsTabContent.contextTypes = {
  router: routerShape
};

ModalsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ModalsTabContent;
