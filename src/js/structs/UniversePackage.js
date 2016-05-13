import Item from './Item';
import FrameworkUtil from '../utils/FrameworkUtil';
import Util from '../utils/Util';

class UniversePackage extends Item {
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
}

module.exports = UniversePackage;
