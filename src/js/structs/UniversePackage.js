import Item from './Item';
import FrameworkUtil from '../utils/FrameworkUtil';
import Util from '../utils/Util';

// TODO (John): Remove all randomized data.
function randomBoolean() {
  return Math.floor(Math.random() * 10) >= 5;
}

class UniversePackage extends Item {
  constructor() {
    super(...arguments);

    this._isDecisionPointActive = randomBoolean();
    this._isUpgradeAvailable = randomBoolean();
    this._isUpgradePaused = randomBoolean();
    this._isUpgrading = randomBoolean();
  }

  getActiveBlock() {
    return Math.floor(Math.random() * 10) + 1;
  }

  getActiveDecisionPoint() {
    return this.getActiveBlock();
  }

  getAppId() {
    return this.get('appId');
  }

  getAppIdName() {
    let appId = this.getAppId();
    // Remove initial slash if present
    if (appId.charAt(0) === '/') {
      appId = appId.slice(1);
    }

    return appId;
  }

  getBlockCount() {
    return this.getActiveBlock() + 10;
  }

  getDecisionPointCount() {
    return this.getActiveBlock() + 10;
  }

  getIcons() {
    return FrameworkUtil.getServiceImages(
      this.get('images') ||
      Util.findNestedPropertyInObject(
        this.get('resourceDefinition'), 'images'
      ) ||
      Util.findNestedPropertyInObject(this.get('resource'), 'images')
    );
  }

  getName() {
    return this.get('packageDefinition').name;
  }

  getScreenshots() {
    return Util.findNestedPropertyInObject(
      this.get('resource'),
      'images.screenshots'
    );
  }

  isSelected() {
    if (this.get('package') && this.get('package').hasOwnProperty('selected')) {
      return this.get('package').selected;
    }

    return this.get('selected');
  }

  getMaintainer() {
    return Util.findNestedPropertyInObject(
      this.get('package'),
      'maintainer'
    );
  }

  getPackage() {
    return this.get('package');
  }

  getPreinstallNotes() {
    return Util.findNestedPropertyInObject(
      this.get('package'),
      'preInstallNotes'
    );
  }

  getPostInstallNotes() {
    return Util.findNestedPropertyInObject(
      this.get('package'),
      'postInstallNotes'
    );
  }

  getPostUninstallNotes() {
    return Util.findNestedPropertyInObject(
      this.get('packageDefinition'),
      'postUninstallNotes'
    );
  }

  // TODO (John): Use actual data.
  getUpgradeVersions() {
    return ['0.1.0', '0.1.5', '0.2.0', '0.2.5'];
  }

  getCurrentVersion() {
    return this.get('packageDefinition').version;
  }

  isDecisionPointActive() {
    return this._isDecisionPointActive;
  }

  isUpgradeAvailable() {
    return this._isUpgradeAvailable;
  }

  isUpgradePaused() {
    return this._isUpgradePaused;
  }

  isUpgrading() {
    return this._isUpgrading;
  }
}

module.exports = UniversePackage;
