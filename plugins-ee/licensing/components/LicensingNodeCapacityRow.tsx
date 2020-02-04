import { Trans } from "@lingui/macro";
import * as React from "react";
import { Tooltip } from "reactjs-components";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  iconSizeXs,
  yellow
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import LicensingStore from "../stores/LicensingStore";
import LicensingConfig from "../config/LicensingConfig";
import { LICENSING_SUMMARY_SUCCESS } from "../constants/EventTypes";

export default class LicensingNodeCapacityRow extends React.Component {
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

  getWarningTooltip() {
    const { licensingSummary } = this.state;

    if (!licensingSummary.hasBreach()) {
      return null;
    }

    const numberBreaches = licensingSummary.getNumberBreaches();
    const description =
      numberBreaches === 1 ? (
        <Trans render="span">
          Exceeded licensed node count on one occasion.
        </Trans>
      ) : (
        <Trans render="span">
          Exceeded licensed node count on {numberBreaches} occasions.
        </Trans>
      );

    return (
      <Tooltip
        content={description}
        interactive={true}
        maxWidth={300}
        wrapText={true}
      >
        <Icon color={yellow} shape={SystemIcons.Yield} size={iconSizeXs} />
      </Tooltip>
    );
  }

  getLicensingFileLink() {
    return (
      <Trans
        render={
          <a
            className="button button-primary-link text-no-transform"
            download={"audit-data.tar"}
            href={`${LicensingConfig.licensingAPIPrefix}/audit`}
          />
        }
      >
        Usage Logs
      </Trans>
    );
  }

  render() {
    const { licensingSummary } = this.state;

    if (!licensingSummary) {
      return null;
    }

    return (
      <ConfigurationMapRow key="licensingNodeCapacity">
        <Trans render={<ConfigurationMapLabel />}>Node Capacity</Trans>
        <ConfigurationMapValue>
          {`${licensingSummary.getNodeCapacity()} nodes`}{" "}
          {this.getWarningTooltip()}
        </ConfigurationMapValue>
        {this.getLicensingFileLink()}
      </ConfigurationMapRow>
    );
  }
}
