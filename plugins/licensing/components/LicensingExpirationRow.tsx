import { withI18n } from "@lingui/react";
import { Trans, DateFormat } from "@lingui/macro";
import * as React from "react";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import ToggleValue from "#SRC/js/components/ToggleValue";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import DateUtil from "#SRC/js/utils/DateUtil";
import LicensingStore from "../stores/LicensingStore";
import { LICENSING_SUMMARY_SUCCESS } from "../constants/EventTypes";

class LicensingExpirationRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      licensingSummary: LicensingStore.getLicensingSummary()
    };
  }

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

  render() {
    const { i18n } = this.props;
    const { licensingSummary } = this.state;

    if (!licensingSummary) {
      return null;
    }

    const primaryValue = licensingSummary.hasDaysBreach()
      ? licensingSummary.getDaysExceeded() + " " + i18n._("days overdue")
      : Math.abs(licensingSummary.getDaysExceeded()) +
        " " +
        i18n._("days left");

    const secondaryValue = (
      <DateFormat
        value={new Date(licensingSummary.getExpiration())}
        format={DateUtil.getFormatOptions("longMonthDateTime")}
      />
    );

    const docsURI = MetadataStore.buildDocsURI(
      "/administering-clusters/licenses"
    );

    return (
      <ConfigurationMapRow key="licensingExpiration">
        <Trans render={<ConfigurationMapLabel />}>License Expiration</Trans>
        <ConfigurationMapValue>
          <ToggleValue
            primaryValue={primaryValue}
            secondaryValue={secondaryValue}
          />
        </ConfigurationMapValue>

        <Trans
          render={
            <a
              href={docsURI}
              className="button button-primary-link text-no-transform"
              target="_blank"
            />
          }
        >
          Upgrade
        </Trans>
      </ConfigurationMapRow>
    );
  }
}

export default withI18n()(LicensingExpirationRow);
