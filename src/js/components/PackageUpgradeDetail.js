import classNames from 'classnames';
import React from 'react';

import HealthLabels from '../constants/HealthLabels';
import HealthStatus from '../constants/HealthStatus';
import SegmentedProgressBar from './charts/SegmentedProgressBar';
import ServicePlanBlocks from './ServicePlanBlocks';
import ServicePlanStatusTypes from '../constants/ServicePlanStatusTypes';
import ServicePlanStore from '../stores/ServicePlanStore';

const METHODS_TO_BIND = ['handleUpgradePause', 'handleShowDetails'];

class PackageUpgradeDetail extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      detailsExpanded: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleDecisionConfirm(servicePlan) {
    console.log('confirm', servicePlan);
  }

  handleDecisionRollback(servicePlan) {
    console.log('rollback', servicePlan);
  }

  handleShowDetails() {
    this.setState({detailsExpanded: !this.state.detailsExpanded});
  }

  handleUpgradePause() {
    ServicePlanStore.interruptPlan(this.props.service.id);
  }

  getActiveDecisionPoint(activePhase) {
    let decisionPointBlock = null;

    activePhase.getBlocks().getItems().some(function (block) {
      if (block.hasDecisionPoint()) {
        decisionPointBlock = block;
      }

      return block.hasDecisionPoint();
    });

    return decisionPointBlock;
  }

  getFooter(servicePlan) {
    let decisionPoint;
    let footerContent;

    if (servicePlan.isWaiting()) {
      let activePhase = servicePlan.getPhases().getActive();
      let content;
      decisionPoint = this.getActiveDecisionPoint(activePhase);
      let heading = phaseLabel;
      let phaseLabel = activePhase.getName();

      if (!!decisionPoint) {
        content = 'We deployed the new configuration to block ' +
          `"${decisionPoint.getID()}" Please check your system health and ` +
          'press Continue.';
        heading = `${heading} Configuration Check`;
      } else {
        content = (
          <span>
            {`${phaseLabel} requires updating ${this.props.service.getName()} `}
            configuration to {activePhase.getID()}.
            {' Please press continue to begin.'}
          </span>
        );
      }

      footerContent = (
        <div className="container container-pod container-pod-short flush-top">
          <h3 className="flush-top">{heading}</h3>
          <p className="short flush-bottom">{content}</p>
        </div>
      )
    }

    return (
      <div className="upgrade-package-modal-footer">
        {footerContent}
        <div className="button-collection flush">
          {this.getFooterActionItems(decisionPoint)}
        </div>
      </div>
    );
  }

  getFooterActionItems(decisionPoint) {
    let actionItems = [
      <button className="button button-stroke" onClick={this.handleHideModal}
        key="hide-button">
        Hide
      </button>
    ];

    if (!!decisionPoint) {
      actionItems.concat[
        (
          <button className="button button-danger" key="rollback-upgrade"
            onClick={this.handleDecisionRollback}>
            Rollback
          </button>
        ),
        (
          <button className="button button-success" key="continue-upgrade"
            onClick={this.handleDecisionConfirm}>
            Continue
          </button>
        )
      ];
    } else {
      actionItems.push(
        <button className="button" onClick={this.handleUpgradePause}
          key="pause-upgrade">
          Pause Upgrade
        </button>
      );
    }

    return actionItems;
  }

  getPhaseProgress(servicePlan) {
    const phaseStatusMap = {
      [ServicePlanStatusTypes.COMPLETE]: 'complete',
      [ServicePlanStatusTypes.ERROR]: 'error',
      [ServicePlanStatusTypes.IN_PROGRESS]: 'ongoing',
      [ServicePlanStatusTypes.PENDING]: 'upcoming',
      [ServicePlanStatusTypes.WAITING]: 'waiting'
    };

    return servicePlan.getPhases().getItems().map(function (phase) {
      return {
        upgradeState: phaseStatusMap[phase.status]
      };
    });
  }

  getProgressBarLabels(servicePlan) {
    let planPhases = servicePlan.getPhases();
    let phaseCount = planPhases.getItems().length;
    let activePhaseIndex = planPhases.getActiveIndex();

    return {
      primaryTitle: `Phase ${activePhaseIndex + 1} of ${phaseCount}`,
      secondaryTitle: planPhases.getActive().getName()
    }
  }

  getUpgradeDecisionPoint(servicePlan) {
    console.log('get upgrade decision point', servicePlan);
  }

  getVersionNumber(service) {
    return service.getMetadata().version;
  }

  render() {
    let {service, servicePlan} = this.props;

    let detailsLabel = 'Show Details';
    let modalContentClasses = classNames('upgrade-package-modal modal-content',
      'allow-overflow', {
        'is-paused': servicePlan.isPending()
      });
    let {primaryTitle, secondaryTitle} = this.getProgressBarLabels(servicePlan);
    let serviceHealth = service.getHealth();
    let showDetailsButtonWrapperClasses = classNames(
      'upgrade-package-modal-details-button', {
        'is-expanded': this.state.detailsExpanded
      });
    let upgradeDetails;

    if (this.state.detailsExpanded) {
      detailsLabel = 'Hide Details';
      upgradeDetails = (
        <ServicePlanBlocks
          service={service}
          servicePlan={servicePlan} />
      );
    }

    return (
      <div>
        <div className={modalContentClasses}>
          <div className="modal-content-inner horizontal-center
            text-align-center">
            <div className="container container-pod container-pod-short">
              <div className="icon icon-jumbo icon-image-container
                icon-app-container">
                <img src={service.getImages()['icon-large']} />
              </div>
              <h2 className="short">{service.getName()}</h2>
              <p className="flush">
                {service.getName()} {this.getVersionNumber(service)}
              </p>
              <p className="text-align-center flush">
                {HealthLabels[HealthStatus[serviceHealth.key].key]}
              </p>
            </div>
            <div className="container container-pod container-pod-short
              container-pod-super-short">
              <SegmentedProgressBar
                segments={this.getPhaseProgress(servicePlan)}
                stackedProgressBarClassName="service-plan-progress-bar stacked-progress-bar"
                primaryTitle={primaryTitle} secondaryTitle={secondaryTitle} />
            </div>
            <div className="container container-pod container-pod-super-short
              flush-bottom upgrade-package-modal-details">
              <div className={showDetailsButtonWrapperClasses}>
                <button className="button button-small button-short
                  button-stroke button-rounded button-extended"
                  onClick={this.handleShowDetails}>
                  {detailsLabel}
                </button>
              </div>
              {upgradeDetails}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {this.getFooter(servicePlan)}
        </div>
      </div>
    );
  }
}

PackageUpgradeDetail.propTypes = {
  service: React.PropTypes.object,
  serviceName: React.PropTypes.string
};

module.exports = PackageUpgradeDetail;
