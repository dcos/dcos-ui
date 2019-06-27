import React from "react";
import withRouter from "react-router/lib/withRouter";
import { Trans } from "@lingui/macro";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

interface EmptyServicesQuotaOverviewProps {
  router?: {
    push: (location: string) => void;
  };
}

class EmptyServicesQuotaOverview extends React.PureComponent<
  EmptyServicesQuotaOverviewProps,
  {}
> {
  constructor(props: EmptyServicesQuotaOverviewProps) {
    super(props);

    this.backToServices = this.backToServices.bind(this);
  }
  backToServices() {
    if (this.props.router) {
      this.props.router.push("/services/overview");
    }
  }
  render() {
    const footer = (
      <div className="button-collection flush-bottom">
        <Trans
          render={
            <button
              className="button button-primary"
              onClick={this.backToServices}
            />
          }
        >
          Back to Services
        </Trans>
      </div>
    );

    return (
      <AlertPanel>
        <Trans render={<AlertPanelHeader />}>No quota defined</Trans>
        <Trans render="p" className="tall">
          Edit or add a group to add quota and start monitoring your group
          consumption.
        </Trans>
        {footer}
      </AlertPanel>
    );
  }
}

export default withRouter(EmptyServicesQuotaOverview);
