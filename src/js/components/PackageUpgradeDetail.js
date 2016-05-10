import classNames from 'classnames';
import {Tooltip} from 'reactjs-components';
import React from 'react';

import HealthLabels from '../constants/HealthLabels';
import HealthStatus from '../constants/HealthStatus';
import IconUpgradeBlock from './icons/IconUpgradeBlock';
import SegmentedProgressBar from './charts/SegmentedProgressBar';
import ServicePlanStatusTypes from '../constants/ServicePlanStatusTypes';

const METHODS_TO_BIND = ['handleShowDetails'];

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
    console.log('confirm');
  }

  handleDecisionRollback(servicePlan) {
    console.log('rollback');
  }

  handleShowDetails() {
    this.setState({detailsExpanded: !this.state.detailsExpanded});
  }

  handleUpgradePause() {
    console.log('pause upgrade');
  }

  getActiveDecisionPoint(activePhase) {
    let decisionPointBlock = null;

    activePhase.getBlocks().getItems().some(function (block, index) {
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
    // TODO: Return the currently active block.
    let planPhases = servicePlan.getPhases();
    let phaseCount = planPhases.getItems().length;
    let activePhaseIndex = planPhases.getActiveIndex();

    return {
      primaryTitle: `Phase ${activePhaseIndex + 1} of ${phaseCount}`,
      secondaryTitle: planPhases.getActive().getName()
    }
  }

  getUpgradeBlocks(servicePlan) {
    let activeBlock = servicePlan.getActiveBlock();
    let blocks = [];
    let decisionPoints = servicePlan.getDecisionPointIndices();
    let numUpgradeBlocks = servicePlan.getBlockCount();

    for (let blockIndex = 0; blockIndex < numUpgradeBlocks; blockIndex++) {
      let hasDecisionPoint = decisionPoints.indexOf(blockIndex) > -1;
      let isActive = blockIndex === activeBlock
      let isComplete = blockIndex < activeBlock;

      if (isComplete && hasDecisionPoint) {
        hasDecisionPoint = false;
      }

      let blockClassName = classNames('upgrade-package-modal-details-block', {
        'has-decision-point': hasDecisionPoint,
        'is-active': isActive,
        'is-complete': isComplete
      });

      blocks.push(
        <div className={blockClassName} key={blockIndex}>
          <Tooltip content={this.getUpgradeBlockTooltipContent({activeBlock,
            blockIndex, servicePlan})} interactive={true}>
            <div className="upgrade-package-modal-details-block-content">
              <IconUpgradeBlock hasDecisionPoint={hasDecisionPoint} />
            </div>
          </Tooltip>
        </div>
      );
    }

    return (
      <div className="upgrade-package-modal-details-blocks">
        {blocks}
      </div>
    );
  }

  getUpgradeBlockTooltipContent(blockDetails) {
    return (
      <span>
        <span className="upgrade-package-modal-details-block-label">
          <strong>Block {blockDetails.blockIndex}</strong>:
        </span>
        <a href="#">Restart</a> <a href="#">Force Complete</a>
      </span>
    );
  }

  getUpgradeDecisionPoint(servicePlan) {

  }

  getVersionNumber(service) {
    return service.getMetadata().version;
  }

  getUpgradeDetails(servicePlan) {
    let upgradePhases = servicePlan.getPhases().getItems();
    let currentPhaseIndex = -1;

    upgradePhases.some(function (phase, phaseIndex) {
      if (phase.upgradeState === 'ongoing') {
        currentPhaseIndex = phaseIndex + 1;
        return true;
      }
    });

    return (
      <div className="upgrade-package-modal-details-content text-align-left
        container container-pod container-pod-short flush-bottom">
        <span className="upgrade-package-modal-details-heading">
          <strong>Phase {currentPhaseIndex} of {upgradePhases.length}:</strong>
          {' '}{servicePlan.getCurrentPhase().status}
        </span>
        <span className="upgrade-package-modal-details-subheading">
          {`Upgrading Block ${servicePlan.getActiveBlock()} of
          ${servicePlan.getBlockCount()} to ${servicePlan.getUpgradeSHA()}`}
        </span>
        {this.getUpgradeBlocks(servicePlan)}
      </div>
    );
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
      upgradeDetails = this.getUpgradeDetails(servicePlan);
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
            <div className="container container-pod container-pod-short
              container-pod-super-short upgrade-package-modal-details">
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
  serviceName: React.PropTypes.string,
  servicePlan: React.PropTypes.object
};

module.exports = PackageUpgradeDetail;
