import Item from "./Item";
import FrameworkUtil
  from "../../../plugins/services/src/js/utils/FrameworkUtil";
import Util from "../utils/Util";

class UniversePackage extends Item {
  getActiveBlock() {
    return Math.floor(Math.random() * 10) + 1;
  }

  getActiveDecisionPoint() {
    return this.getActiveBlock();
  }

  getAppId() {
    return this.get("appId");
  }

  getAppIdName() {
    let appId = this.getAppId();
    // Remove initial slash if present
    if (appId.charAt(0) === "/") {
      appId = appId.slice(1);
    }

    return appId;
  }

  getBlockCount() {
    return this.getActiveBlock() + 10;
  }

  getConfig() {
    return this.get("config");
  }

  getDescription() {
    return this.get("description");
  }

  getDecisionPointCount() {
    return this.getActiveBlock() + 10;
  }

  getIcons() {
    return FrameworkUtil.getServiceImages(
      Util.findNestedPropertyInObject(this.get("resource"), "images")
    );
  }

  getName() {
    return this.get("name");
  }

  getScreenshots() {
    return Util.findNestedPropertyInObject(
      this.get("resource"),
      "images.screenshots"
    );
  }

  getLicenses() {
    return this.get("licenses") || [];
  }

  getMaintainer() {
    return this.get("maintainer");
  }

  getPreInstallNotes() {
    return this.get("preInstallNotes");
  }

  getPostInstallNotes() {
    return this.get("postInstallNotes");
  }

  getPostUninstallNotes() {
    return this.get("postUninstallNotes");
  }

  getSCM() {
    return this.get("scm");
  }

  getCurrentVersion() {
    return this.get("currentVersion");
  }

  getTags() {
    return this.get("tags") || [];
  }

  isCLIOnly() {
    return !Util.findNestedPropertyInObject(
      this.get("marathon"),
      "v2AppMustacheTemplate"
    );
  }

  isSelected() {
    return this.get("selected");
  }
}

module.exports = UniversePackage;
