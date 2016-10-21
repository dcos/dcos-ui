import classNames from 'classnames/dedupe';
import {Link} from 'react-router';
import React, {PropTypes} from 'react';

import Icon from './Icon';

class NestedServiceLinks extends React.Component {

  getMinorLink(label, params, key, minorLinkClasses, minorLinkAnchorClasses) {
    return (
      <div key={key} className="table-cell-value">
        <div className={minorLinkClasses}>
          <Link
            className={minorLinkAnchorClasses}
            to={`/services/overview/${params.id}`}
              title={label}>
            {label}
          </Link>
        </div>
      </div>
    );
  }

  getCrumbDivider(key) {
    return (
      <Icon
        className="list-inline-separator"
        family="tiny"
        id="caret-right"
        key={key}
        size="tiny" />
    );
  }

  getMinorLinks() {
    let componentKey = 0;
    let {minorLinkClassName, minorLinkAnchorClassName, taskID} = this.props;
    let minorLinkClasses = classNames(
      'text-overflow service-link',
      minorLinkClassName
    );
    let minorLinkAnchorClasses = classNames(
      'table-cell-link-secondary',
      minorLinkAnchorClassName
    );
    let nestedGroups = this.getServicePathParts();
    let popCount = 1;

    if (taskID != null) {
      popCount = 0;
    }
    nestedGroups = nestedGroups.slice(0, nestedGroups.length - popCount);

    let links = nestedGroups.reduce((components, part, index) => {
      let id = encodeURIComponent(nestedGroups.slice(0, index + 1).join('/'));

      components.push(
        this.getMinorLink(
          part,
          {id},
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
    let label;
    let {majorLinkAnchorClassName, serviceID, taskID} = this.props;
    let routePath;

    let anchorClasses = classNames(
      'table-cell-link-primary',
      majorLinkAnchorClassName
    );

    if (taskID != null) {
      label = taskID;
      routePath = `/services/overview/${serviceID}/tasks/${taskID}`;
    } else {
      label = this.getServicePathParts().pop();
      routePath = `/services/overview/${encodeURIComponent(serviceID)}`;
    }

    return (
      <Link
        className={anchorClasses}
        to={routePath}
        title={label}>
        <span className="text-overflow">
          {label}
        </span>
      </Link>
    );
  }

  getServicesLink(key) {
    let minorLinkClasses = classNames(
      'text-overflow service-link',
      this.props.minorLinkClassName
    );

    let minorLinkAnchorClasses = classNames(
      'table-cell-link-secondary',
      this.props.minorLinkAnchorClassName
    );

    return (
       <div key={key} className="table-cell-value">
        <div className={minorLinkClasses}>
          <Link className={minorLinkAnchorClasses}
            to="/services"
            title="services">
            Services
          </Link>
        </div>
      </div>
    );
  }

  getServicePathParts() {
    return decodeURIComponent(this.props.serviceID).split('/');
  }

  render() {
    let {
      className,
      majorLinkClassName,
      minorLinkWrapperClassName
    } = this.props;

    let classes = classNames(className);

    let majorLinkClasses = classNames(
      'text-overflow',
      majorLinkClassName
    );

    let minorLinkWrapperClasses = classNames(
      'table-cell-details-secondary flex-box',
      'flex-box-align-vertical-center table-cell-flex-box',
      minorLinkWrapperClassName
    );

    return (
      <div className={classes}>
        <div className={majorLinkClasses}>
          {this.getMajorLink()}
        </div>
        <div className={minorLinkWrapperClasses}>
          {this.getMinorLinks()}
        </div>
      </div>
    );
  }
}

NestedServiceLinks.defaultProps = {
  taskID: null
};

const classPropType = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object,
  PropTypes.string
]);

NestedServiceLinks.propTypes = {
  serviceID: PropTypes.string.isRequired,
  taskID: PropTypes.string,
  // Classes
  className: classPropType,
  majorLinkAnchorClassName: classPropType,
  majorLinkClassName: classPropType,
  minorLinkAnchorClassName: classPropType,
  minorLinkClassName: classPropType,
  minorLinkWrapperClassName: classPropType
};

module.exports = NestedServiceLinks;
