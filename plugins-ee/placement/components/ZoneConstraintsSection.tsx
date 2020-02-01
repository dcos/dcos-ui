import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";

import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";

export default class ZoneConstraintsSection extends React.Component {
  static propTypes = {
    zone: PropTypes.string,
    onEditClick: PropTypes.func
  };
  getEditButton() {
    const { onEditClick } = this.props;

    return (
      <Trans
        render={
          <a
            className="button button-link flush table-display-on-row-hover"
            onClick={onEditClick.bind(null, "placement")}
          />
        }
      >
        Edit
      </Trans>
    );
  }

  render() {
    const { zone, onEditClick } = this.props;

    if (!zone) {
      return <noscript />;
    }

    return (
      <ConfigurationMapRow>
        <ConfigurationMapLabel>
          <Trans render="span">Number of Zones</Trans>
        </ConfigurationMapLabel>
        <ConfigurationMapValue>{zone}</ConfigurationMapValue>
        {Boolean(onEditClick) && this.getEditButton()}
      </ConfigurationMapRow>
    );
  }
}

ZoneConstraintsSection.defaultProps = {
  zone: "",
  onEditClick() {}
};
