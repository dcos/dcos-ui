import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class ModalsTabContent extends React.Component {

  render() {
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

                    <a href="#" className="button button-primary flex-item-order-1-screen-small flex-item-grow-1-screen-small flex-item-basis-none-screen-small flex-item-align-end-screen-medium flex-item-grow-0-screen-medium flex-item-basis-auto-screen-medium">

                      Submit

                    </a>

                    <a href="#" className="button flex-item-order-0-screen-small flex-item-grow-1-screen-small flex-item-basis-none-screen-small flex-item-align-start-screen-medium flex-item-grow-0-screen-medium flex-item-basis-auto-screen-medium">

                      Close

                    </a>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    );
  }
}

ModalsTabContent.contextTypes = {
  router: React.PropTypes.func
};

ModalsTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = ModalsTabContent;
