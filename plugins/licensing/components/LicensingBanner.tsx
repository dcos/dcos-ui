import { Trans } from "@lingui/macro";
import * as React from "react";
import { routerShape } from "react-router";
import { InfoBoxBanner } from "@dcos/ui-kit";
import LicensingStore from "../stores/LicensingStore";
import { LICENSING_SUMMARY_SUCCESS } from "../constants/EventTypes";

class LicensingBanner extends React.Component {
  state = { licensingSummary: LicensingStore.getLicensingSummary() };

  componentDidMount() {
    LicensingStore.addChangeListener(
      LICENSING_SUMMARY_SUCCESS,
      this.onLicensingStoreLicensingSummarySuccess
    );
  }

  componentWillUnmount() {
    LicensingStore.removeChangeListener(
      LICENSING_SUMMARY_SUCCESS,
      this.onLicensingStoreLicensingSummarySuccess
    );
  }
  onLicensingStoreLicensingSummarySuccess = () => {
    const licensingSummary = LicensingStore.getLicensingSummary();

    this.setState({ licensingSummary });
  };

  getBannerMessage() {
    const { licensingSummary } = this.state;

    const numberBreaches = licensingSummary.getNumberBreaches();
    const capacity = licensingSummary.getNodeCapacity();

    const breachFragment =
      numberBreaches === 1 ? (
        <Trans render="span">
          You have exceeded your {capacity} node licensed count. You have
          exceeded on 1 occasion
        </Trans>
      ) : (
        <Trans render="span">
          You have exceeded your {capacity} node licensed count. You have
          exceeded on {numberBreaches} occasions
        </Trans>
      );

    const daysExceeded = licensingSummary.getDaysExceeded();
    const daysBreachFragment =
      licensingSummary.hasDaysBreach() && daysExceeded === 1 ? (
        <Trans render="span">exceeded license expiration by one day</Trans>
      ) : (
        <Trans render="span">
          exceeded license expiration by {daysExceeded} days
        </Trans>
      );

    if (numberBreaches === 1 && licensingSummary.hasDaysBreach()) {
      return (
        <span>
          <Trans render="span">You have</Trans> {daysBreachFragment}
        </span>
      );
    }
    if (licensingSummary.hasDaysBreach()) {
      return (
        <span>
          {breachFragment} <Trans render="span">and</Trans> {daysBreachFragment}
          .
        </span>
      );
    }

    return <span>{breachFragment}</span>;
  }
  handleClickMoreInformation = () => {
    const { router } = this.context;

    router.push("/cluster/overview");
  };

  render() {
    const { licensingSummary } = this.state;

    if (!licensingSummary || !licensingSummary.hasBreach()) {
      return null;
    }

    return (
      <InfoBoxBanner
        appearance="warning"
        message={
          <div className="licensingBannerMsg">{this.getBannerMessage()}</div>
        }
        primaryAction={
          <div
            className="clickable button-link button-primary"
            onClick={this.handleClickMoreInformation}
            tabIndex={0}
            role="button"
          >
            <Trans render="span">More Information</Trans>
          </div>
        }
      />
    );
  }
}

LicensingBanner.contextTypes = {
  router: routerShape,
};

export default LicensingBanner;
