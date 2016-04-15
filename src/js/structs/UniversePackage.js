import Item from './Item';
import ServiceUtil from '../utils/ServiceUtil';
import Util from '../utils/Util';

class UniversePackage extends Item {
  getIcons() {
    return ServiceUtil.getServiceImages(
      this.get('images') ||
      Util.findNestedPropertyInObject(
        this.get('resourceDefinition'), 'images'
      ) ||
      Util.findNestedPropertyInObject(this.get('resource'), 'images')
    );
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
}

module.exports = UniversePackage;
