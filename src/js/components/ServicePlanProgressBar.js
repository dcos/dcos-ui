import classNames from 'classnames';
import React from 'react';

import ServicePlan from '../structs/ServicePlan';

const labelMap = {
  'InProgress': 'Updating'
};

class ServicePlanProgressBar extends React.Component {
  getPhaseLabel(servicePlan) {
    let phases = servicePlan.getPhases();

    return (
      <span className="text-overflow-break-word">
        Phase {phases.getActiveIndex()} of {phases.getItems().length}:
        {` ${phases.getActive().getName()} `}
        <a className="clickable" onClick={this.props.onViewDetailsClick}>
          View Details
        </a>
      </span>
    );
  }

  getStatusLabel(servicePlan) {
    let status = servicePlan.getStatus();

    return labelMap[status] || status;
  }

  render() {
    let {
      className,
      fillClassName,
      fillWrapperClassName,
      phaseLabelClassName,
      progress,
      servicePlan,
      statusLabelClassName
    } = this.props;

    let fillClasses = classNames('progress-bar-fill', fillClassName);
    let fillWrapperClasses = classNames(
      'progress-bar-fill-wrapper',
      fillWrapperClassName
    );
    let phaseLabelClasses = classNames(
      'progress-bar-label-action',
      phaseLabelClassName
    );
    let serviceStatusWrapperClasses = classNames({
      'is-erroneous': servicePlan.hasError(),
      'is-ongoing': servicePlan.isInProgress(),
      'is-paused': servicePlan.isPending(),
      'is-waiting': servicePlan.isWaiting()
    });
    let statusLabelClasses = classNames(
      'progress-bar-label',
      statusLabelClassName
    );
    let wrapperClasses = classNames(
      'upgrade-progress-bar',
      serviceStatusWrapperClasses,
      className
    );

    return (
      <div className={wrapperClasses}>
        <span className={statusLabelClasses}>
          {this.getStatusLabel(servicePlan)}
        </span>
        <div className={fillWrapperClasses}>
          <div className={fillClasses} style={{width: `${progress}%`}} />
        </div>
        <span className={phaseLabelClasses}>
          {this.getPhaseLabel(servicePlan)}
        </span>
      </div>
    );
  }
}

ServicePlanProgressBar.defaultProps = {
  progress: 100,
  stacked: true
};

ServicePlanProgressBar.propTypes = {
  className: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  fillClassName: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  fillWrapperClassName: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  onViewDetailsClick: React.PropTypes.func,
  phaseLabelClassName: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  progress: React.PropTypes.number,
  servicePlan: React.PropTypes.instanceOf(ServicePlan),
  stacked: React.PropTypes.bool,
  statusLabelClassName: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = ServicePlanProgressBar;
