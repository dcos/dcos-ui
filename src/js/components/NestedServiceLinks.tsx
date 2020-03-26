import { Trans } from "@lingui/macro";
import classNames from "classnames/dedupe";
import { Link } from "react-router";
import PropTypes from "prop-types";
import * as React from "react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXxs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

export default class NestedServiceLinks extends React.Component {
  static defaultProps = {};
  static propTypes = {
    serviceLink: PropTypes.string.isRequired,
    serviceID: PropTypes.string.isRequired,
  };

  getMinorLink(label, id, key, minorLinkClasses, minorLinkAnchorClasses) {
    return (
      <div key={key} className="table-cell-value">
        <div className={minorLinkClasses}>
          <Link
            className={minorLinkAnchorClasses}
            to={`/services/overview/${id}`}
            title={label}
          >
            {label}
          </Link>
        </div>
      </div>
    );
  }

  getCrumbDivider(key) {
    return (
      <span className="list-inline-separator">
        <Icon shape={SystemIcons.CaretRight} key={key} size={iconSizeXxs} />
      </span>
    );
  }

  getMinorLinks() {
    let componentKey = 0;
    const minorLinkClasses = classNames("text-overflow service-link");
    const minorLinkAnchorClasses = classNames("table-cell-link-secondary");
    let nestedGroups = this.getServicePathParts();

    nestedGroups = nestedGroups.slice(0, nestedGroups.length - 1);

    const links = nestedGroups.reduce((components, part, index) => {
      const id = encodeURIComponent(nestedGroups.slice(0, index + 1).join("/"));

      components.push(
        this.getMinorLink(
          part,
          id,
          componentKey++,
          minorLinkClasses,
          minorLinkAnchorClasses
        )
      );

      if (index !== nestedGroups.length - 1) {
        components.push(this.getCrumbDivider(componentKey++));
      }

      return components;
    }, []);

    return [this.getServicesLink(componentKey++), ...links];
  }

  getMajorLink() {
    const { serviceLink } = this.props;
    const label = this.getServicePathParts().pop();

    const anchorClasses = classNames("table-cell-link-primary");

    return (
      <Link
        className={anchorClasses}
        to={serviceLink}
        title={label}
        style={{
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </Link>
    );
  }

  getServicesLink(key) {
    const minorLinkClasses = classNames("text-overflow service-link");
    const minorLinkAnchorClasses = classNames("table-cell-link-secondary");

    return (
      <div key={key} className="table-cell-value">
        <div className={minorLinkClasses}>
          <Link
            className={minorLinkAnchorClasses}
            to="/services"
            title="services"
          >
            <Trans render="span">Services</Trans>
          </Link>
        </div>
      </div>
    );
  }

  getServicePathParts() {
    return decodeURIComponent(this.props.serviceID).split("/");
  }

  render() {
    const classes = classNames("nested-service-links", "service-breadcrumb");

    const minorLinkWrapperClasses = classNames(
      "table-cell-details-secondary flex",
      "flex-align-items-center table-cell-flex-box",
      "service-breadcrumb-crumb"
    );

    return (
      <div className={classes}>
        {this.getMajorLink()}
        <div className={minorLinkWrapperClasses}>{this.getMinorLinks()}</div>
      </div>
    );
  }
}
