import classNames from 'classnames/dedupe';
import {Link} from 'react-router';
import React, {PropTypes} from 'react';

import Icon from './Icon';

class NestedServiceLinks extends React.Component {

  getMinorLink(label, params, key, classes) {
    return (
      <div key={key} className="table-cell-value">
        <div className={classes}>
          <Link to="services-detail"
              params={params}
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
    let {minorLinkClassName, taskID} = this.props;
    let minorLinkClasses = classNames(
      'text-overflow service-link',
      minorLinkClassName
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
        this.getMinorLink(part, {id}, componentKey++, minorLinkClasses)
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
    let params;
    let {serviceID, taskID} = this.props;
    let routeName;

    if (taskID != null) {
      label = taskID;
      params = {
        id: serviceID,
        taskID
      }
      routeName = 'services-task-details';
    } else {
      label = this.getServicePathParts().pop();
      params = {id: encodeURIComponent(serviceID)};
      routeName = 'services-detail';
    }

    return (
      <Link to={routeName}
        params={params}
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

    return (
       <div key={key} className="table-cell-value">
        <div className={minorLinkClasses}>
          <Link to="services-page"
              title="services">
            services
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

    let classes = classNames(
      'container container-fluid container-pod',
      'flush flush-top flush-bottom',
      className
    );

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
  taskID: null,
  className: 'inverse',
  minorLinkClassName: 'inverse'
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
  majorLinkClassName: classPropType,
  minorLinkClassName: classPropType,
  minorLinkWrapperClassName: classPropType
};

module.exports = NestedServiceLinks;
