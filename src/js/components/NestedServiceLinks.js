import { Trans } from "@lingui/macro";
import classNames from "classnames/dedupe";
import { Link } from "react-router";
import PropTypes from "prop-types";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXxs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

class NestedServiceLinks extends React.Component {
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
    const { minorLinkClassName, minorLinkAnchorClassName } = this.props;
    const minorLinkClasses = classNames(
      "text-overflow service-link",
      minorLinkClassName
    );
    const minorLinkAnchorClasses = classNames(
      "table-cell-link-secondary",
      minorLinkAnchorClassName
    );
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
    const { majorLinkAnchorClassName, serviceLink } = this.props;
    const label = this.getServicePathParts().pop();

    const anchorClasses = classNames(
      "table-cell-link-primary",
      majorLinkAnchorClassName
    );

    return (
      <Link className={anchorClasses} to={serviceLink} title={label}>
        <span className="text-overflow">{label}</span>
      </Link>
    );
  }

  getServicesLink(key) {
    const minorLinkClasses = classNames(
      "text-overflow service-link",
      this.props.minorLinkClassName
    );

    const minorLinkAnchorClasses = classNames(
      "table-cell-link-secondary",
      this.props.minorLinkAnchorClassName
    );

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
    const {
      className,
      majorLinkClassName,
      minorLinkWrapperClassName
    } = this.props;

    const classes = classNames("nested-service-links", className);

    const majorLinkClasses = classNames("text-overflow", majorLinkClassName);

    const minorLinkWrapperClasses = classNames(
      "table-cell-details-secondary flex",
      "flex-align-items-center table-cell-flex-box",
      minorLinkWrapperClassName
    );

    return (
      <div className={classes}>
        <div className={majorLinkClasses}>{this.getMajorLink()}</div>
        <div className={minorLinkWrapperClasses}>{this.getMinorLinks()}</div>
      </div>
    );
  }
}

NestedServiceLinks.defaultProps = {};

const classPropType = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object,
  PropTypes.string
]);

NestedServiceLinks.propTypes = {
  serviceLink: PropTypes.string.isRequired,
  serviceID: PropTypes.string.isRequired,
  // Classes
  className: classPropType,
  majorLinkAnchorClassName: classPropType,
  majorLinkClassName: classPropType,
  minorLinkAnchorClassName: classPropType,
  minorLinkClassName: classPropType,
  minorLinkWrapperClassName: classPropType
};

module.exports = NestedServiceLinks;
