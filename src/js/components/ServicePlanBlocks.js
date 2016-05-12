import classNames from 'classnames';
import {Tooltip} from 'reactjs-components';
import React from 'react';

import IconUpgradeBlock from './icons/IconUpgradeBlock';
import ServicePlanBlock from '../structs/ServicePlanBlock';

const METHODS_TO_BIND = ['handleExternalClick'];

let activeTooltip;

class ServicePlanBlocks extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      detailsExpanded: false
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
    activeTooltip = block.getID();
    this.refs[block.getID()].triggerOpen();
  }

  handleExternalClick() {
    if (this.refs[activeTooltip]) {
      this.refs[activeTooltip].triggerClose();
      activeTooltip = null;
    }
  }

  handleBlockRestart(block) {
    console.log(block);
  }

  handleBlockForceComplete(block) {
    console.log(block);
  }

  getUpgradeBlocks(phaseBlocks) {
    let blocks = [];
    let upgradeBlocks = phaseBlocks.getItems();

    upgradeBlocks.forEach((block, blockIndex) => {
      block = new ServicePlanBlock(block);

      let hasDecisionPoint = block.hasDecisionPoint();
      let isActive = block.isInProgress();
      let isComplete = block.isComplete();

      if (isComplete && hasDecisionPoint) {
        hasDecisionPoint = false;
      }

      let blockClassName = classNames('upgrade-package-modal-details-block', {
        'has-decision-point': hasDecisionPoint,
        'is-active': isActive,
        'is-complete': isComplete
      });

      blocks.push(
        <div className={blockClassName} key={blockIndex}
          onClick={this.handleBlockClick.bind(this, block)}>
          <Tooltip
            content={this.getUpgradeBlockTooltipContent({
              block,
              blockIndex
            })}
            suppress={true}
            ref={block.getID()}
            interactive={true}
            stayOpen={true}>
            <div className="upgrade-package-modal-details-block-content">
              <IconUpgradeBlock hasDecisionPoint={hasDecisionPoint} />
            </div>
          </Tooltip>
        </div>
      );
    });

    return (
      <div className="upgrade-package-modal-details-blocks">
        {blocks}
      </div>
    );
  }

  getUpgradeBlockTooltipContent(blockDetails) {
    let {block, blockIndex} = blockDetails;
    let blockOptions = [];
    let blockLabelSeparator = ': ';

    if (block.isComplete() || block.isInProgress()) {
      blockOptions.push(
        <a
          className="clickable"
          key="restart"
          onClick={this.handleBlockRestart.bind(this, block)}>
          Restart
        </a>
      );
    }

    if (!block.isComplete() || block.isPending()) {
      blockOptions.push(
        <a
          className="clickable"
          key="force-complete"
          onClick={this.handleBlockForceComplete.bind(this, block)}>
          Force Complete
        </a>
      );
    }

    return (
      <span className="upgrade-package-modal-details-block-tooltip">
        <span className="upgrade-package-modal-details-block-label">
          <strong>Block {blockIndex + 1}</strong>{blockLabelSeparator}
        </span>
        {blockOptions}
      </span>
    );
  }

  render() {
    let {servicePlan} = this.props;
    let activePhase = servicePlan.getPhases().getActive();
    let phaseBlocks = activePhase.getBlocks();
    let blockCount = phaseBlocks.getItems().length;

    return (
      <div className="upgrade-package-modal-details-content text-align-left
        container container-pod container-pod-super-short flush-bottom">
        <span className="upgrade-package-modal-details-heading">
          Updating {phaseBlocks.getActiveBlockCount()} of {blockCount}
        </span>
        {this.getUpgradeBlocks(phaseBlocks)}
      </div>
    );
  }
}

ServicePlanBlocks.propTypes = {
  service: React.PropTypes.object,
  serviceName: React.PropTypes.string
};

module.exports = ServicePlanBlocks;
