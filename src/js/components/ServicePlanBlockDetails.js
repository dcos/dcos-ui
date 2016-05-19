import classNames from 'classnames';
import React from 'react';
import {Tooltip} from 'reactjs-components';

import IconUpgradeBlock from './icons/IconUpgradeBlock';
import IconUpgradeBlockDecisionPoint from './icons/IconUpgradeBlockDecisionPoint';
import ServicePlanStore from '../stores/ServicePlanStore';

const METHODS_TO_BIND = [
  'handleBlockMouseEnter',
  'handleBlockMouseLeave',
  'handleExternalClick'
];

class ServicePlanBlocks extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      detailsExpanded: false,
      hoveredBlock: null,
      selectedBlock: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    window.addEventListener('click', this.handleExternalClick);
  }

  handleBlockClick(block, event) {
    // Stop event from propagating to window, which would dismiss the tooltip
    // that we're trying to open.
    event.stopPropagation();

    this.handleExternalClick();
    this.setState({selectedBlock: block});
    this.refs[block.getID()].triggerOpen();
  }

  handleExternalClick() {
    if (!!this.state.selectedBlock) {
      this.refs[this.state.selectedBlock.getID()].triggerClose();
      this.setState({selectedBlock: null});
    }
  }

  handleBlockRestart(blockID, phaseID) {
    ServicePlanStore.restartBlock(this.props.service.id, blockID, phaseID);
  }

  handleBlockForceComplete(blockID, phaseID) {
    ServicePlanStore.forceCompleteBlock(
      this.props.service.id,
      blockID,
      phaseID
    );
  }

  handleBlockMouseEnter(block) {
    this.setState({hoveredBlock: block});
  }

  handleBlockMouseLeave() {
    this.setState({hoveredBlock: null});
  }

  getUpgradeBlocks(phaseBlocks, activePhase) {
    let blocks = phaseBlocks.getItems().map((block, blockIndex) => {
      let {selectedBlock} = this.state;

      let hasDecisionPoint = block.hasDecisionPoint();
      let isActive = block.isInProgress();
      let isComplete = block.isComplete();

      if (isComplete && hasDecisionPoint) {
        hasDecisionPoint = false;
      }

      let blockClassName = classNames('service-plan-modal-details-block', {
        'has-decision-point': hasDecisionPoint,
        'is-active': isActive,
        'is-selected': selectedBlock && selectedBlock.getID() === block.getID(),
        'is-complete': isComplete
      });

      let blockIcon = <IconUpgradeBlock />

      if (hasDecisionPoint) {
        blockIcon = <IconUpgradeBlockDecisionPoint />;
      }

      return (
        <div className={blockClassName} key={blockIndex}
          onClick={this.handleBlockClick.bind(this, block)}
          onMouseEnter={this.handleBlockMouseEnter.bind(this, block)}
          onMouseLeave={this.handleBlockMouseLeave}>
          <Tooltip
            content={this.getUpgradeBlockTooltipContent({
              block,
              blockIndex,
              activePhase
            })}
            interactive={true}
            ref={block.getID()}
            stayOpen={true}
            suppress={true}>
            <div className="service-plan-modal-details-block-content">
              {blockIcon}
            </div>
          </Tooltip>
        </div>
      );
    });

    return (
      <div className="service-plan-modal-details-blocks">
        {blocks}
      </div>
    );
  }

  getUpgradeBlockTooltipContent(blockDetails) {
    let {activePhase, block, blockIndex} = blockDetails;
    let activePhaseID = activePhase.getID();
    let blockID = block.getID();
    let blockOptions = [];
    let blockLabelSeparator = ': ';

    if (block.isComplete() || block.isInProgress()) {
      blockOptions.push(
        <a
          className="clickable"
          key="restart"
          onClick={this.handleBlockRestart.bind(
            this,
            blockID,
            activePhaseID
          )}>
          Restart
        </a>
      );
    }

    if (!block.isComplete() || block.isPending()) {
      blockOptions.push(
        <a
          className="clickable"
          key="force-complete"
          onClick={this.handleBlockForceComplete.bind(
            this,
            blockID,
            activePhaseID
          )}>
          Force Complete
        </a>
      );
    }

    return (
      <span className="service-plan-modal-details-block-tooltip">
        <span className="service-plan-modal-details-block-label">
          <strong>Block {blockIndex + 1}</strong>{blockLabelSeparator}
        </span>
        {blockOptions}
      </span>
    );
  }

  render() {
    let {hoveredBlock, selectedBlock} = this.state;
    let {servicePlan} = this.props;
    let activePhase = servicePlan.getPhases().getActive();
    let phaseBlocks = activePhase.getBlocks();
    let blockCount = phaseBlocks.getItems().length;

    let blocksHeadingContent = `Completed ${phaseBlocks.getComplete().length} of ${blockCount}`;

    if (!!selectedBlock || !!hoveredBlock) {
      let focusedBlock = selectedBlock || hoveredBlock;
      blocksHeadingContent = `${focusedBlock.getName()}: ${focusedBlock.getStatus()}`;
    }

    return (
      <div className="service-plan-modal-details-content text-align-left
        container container-pod container-pod-super-short flush-bottom">
        <span className="service-plan-modal-details-heading">
          {blocksHeadingContent}
        </span>
        {this.getUpgradeBlocks(phaseBlocks, activePhase)}
      </div>
    );
  }
}

ServicePlanBlocks.propTypes = {
  service: React.PropTypes.object,
  serviceName: React.PropTypes.string
};

module.exports = ServicePlanBlocks;
