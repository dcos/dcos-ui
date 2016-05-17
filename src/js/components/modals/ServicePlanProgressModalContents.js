import classNames from 'classnames';
import React from 'react';

import HealthLabels from '../../constants/HealthLabels';
import HealthStatus from '../../constants/HealthStatus';
import IconWarning from '../icons/IconWarning';
import IconCircleCheckmark from '../icons/IconCircleCheckmark';
import SegmentedProgressBar from '../charts/SegmentedProgressBar';
import ServicePlan from '../../structs/ServicePlan';
import ServicePlanBlock from '../../structs/ServicePlanBlock';
import ServicePlanBlocks from '../ServicePlanBlocks';
import ServicePlanStore from '../../stores/ServicePlanStore';

const METHODS_TO_BIND = [
  'handleDecisionConfirm',
  'handleDecisionRollback',
  'handleHideModal',
  'handleUpgradePause',
  'handleShowDetails'
];

class ServicePlanProgressModalContents extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      detailsExpanded: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleDecisionConfirm() {
    ServicePlanStore.continuePlan(this.props.service.id);
  }

  handleDecisionRollback() {
    // TODO: Put rollback command here.
  }

  handleHideModal() {
    this.props.onClose();
  }

  handleShowDetails() {
    this.setState({detailsExpanded: !this.state.detailsExpanded});
  }

  handleUpgradePause() {
    ServicePlanStore.interruptPlan(this.props.service.id);
  }

  getActiveDecisionPointBlock(activePhase) {
    let decisionPointBlock = null;

    activePhase.getBlocks().getItems().some(function (block) {
      block = new ServicePlanBlock(block);

      if (block.hasDecisionPoint()) {
        decisionPointBlock = block;
      }

      return block.hasDecisionPoint();
    });

    return decisionPointBlock;
  }

  getCompleteMessage(serviceName) {
    return (
      <div className="service-plan-modal-success
        service-plan-modal-status container-pod text-align-center">
        <IconCircleCheckmark />
        <h3 className="service-plan-modal-status-title short">
          Success!
        </h3>
        <p className="flush-bottom">
          {serviceName} was successfully updated.
        </p>
      </div>
    );
  }

  getErrorMessage() {
    return (<div className="service-plan-modal-error service-plan-modal-status
      container-pod text-align-center">
      <IconWarning />
      <h3 className="service-plan-modal-status-title short">
        Invalid Configuration
      </h3>
      <p className="flush-bottom">
        Please review your configuration and try again.
      </p>
    </div>);
  }

  getFooter(servicePlan) {
    let decisionPointBlock;
    let footerContent;

    if (servicePlan.isWaiting()) {
      let activePhase = servicePlan.getPhases().getActive();
      decisionPointBlock = this.getActiveDecisionPointBlock(activePhase);

      footerContent = (
        <div className="container container-pod container-pod-short flush-top">
          <h5 className="service-plan-modal-footer-heading flush-top">
            {decisionPointBlock.getName()} Configuration Check
          </h5>
          <p className="service-plan-modal-footer-content short
            flush-bottom">
            We deployed the new configuration to
            block {decisionPointBlock.getName()}. Please check your system
            health and press Continue.
          </p>
        </div>
      );
    }

    return (
      <div className="service-plan-modal-footer">
        {footerContent}
        <div className="button-collection flush-bottom">
          {this.getFooterActionItems(decisionPointBlock)}
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
      actionItems = actionItems.concat([
        <button className="button button-danger" key="rollback-upgrade"
          onClick={this.handleDecisionRollback}>
          Rollback
        </button>,
        <button className="button button-success" key="continue-upgrade"
          onClick={this.handleDecisionConfirm}>
          Continue
        </button>
      ]);
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
    return servicePlan.getPhases().getItems().map(function (phase) {
      return {upgradeState: phase.status};
    });
  }

  getProgressBarLabels(servicePlan, viewDetails) {
    let planPhases = servicePlan.getPhases();
    let phaseCount = planPhases.getItems().length;
    let activePhaseIndex = planPhases.getActiveIndex();

    return {
      primaryTitle: `Phase ${activePhaseIndex + 1} of ${phaseCount}`,
      secondaryTitle: (
        <span>
          {planPhases.getActive().getName()} {viewDetails}
        </span>
      )
    };
  }

  getVersionNumber(service) {
    return service.getMetadata().version;
  }

  render() {
    let {service, servicePlan} = this.props;

    if (!servicePlan) {
      return null;
    }

    if (servicePlan.hasError()) {
      return this.getErrorMessage();
    }

    if (servicePlan.isComplete()) {
      return this.getCompleteMessage(service.getMetadata().name);
    }

    let detailsLabel = 'Show Details';
    let modalContentClasses = classNames('service-plan-modal modal-content',
      'allow-overflow', {
        'is-paused': servicePlan.isPending()
      });
    let serviceHealth = service.getHealth();
    let upgradeDetails;

    if (this.state.detailsExpanded) {
      detailsLabel = 'Hide Details';
      upgradeDetails = (
        <ServicePlanBlocks service={service} servicePlan={servicePlan} />
      );
    }

    let hideShowDetails = (
      <span>
        (<a className="clickable" onClick={this.handleShowDetails}>
          {detailsLabel}
        </a>)
      </span>
    );

    let {primaryTitle, secondaryTitle} = this.getProgressBarLabels(
      servicePlan,
      hideShowDetails
    );

    let healthClasses = `text-align-center flush
      ${HealthStatus[serviceHealth.key].classNames}`;

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
              <p className={healthClasses}>
                {HealthLabels[HealthStatus[serviceHealth.key].key]}
              </p>
            </div>
            <div className="container container-pod container-pod-short
              container-pod-super-short">
              <SegmentedProgressBar
                segments={this.getPhaseProgress(servicePlan)}
                stackedProgressBarClassName="service-plan-progress-bar
                  stacked-progress-bar"
                primaryTitle={primaryTitle}
                secondaryTitle={secondaryTitle} />
            </div>
            <div className="container service-plan-modal-details">
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

ServicePlanProgressModalContents.propTypes = {
  service: React.PropTypes.object,
  servicePlan: React.PropTypes.instanceOf(ServicePlan)
};

module.exports = ServicePlanProgressModalContents;
