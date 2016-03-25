import React from 'react';

import UpgradeProgressBar from './charts/UpgradeProgressBar';

const METHODS_TO_BIND = [
  'handleAnswerButtonClick',
  'handlePauseButtonClick',
  'handleResumeButtonClick',
  'handleUpgradeButtonClick',
  'handleViewProgressClick'
];

class PackageUpgradeOverview extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleAnswerButtonClick() {
    console.log(this.props.cosmosPackage);
  }

  handlePauseButtonClick() {
    console.log(this.props.cosmosPackage);
  }

  handleResumeButtonClick() {
    console.log(this.props.cosmosPackage);
  }

  handleUpgradeButtonClick() {
    if (this.props.onUpgradeClick) {
      this.props.onUpgradeClick(this.props.cosmosPackage);
    }
  }

  handleViewProgressClick() {
    console.log(this.props.cosmosPackage);
  }

  getAnswerButton() {
    return (
      <button className="button button-success button-small button-short
        button-fixed-width button-fixed-width-small flush"
        onClick={this.handleAnswerButtonClick}>
        Answer
      </button>
    );
  }

  getPauseButton() {
    return (
      <button className="button button-inverse button-small button-short
        button-fixed-width button-fixed-width-small flush"
        onClick={this.handlePauseButtonClick}>
        Pause
      </button>
    );
  }

  getResumeButton() {
    return (
      <button className="button button-success button-small button-short
        button-fixed-width button-fixed-width-small flush"
        onClick={this.handleResumeButtonClick}>
        Resume
      </button>
    );
  }

  getUpgradeButton() {
    return (
      <button className="button button-primary button-small button-short
        button-fixed-width button-fixed-width-small flush"
        onClick={this.handleUpgradeButtonClick}>
        Upgrade
      </button>
    );
  }

  getUpgradeProgressBar(cosmosPackage) {
    let label = this.getUpgradeProgressBarLabel(cosmosPackage);
    let labelAction = (
      <a className="clickable" onClick={this.handleViewProgressClick}>View</a>
    );
    let progress = 50;
    let progressState = 'ongoing';

    if (cosmosPackage.isDecisionPointActive()) {
      progressState = 'waiting';
    } else if (cosmosPackage.isUpgradePaused()) {
      progressState = 'paused';
    }

    return (
      <UpgradeProgressBar label={label} labelAction={labelAction}
        progress={progress} progressState={progressState} />
    );
  }

  getUpgradeProgressBarLabel(cosmosPackage) {
    if (cosmosPackage.isDecisionPointActive()) {
      return (
        <span className="emphasize">
          {`Decision Point ${cosmosPackage.getActiveDecisionPoint()} of
            ${cosmosPackage.getDecisionPointCount()}`}
        </span>
      );
    }

    if (cosmosPackage.isUpgradePaused()) {
      return (
        <span className="emphasize">Paused</span>
      );
    }

    return (
      <span>
        <span className="emphasize">Pre-Flight</span>:
        {` Block ${cosmosPackage.getActiveBlock()} of
          ${cosmosPackage.getBlockCount()}`}
      </span>
    );
  }

  render() {
    let cosmosPackage = this.props.cosmosPackage;
    let packageAction;
    let upgradeProgress;

    if (cosmosPackage.isDecisionPointActive()) {
      packageAction = this.getAnswerButton(cosmosPackage);
    } else if (cosmosPackage.isUpgradePaused()) {
      packageAction = this.getResumeButton(cosmosPackage);
    } else if (cosmosPackage.isUpgrading()) {
      packageAction = this.getPauseButton(cosmosPackage);
    } else if (cosmosPackage.isUpgradeAvailable()) {
      packageAction = this.getUpgradeButton(cosmosPackage);
    }

    if (cosmosPackage.isUpgrading()) {
      upgradeProgress = this.getUpgradeProgressBar(cosmosPackage);
    }

    return (
      <div className="button-collection flush flex-align-right">
        {upgradeProgress}
        {packageAction}
      </div>
    );
  }
}

module.exports = PackageUpgradeOverview;
