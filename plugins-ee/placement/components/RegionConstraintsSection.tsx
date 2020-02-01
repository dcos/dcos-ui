import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";

import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";

export default class RegionConstraintsSection extends React.Component {
  static propTypes = {
    region: PropTypes.string,
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
    const { region, onEditClick } = this.props;

    if (!region) {
      return <noscript />;
    }

    return (
      <ConfigurationMapRow>
        <ConfigurationMapLabel>
          <Trans render="span">Region</Trans>
        </ConfigurationMapLabel>
        <ConfigurationMapValue>{region}</ConfigurationMapValue>
        {Boolean(onEditClick) && this.getEditButton()}
      </ConfigurationMapRow>
    );
  }
}

RegionConstraintsSection.defaultProps = {
  region: "",
  onEditClick() {}
};
